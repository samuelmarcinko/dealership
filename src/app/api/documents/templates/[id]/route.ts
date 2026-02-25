import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const template = await prisma.documentTemplate.update({
    where: { id },
    data: {
      ...(typeof body.isActive === 'boolean' ? { isActive: body.isActive } : {}),
      ...(typeof body.sortOrder === 'number' ? { sortOrder: body.sortOrder } : {}),
      ...(typeof body.name === 'string' ? { name: body.name } : {}),
    },
  })
  return NextResponse.json({ data: template })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const template = await prisma.documentTemplate.findUnique({ where: { id } })
  if (!template) return NextResponse.json({ error: 'Šablóna nenájdená' }, { status: 404 })

  // Remove file from disk (ignore errors if file already missing)
  try { await unlink(template.filePath) } catch { /* ignore */ }

  await prisma.documentTemplate.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
