import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function getClientIp(request: NextRequest): string {
  // Traefik / reverse proxy forwarded IP
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return 'unknown'
}

function classifySource(referer: string | null): string {
  if (!referer) return 'direct'
  try {
    const url = new URL(referer)
    const hostname = url.hostname.toLowerCase()
    if (hostname.includes('google')) return 'google'
    if (hostname.includes('facebook') || hostname.includes('fb.com')) return 'facebook'
    if (hostname.includes('instagram')) return 'instagram'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    if (appUrl) {
      try {
        const origin = new URL(appUrl).hostname
        if (hostname === origin) return 'internal'
      } catch {
        // ignore
      }
    }
    return 'other'
  } catch {
    return 'direct'
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ip = getClientIp(request)

  // Deduplicate: 1 view per IP per vehicle per calendar day
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const existing = await prisma.vehicleView.findFirst({
    where: { vehicleId: id, ip, viewedAt: { gte: startOfDay } },
    select: { id: true },
  })

  if (existing) {
    return NextResponse.json({ ok: true })
  }

  const source = classifySource(request.headers.get('referer'))
  await prisma.vehicleView.create({
    data: { vehicleId: id, ip, source },
  })

  return NextResponse.json({ ok: true })
}
