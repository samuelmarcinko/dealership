import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(_req: NextRequest) {
  const consignors = await prisma.customer.findMany({
    where: { isConsignor: true },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { consignedVehicles: true } } },
  })
  return NextResponse.json({ data: consignors })
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const customer = await prisma.customer.create({
    data: { ...body, isConsignor: true },
  })
  return NextResponse.json({ data: customer }, { status: 201 })
}
