import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { FuelType, TransmissionType, BodyType, VehicleStatus } from '@prisma/client'

const vehicleSchema = z.object({
  title: z.string().min(1).max(200),
  make: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  variant: z.string().max(100).nullable().optional(),
  year: z.number().int().min(1900).max(2030),
  price: z.number().positive(),
  mileage: z.number().int().min(0),
  fuelType: z.nativeEnum(FuelType),
  transmission: z.nativeEnum(TransmissionType),
  bodyType: z.nativeEnum(BodyType).nullable().optional(),
  engineCapacity: z.number().int().positive().nullable().optional(),
  power: z.number().int().positive().nullable().optional(),
  color: z.string().max(50).nullable().optional(),
  doors: z.number().int().min(2).max(6).nullable().optional(),
  seats: z.number().int().min(1).max(9).nullable().optional(),
  description: z.string().nullable().optional(),
  features: z.array(z.string()).default([]),
  status: z.nativeEnum(VehicleStatus).default('AVAILABLE'),
})

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const status = searchParams.get('status')
  const make = searchParams.get('make')

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (make) where.make = make

  const vehicles = await prisma.vehicle.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { images: { where: { isPrimary: true }, take: 1 } },
  })

  return NextResponse.json({ data: vehicles })
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = vehicleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Neplatné dáta' },
        { status: 400 }
      )
    }

    const vehicle = await prisma.vehicle.create({ data: parsed.data })
    return NextResponse.json({ data: vehicle }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/vehicles]', err)
    return NextResponse.json({ error: 'Nastala chyba servera' }, { status: 500 })
  }
}
