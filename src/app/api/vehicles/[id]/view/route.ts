import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function classifySource(referer: string | null): string {
  if (!referer) return 'direct'
  try {
    const url = new URL(referer)
    const hostname = url.hostname.toLowerCase()
    if (hostname.includes('google')) return 'google'
    if (hostname.includes('facebook') || hostname.includes('fb.com')) return 'facebook'
    if (hostname.includes('instagram')) return 'instagram'
    // Internal — same origin
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
  const referer = request.headers.get('referer')
  const source = classifySource(referer)

  await prisma.vehicleView.create({
    data: { vehicleId: id, source },
  })

  return NextResponse.json({ ok: true })
}
