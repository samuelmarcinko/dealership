import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { getSessionFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const maxDuration = 60

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

function getUploadDir(): string {
  return process.env.UPLOAD_PATH ?? path.join(process.cwd(), 'public', 'uploads')
}

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const files = await prisma.mediaFile.findMany({ orderBy: { uploadedAt: 'desc' } })
  return NextResponse.json({ data: files })
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Žiadny súbor' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Nepodporovaný formát. Použite JPG, PNG, WebP alebo SVG.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Súbor je príliš veľký. Maximum je 10 MB.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`

    const uploadDir = path.join(getUploadDir(), 'media')
    await mkdir(uploadDir, { recursive: true })

    const filePath = path.join(uploadDir, safeName)
    await writeFile(filePath, buffer)

    const url = `/uploads/media/${safeName}`

    const mediaFile = await prisma.mediaFile.create({
      data: {
        url,
        filePath,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
      },
    })

    return NextResponse.json({ data: mediaFile }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/media]', err)
    return NextResponse.json({ error: 'Nastala chyba pri nahrávaní' }, { status: 500 })
  }
}
