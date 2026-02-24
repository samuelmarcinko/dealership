import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

const RESERVED_SLUGS = ['vehicles', 'about', 'contact', 'admin', 'uploads', 'api']

const updateSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Slug môže obsahovať len malé písmená, číslice a pomlčky')
    .refine((s) => !RESERVED_SLUGS.includes(s), { message: 'Tento slug je rezervovaný' })
    .optional(),
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  isPublished: z.boolean().optional(),
  showInNav: z.boolean().optional(),
  navOrder: z.number().int().optional(),
  seoTitle: z.string().max(200).nullable().optional(),
  seoDescription: z.string().max(500).nullable().optional(),
  ogImage: z.string().max(500).nullable().optional(),
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const page = await prisma.customPage.findUnique({ where: { id } })
  if (!page) return NextResponse.json({ error: 'Nenájdené' }, { status: 404 })

  return NextResponse.json({ data: page })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? 'Neplatné dáta'
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    // Check slug uniqueness if changing slug
    if (parsed.data.slug) {
      const existing = await prisma.customPage.findUnique({ where: { slug: parsed.data.slug } })
      if (existing && existing.id !== id) {
        return NextResponse.json({ error: 'Stránka s týmto slugom už existuje' }, { status: 409 })
      }
    }

    const page = await prisma.customPage.update({ where: { id }, data: parsed.data })
    return NextResponse.json({ data: page })
  } catch (err) {
    console.error('[PUT /api/pages/:id]', err)
    return NextResponse.json({ error: 'Nastala chyba servera' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    await prisma.customPage.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/pages/:id]', err)
    return NextResponse.json({ error: 'Nastala chyba servera' }, { status: 500 })
  }
}
