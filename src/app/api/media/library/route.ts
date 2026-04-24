import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import path from 'path'
import { getSessionFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function urlToFilePath(url: string): string {
  const uploadDir = process.env.UPLOAD_PATH ?? path.join(process.cwd(), 'public', 'uploads')
  const relative = url.replace(/^\/uploads\//, '')
  return path.join(uploadDir, relative)
}

async function tryUnlink(filePath: string) {
  try { await unlink(filePath) } catch { /* already gone */ }
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { folder, id } = await req.json() as { folder: string; id: string }

  if (!folder || !id) {
    return NextResponse.json({ error: 'Chýba folder alebo id' }, { status: 400 })
  }

  try {
    if (folder === 'media') {
      const file = await prisma.mediaFile.findUnique({ where: { id } })
      if (!file) return NextResponse.json({ error: 'Nenájdené' }, { status: 404 })
      await tryUnlink(file.filePath)
      await prisma.mediaFile.delete({ where: { id } })

    } else if (folder === 'vehicles') {
      const image = await prisma.vehicleImage.findUnique({ where: { id } })
      if (!image) return NextResponse.json({ error: 'Nenájdené' }, { status: 404 })
      if (image.url.startsWith('/uploads/')) {
        await tryUnlink(urlToFilePath(image.url))
      }
      await prisma.vehicleImage.delete({ where: { id } })

    } else if (folder === 'branding') {
      // id = TenantSettings key
      const setting = await prisma.tenantSettings.findUnique({ where: { key: id } })
      if (!setting) return NextResponse.json({ error: 'Nenájdené' }, { status: 404 })
      if (setting.value.startsWith('/uploads/')) {
        await tryUnlink(urlToFilePath(setting.value))
      }
      await prisma.tenantSettings.update({ where: { key: id }, data: { value: '' } })

    } else {
      return NextResponse.json({ error: 'Neznámy folder' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/media/library]', err)
    return NextResponse.json({ error: 'Nastala chyba' }, { status: 500 })
  }
}
