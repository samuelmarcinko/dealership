import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { templateInputSchema } from '@/lib/documents/schema'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const templates = await prisma.documentTemplate.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json({ data: templates })
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const parsed = templateInputSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Neplatné dáta' },
        { status: 400 },
      )
    }

    const { customFields, customerType, description, ...rest } = parsed.data
    const template = await prisma.documentTemplate.create({
      data: {
        ...rest,
        description: description ?? null,
        customerType: customerType ?? null,
        customFields,
      },
    })
    return NextResponse.json({ data: template }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/documents/templates]', err)
    return NextResponse.json({ error: 'Nastala chyba servera' }, { status: 500 })
  }
}
