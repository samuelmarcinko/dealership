import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

const settingsSchema = z.object({
  settings: z.array(
    z.object({
      key: z.string().min(1),
      value: z.string(),
    })
  ),
})

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const settings = await prisma.tenantSettings.findMany()
  const data = Object.fromEntries(settings.map((s) => [s.key, s.value]))
  return NextResponse.json({ data })
}

export async function PUT(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = settingsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Neplatné dáta' }, { status: 400 })
    }

    await Promise.all(
      parsed.data.settings.map((s) =>
        prisma.tenantSettings.upsert({
          where: { key: s.key },
          update: { value: s.value },
          create: { key: s.key, value: s.value },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PUT /api/settings]', err)
    return NextResponse.json({ error: 'Nastala chyba servera' }, { status: 500 })
  }
}
