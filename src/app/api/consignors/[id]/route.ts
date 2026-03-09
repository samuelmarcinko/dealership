import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      consignedVehicles: {
        orderBy: { createdAt: 'desc' },
        include: { images: { where: { isPrimary: true }, take: 1 } },
      },
    },
  })
  if (!customer) return NextResponse.json({ error: 'Nenájdené' }, { status: 404 })
  return NextResponse.json({ data: customer })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const customer = await prisma.customer.update({
    where: { id },
    data: body,
  })
  return NextResponse.json({ data: customer })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.customer.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
