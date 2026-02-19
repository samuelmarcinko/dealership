import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

const RESERVED_SLUGS = ['vehicles', 'about', 'contact', 'admin', 'uploads', 'api']

const createSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Slug môže obsahovať len malé písmená, číslice a pomlčky')
    .refine((s) => !RESERVED_SLUGS.includes(s), { message: 'Tento slug je rezervovaný' }),
  title: z.string().min(1),
  content: z.string().default(''),
  isPublished: z.boolean().default(false),
  showInNav: z.boolean().default(false),
  navOrder: z.number().int().default(0),
})

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pages = await prisma.customPage.findMany({ orderBy: { navOrder: 'asc' } })
  return NextResponse.json({ data: pages })
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? 'Neplatné dáta'
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const existing = await prisma.customPage.findUnique({ where: { slug: parsed.data.slug } })
    if (existing) {
      return NextResponse.json({ error: 'Stránka s týmto slugom už existuje' }, { status: 409 })
    }

    const page = await prisma.customPage.create({ data: parsed.data })
    return NextResponse.json({ data: page }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/pages]', err)
    return NextResponse.json({ error: 'Nastala chyba servera' }, { status: 500 })
  }
}
