import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const vehicle = await prisma.vehicle.findUnique({ where: { id } })
  if (!vehicle) return NextResponse.json({ error: 'Vozidlo nenájdené' }, { status: 404 })
  if (vehicle.status !== 'SOLD') return NextResponse.json({ error: 'Vozidlo nie je predané' }, { status: 400 })

  const restored = await prisma.vehicle.update({
    where: { id },
    data: {
      status: 'AVAILABLE',
      buyerId: null,
      soldAt: null,
      soldPrice: null,
      soldNote: null,
    },
  })

  return NextResponse.json({ data: restored })
}
