import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const videos = await prisma.vehicleVideo.findMany({
    where: { vehicleId: id },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json({ data: videos })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { url, title, sortOrder } = body
  if (!url) return NextResponse.json({ error: 'URL je povinné' }, { status: 400 })

  const video = await prisma.vehicleVideo.create({
    data: { vehicleId: id, url, title: title ?? null, sortOrder: sortOrder ?? 0 },
  })
  return NextResponse.json({ data: video }, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: vehicleId } = await params
  const { searchParams } = req.nextUrl
  const videoId = searchParams.get('videoId')
  if (!videoId) return NextResponse.json({ error: 'videoId je povinné' }, { status: 400 })

  await prisma.vehicleVideo.deleteMany({ where: { id: videoId, vehicleId } })
  return NextResponse.json({ success: true })
}
