import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { getTenantSettings } from '@/lib/tenant'
import { isConsignmentEnabled } from '@/lib/features'
import { buildPlaceholderValues, renderTemplate } from '@/lib/documents/placeholders'
import { parseCustomFields } from '@/lib/documents/schema'

const schema = z.object({
  vehicleId: z.string().min(1),
  party: z.enum(['buyer', 'consignor']),
  templateIds: z.array(z.string().min(1)).min(1, 'Vyberte aspoň jeden dokument'),
  fieldValues: z.record(z.string()).default({}),
  /**
   * Rozpracovaný predaj — vozidlo ešte nie je predané. Zmluvy sa pripravia
   * z týchto údajov, aby si ich používateľ mohol skontrolovať ešte predtým,
   * než predaj potvrdí.
   */
  draftSale: z
    .object({
      customerId: z.string().min(1),
      soldPrice: z.number().positive(),
      soldAt: z.string().datetime().optional(),
      soldNote: z.string().optional(),
      commissionRate: z.number().min(0).max(100).nullable().optional(),
    })
    .optional(),
})

/**
 * Doplní premenné do vybraných šablón a vráti hotové HTML na úpravu.
 * Nič neukladá — ukladá sa až finálne znenie cez /api/documents/generated.
 */
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const parsed = schema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Neplatné dáta' },
        { status: 400 },
      )
    }
    const { vehicleId, party, templateIds, fieldValues, draftSale } = parsed.data

    const [vehicle, templates, settings] = await Promise.all([
      prisma.vehicle.findUnique({
        where: { id: vehicleId },
        include: { buyer: true, consignor: true },
      }),
      prisma.documentTemplate.findMany({ where: { id: { in: templateIds } } }),
      getTenantSettings(),
    ])

    if (!vehicle) return NextResponse.json({ error: 'Vozidlo nenájdené' }, { status: 404 })

    // Pri rozpracovanom predaji ešte vozidlo kupujúceho priradeného nemá,
    // preto ho doplníme z predaných údajov.
    let source = vehicle
    if (draftSale) {
      const customer = await prisma.customer.findUnique({ where: { id: draftSale.customerId } })
      if (!customer) return NextResponse.json({ error: 'Zákazník nenájdený' }, { status: 404 })

      const rate = isConsignmentEnabled(settings) ? (draftSale.commissionRate ?? null) : null
      source = {
        ...vehicle,
        buyer: customer,
        buyerId: customer.id,
        soldPrice: new Prisma.Decimal(draftSale.soldPrice),
        soldAt: draftSale.soldAt ? new Date(draftSale.soldAt) : new Date(),
        soldNote: draftSale.soldNote ?? null,
        commissionRate: rate != null ? new Prisma.Decimal(rate) : null,
        commissionAmount:
          vehicle.isConsignment && rate != null
            ? new Prisma.Decimal((draftSale.soldPrice * rate) / 100)
            : null,
      }
    }

    const counterparty = party === 'consignor' ? source.consignor : source.buyer
    if (!counterparty) {
      return NextResponse.json(
        {
          error:
            party === 'consignor'
              ? 'Vozidlo nemá priradeného komitenta'
              : 'Vozidlo nemá priradeného kupujúceho',
        },
        { status: 400 },
      )
    }

    // Zaškrtávacie polia dostanú navyše dvojicu {kľúč_ano} / {kľúč_nie} s krížikom
    // v tom stĺpci, ktorý platí — pre tabuľky typu „Áno | Nie“ v preberacom protokole.
    const derived: Record<string, string> = {}
    for (const t of templates) {
      for (const f of parseCustomFields(t.customFields)) {
        if (f.type !== 'checkbox') continue
        const yes = fieldValues[f.key] === 'Áno'
        derived[`${f.key}_ano`] = yes ? 'X' : ''
        derived[`${f.key}_nie`] = yes ? '' : 'X'
      }
    }

    const values = {
      ...buildPlaceholderValues({ vehicle: source, party, settings }),
      ...fieldValues,
      ...derived,
    }

    // Poradie podľa toho, ako ich používateľ vybral
    const byId = new Map(templates.map((t) => [t.id, t]))
    const documents = templateIds
      .map((id) => byId.get(id))
      .filter((t): t is NonNullable<typeof t> => !!t)
      .map((t) => ({
        templateId: t.id,
        name: t.name,
        content: renderTemplate(t.content, values),
      }))

    return NextResponse.json({ data: { documents, customerId: counterparty.id } })
  } catch (err) {
    console.error('[POST /api/documents/prepare]', err)
    return NextResponse.json({ error: 'Dokumenty sa nepodarilo pripraviť' }, { status: 500 })
  }
}
