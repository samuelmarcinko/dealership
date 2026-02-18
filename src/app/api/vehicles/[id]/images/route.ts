import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

const createImageSchema = z.object({
  url: z.string().url().or(z.string().startsWith('/')),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
})

const patchImageSchema = z.object({
  imageId: z.string(),
  isPrimary: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: vehicleId } = await params

  try {
    const body = await req.json()
    const parsed = createImageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Neplatné dáta' }, { status: 400 })
    }

    const { url, isPrimary, sortOrder } = parsed.data

    // If this image is primary, reset all others
    if (isPrimary) {
      await prisma.vehicleImage.updateMany({
        where: { vehicleId },
        data: { isPrimary: false },
      })
    }

    const image = await prisma.vehicleImage.create({
      data: { vehicleId, url, isPrimary, sortOrder },
    })

    return NextResponse.json({ data: image }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/vehicles/[id]/images]', err)
    return NextResponse.json({ error: 'Nastala chyba servera' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: vehicleId } = await params

  try {
    const body = await req.json()
    const parsed = patchImageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Neplatné dáta' }, { status: 400 })
    }

    const { imageId, isPrimary, sortOrder } = parsed.data

    if (isPrimary) {
      await prisma.vehicleImage.updateMany({
        where: { vehicleId },
        data: { isPrimary: false },
      })
    }

    const image = await prisma.vehicleImage.update({
      where: { id: imageId },
      data: {
        ...(isPrimary !== undefined && { isPrimary }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    })

    return NextResponse.json({ data: image })
  } catch (err) {
    console.error('[PATCH /api/vehicles/[id]/images]', err)
    return NextResponse.json({ error: 'Nastala chyba servera' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const imageId = searchParams.get('imageId')

  if (!imageId) return NextResponse.json({ error: 'imageId je povinný' }, { status: 400 })

  await params // consume params

  await prisma.vehicleImage.delete({ where: { id: imageId } })
  return NextResponse.json({ success: true })
}
