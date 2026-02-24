import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { getSessionFromRequest } from '@/lib/auth'

export const maxDuration = 60

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

function getUploadDir(): string {
  // In Docker with standalone output, process.cwd() is /app
  // We store uploads in public/uploads so Next.js serves them at /uploads
  return process.env.UPLOAD_PATH ?? path.join(process.cwd(), 'public', 'uploads')
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
        { error: 'Nepodporovaný formát. Použite JPG, PNG alebo WebP.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Súbor je príliš veľký. Maximálna veľkosť je 10 MB.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Unique filename: timestamp + random string + original extension
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`

    // Optional per-vehicle slug subfolder (prevents path traversal via sanitization)
    const rawSlug = new URL(req.url).searchParams.get('slug') ?? ''
    const safeSlug = rawSlug.replace(/[^a-z0-9-]/g, '').slice(0, 100)

    const uploadDir = safeSlug
      ? path.join(getUploadDir(), 'vehicles', safeSlug)
      : path.join(getUploadDir(), 'vehicles')
    await mkdir(uploadDir, { recursive: true })

    const filePath = path.join(uploadDir, safeName)
    await writeFile(filePath, buffer)

    const url = safeSlug
      ? `/uploads/vehicles/${safeSlug}/${safeName}`
      : `/uploads/vehicles/${safeName}`
    return NextResponse.json({ url })
  } catch (err) {
    console.error('[POST /api/upload]', err)
    return NextResponse.json({ error: 'Nastala chyba pri nahrávaní' }, { status: 500 })
  }
}
