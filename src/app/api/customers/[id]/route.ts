import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

const schema = z.object({
  type: z.enum(['PERSON', 'COMPANY']).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  ico: z.string().optional(),
  dic: z.string().optional(),
  icDph: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  note: z.string().optional(),
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      vehicles: {
        where: { status: 'SOLD' },
        include: { images: { where: { isPrimary: true }, take: 1 } },
        orderBy: { soldAt: 'desc' },
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
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Neplatné dáta' }, { status: 400 })
    }
    const customer = await prisma.customer.update({ where: { id }, data: parsed.data })
    return NextResponse.json({ data: customer })
  } catch (err) {
    console.error('[PUT /api/customers/:id]', err)
    return NextResponse.json({ error: 'Nastala chyba servera' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    await prisma.customer.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/customers/:id]', err)
    return NextResponse.json({ error: 'Nastala chyba servera' }, { status: 500 })
  }
}
