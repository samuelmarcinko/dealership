import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { getTemplatesDir } from '@/lib/docPath'

const MAX_SIZE = 20 * 1024 * 1024 // 20 MB

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const templates = await prisma.documentTemplate.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json({ data: templates })
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const name = (formData.get('name') as string | null)?.trim()
    const description = (formData.get('description') as string | null)?.trim() || null
    const customerTypeRaw = (formData.get('customerType') as string | null)?.trim() || null
    const customerType = customerTypeRaw === 'PERSON' || customerTypeRaw === 'COMPANY' ? customerTypeRaw : null

    if (!file) return NextResponse.json({ error: 'Žiadny súbor' }, { status: 400 })
    if (!name) return NextResponse.json({ error: 'Názov je povinný' }, { status: 400 })

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'docx') {
      return NextResponse.json({ error: 'Povolené sú len súbory .docx' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Súbor je príliš veľký (max 20 MB)' }, { status: 400 })
    }

    const dir = getTemplatesDir()
    await mkdir(dir, { recursive: true })

    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.docx`
    const filePath = path.join(dir, safeName)

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    const template = await prisma.documentTemplate.create({
      data: { name, description, originalName: file.name, filePath, customerType },
    })

    return NextResponse.json({ data: template }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/documents/templates]', err)
    return NextResponse.json({ error: 'Nastala chyba servera' }, { status: 500 })
  }
}
