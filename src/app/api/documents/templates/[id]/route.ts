import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { templateInputSchema } from '@/lib/documents/schema'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const template = await prisma.documentTemplate.findUnique({ where: { id } })
  if (!template) return NextResponse.json({ error: 'Šablóna nenájdená' }, { status: 404 })

  return NextResponse.json({ data: template })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const parsed = templateInputSchema.partial().safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Neplatné dáta' },
        { status: 400 },
      )
    }

    const { customFields, customerType, description, ...rest } = parsed.data
    const template = await prisma.documentTemplate.update({
      where: { id },
      data: {
        ...rest,
        ...(description !== undefined ? { description: description ?? null } : {}),
        ...(customerType !== undefined ? { customerType: customerType ?? null } : {}),
        ...(customFields !== undefined ? { customFields } : {}),
      },
    })
    return NextResponse.json({ data: template })
  } catch (err) {
    console.error('[PATCH /api/documents/templates/[id]]', err)
    return NextResponse.json({ error: 'Nastala chyba servera' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const template = await prisma.documentTemplate.findUnique({ where: { id } })
  if (!template) return NextResponse.json({ error: 'Šablóna nenájdená' }, { status: 404 })

  await prisma.documentTemplate.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
