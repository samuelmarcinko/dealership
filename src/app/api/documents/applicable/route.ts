import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { parseCustomFields } from '@/lib/documents/schema'

/**
 * Vráti šablóny použiteľné pre dané vozidlo a zmluvnú stranu.
 * Filtrovanie je zámerne na serveri, nech ho netreba opakovať v každom UI.
 */
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const vehicleId = searchParams.get('vehicleId')
  const party = searchParams.get('party')

  if (!vehicleId || (party !== 'buyer' && party !== 'consignor')) {
    return NextResponse.json({ error: 'Chýba vehicleId alebo party' }, { status: 400 })
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: { buyer: true, consignor: true },
  })
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

  const contexts =
    party === 'consignor'
      ? (['INTAKE', 'BOTH'] as const)
      : (['SALE', 'BOTH'] as const)

  const templates = await prisma.documentTemplate.findMany({
    where: {
      isActive: true,
      context: { in: [...contexts] },
      OR: [{ customerType: null }, { customerType: counterparty.type }],
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, name: true, description: true, customFields: true },
  })

  return NextResponse.json({
    data: {
      counterparty: {
        id: counterparty.id,
        name:
          counterparty.type === 'COMPANY'
            ? (counterparty.companyName ?? '')
            : `${counterparty.firstName ?? ''} ${counterparty.lastName ?? ''}`.trim(),
      },
      templates: templates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        customFields: parseCustomFields(t.customFields),
      })),
    },
  })
}
