import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

const schema = z.object({
  buyerId: z.string().min(1),
  soldPrice: z.number().positive(),
  soldAt: z.string().datetime().optional(),
  soldNote: z.string().optional(),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Neplatné dáta' }, { status: 400 })
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id } })
    if (!vehicle) return NextResponse.json({ error: 'Vozidlo nenájdené' }, { status: 404 })
    if (vehicle.status === 'SOLD') {
      return NextResponse.json({ error: 'Vozidlo je už predané' }, { status: 409 })
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        status: 'SOLD',
        buyerId: parsed.data.buyerId,
        soldPrice: parsed.data.soldPrice,
        soldAt: parsed.data.soldAt ? new Date(parsed.data.soldAt) : new Date(),
        soldNote: parsed.data.soldNote ?? null,
      },
    })

    return NextResponse.json({ data: updated })
  } catch (err) {
    console.error('[POST /api/vehicles/:id/sell]', err)
    return NextResponse.json({ error: 'Nastala chyba servera' }, { status: 500 })
  }
}
