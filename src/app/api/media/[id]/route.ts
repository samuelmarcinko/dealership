import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { getSessionFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const mediaFile = await prisma.mediaFile.findUnique({ where: { id } })
  if (!mediaFile) {
    return NextResponse.json({ error: 'Súbor nenájdený' }, { status: 404 })
  }

  try {
    await unlink(mediaFile.filePath)
  } catch {
    // File may already be missing from disk — continue with DB deletion
  }

  await prisma.mediaFile.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
