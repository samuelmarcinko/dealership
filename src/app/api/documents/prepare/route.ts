import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { getTenantSettings } from '@/lib/tenant'
import { buildPlaceholderValues, renderTemplate } from '@/lib/documents/placeholders'
import { parseCustomFields } from '@/lib/documents/schema'

const schema = z.object({
  vehicleId: z.string().min(1),
  party: z.enum(['buyer', 'consignor']),
  templateIds: z.array(z.string().min(1)).min(1, 'Vyberte aspoň jeden dokument'),
  fieldValues: z.record(z.string()).default({}),
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
    const { vehicleId, party, templateIds, fieldValues } = parsed.data

    const [vehicle, templates, settings] = await Promise.all([
      prisma.vehicle.findUnique({
        where: { id: vehicleId },
        include: { buyer: true, consignor: true },
      }),
      prisma.documentTemplate.findMany({ where: { id: { in: templateIds } } }),
      getTenantSettings(),
    ])

    if (!vehicle) return NextResponse.json({ error: 'Vozidlo nenájdené' }, { status: 404 })

    const counterparty = party === 'consignor' ? vehicle.consignor : vehicle.buyer
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

    const values = { ...buildPlaceholderValues({ vehicle, party, settings }), ...fieldValues }

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
