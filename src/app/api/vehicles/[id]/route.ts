import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { generateVehicleSlug } from '@/lib/slug'
import { FuelType, TransmissionType, BodyType, VehicleStatus } from '@prisma/client'

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  make: z.string().min(1).max(100).optional(),
  model: z.string().min(1).max(100).optional(),
  variant: z.string().max(100).nullable().optional(),
  year: z.number().int().min(1900).max(2030).optional(),
  price: z.number().positive().optional(),
  salePrice: z.number().positive().nullable().optional(),
  mileage: z.number().int().min(0).optional(),
  fuelType: z.nativeEnum(FuelType).optional(),
  transmission: z.nativeEnum(TransmissionType).optional(),
  bodyType: z.nativeEnum(BodyType).nullable().optional(),
  engineCapacity: z.number().int().positive().nullable().optional(),
  power: z.number().int().positive().nullable().optional(),
  color: z.string().max(50).nullable().optional(),
  doors: z.number().int().min(2).max(6).nullable().optional(),
  seats: z.number().int().min(1).max(9).nullable().optional(),
  description: z.string().nullable().optional(),
  features: z.array(z.string()).optional(),
  vin: z.string().max(17).nullable().optional(),
  status: z.nativeEnum(VehicleStatus).optional(),
})

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: 'asc' } } },
  })
  if (!vehicle) return NextResponse.json({ error: 'Nenájdené' }, { status: 404 })
  return NextResponse.json({ data: vehicle })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Neplatné dáta' },
        { status: 400 }
      )
    }

    // Regenerate slug if title changed
    let slugUpdate: { slug?: string } = {}
    if (parsed.data.title) {
      slugUpdate.slug = await generateVehicleSlug(parsed.data.title, id)
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: { ...parsed.data, ...slugUpdate },
    })

    return NextResponse.json({ data: vehicle })
  } catch (err) {
    console.error('[PUT /api/vehicles/[id]]', err)
    return NextResponse.json({ error: 'Nastala chyba servera' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.vehicle.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
