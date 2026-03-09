import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET() {
  const categories = await prisma.customEquipmentCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json({ data: categories })
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, icon } = body
  if (!name) return NextResponse.json({ error: 'Názov je povinný' }, { status: 400 })

  const category = await prisma.customEquipmentCategory.create({
    data: { name, icon: icon ?? 'Wrench' },
  })
  return NextResponse.json({ data: category }, { status: 201 })
}
