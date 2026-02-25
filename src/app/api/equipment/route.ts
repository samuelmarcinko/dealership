import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { SEED_EQUIPMENT } from '@/lib/equipmentData'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await prisma.equipmentItem.findMany({
    orderBy: [{ category: 'asc' }, { subcategory: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
  })
  return NextResponse.json({ data: items })
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, category, subcategory } = body

  if (!name?.trim() || !category || !subcategory?.trim()) {
    return NextResponse.json({ error: 'Chýba name, category alebo subcategory' }, { status: 400 })
  }

  const item = await prisma.equipmentItem.create({
    data: { name: name.trim(), category, subcategory: subcategory.trim(), sortOrder: 0 },
  })
  return NextResponse.json({ data: item })
}

// Seed endpoint — populates DB with default items if DB is empty
export async function PUT(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const count = await prisma.equipmentItem.count()
  if (count > 0) {
    return NextResponse.json({ message: `Databáza už obsahuje ${count} položiek`, seeded: false })
  }

  await prisma.equipmentItem.createMany({
    data: SEED_EQUIPMENT.map((item, i) => ({ ...item, sortOrder: i })),
    skipDuplicates: true,
  })
  const total = await prisma.equipmentItem.count()
  return NextResponse.json({ message: `Databáza inicializovaná — ${total} položiek`, seeded: true })
}
