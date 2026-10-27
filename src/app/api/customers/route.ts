import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

const schema = z.object({
  type: z.enum(['PERSON', 'COMPANY']),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  ico: z.string().optional(),
  dic: z.string().optional(),
  icDph: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  birthDate: z.string().optional(),
  idCardNumber: z.string().optional(),
  bankAccount: z.string().optional(),
  note: z.string().optional(),
})

/** Dátum narodenia chodí z formulára ako text; prázdna hodnota znamená „nevyplnené“. */
function toCustomerData<T extends { birthDate?: string }>(input: T) {
  const { birthDate, ...rest } = input
  return {
    ...rest,
    ...(birthDate !== undefined
      ? { birthDate: birthDate ? new Date(birthDate) : null }
      : {}),
  }
}

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { vehicles: true } } },
  })
  return NextResponse.json({ data: customers })
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Neplatné dáta' }, { status: 400 })
    }
    const customer = await prisma.customer.create({ data: toCustomerData(parsed.data) })
    return NextResponse.json({ data: customer }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/customers]', err)
    return NextResponse.json({ error: 'Nastala chyba servera' }, { status: 500 })
  }
}
