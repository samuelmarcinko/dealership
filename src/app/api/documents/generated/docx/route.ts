import { NextRequest, NextResponse } from 'next/server'
import HTMLtoDOCX from 'html-to-docx'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export const maxDuration = 60

/**
 * Zloží vybrané vygenerované dokumenty do jedného .docx na stiahnutie.
 * Každý dokument začína na novej strane.
 */
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ids = (req.nextUrl.searchParams.get('ids') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (ids.length === 0) {
    return NextResponse.json({ error: 'Chýbajú dokumenty' }, { status: 400 })
  }

  try {
    const docs = await prisma.generatedDocument.findMany({
      where: { id: { in: ids } },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: { vehicle: { select: { title: true } } },
    })
    if (docs.length === 0) {
      return NextResponse.json({ error: 'Dokumenty nenájdené' }, { status: 404 })
    }

    const combined = docs
      .map((d, i) => (i > 0 ? '<p style="page-break-before: always"></p>' : '') + d.content)
      .join('\n')

    const buffer = (await HTMLtoDOCX(
      `<!DOCTYPE html><html><body>${combined}</body></html>`,
      null,
      {
        orientation: 'portrait',
        margins: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
        font: 'Times New Roman',
        fontSize: 22, // polovičné body → 11 pt
        table: { row: { cantSplit: true } },
      },
    )) as Buffer

    const base = docs.length === 1 ? docs[0].templateName : 'zmluvy'
    const vehicle = docs[0].vehicle?.title ?? ''
    const fileName = `${slugify(base)}${vehicle ? '-' + slugify(vehicle) : ''}.docx`

    const ab = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as ArrayBuffer

    return new Response(ab, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (err) {
    console.error('[GET /api/documents/generated/docx]', err)
    return NextResponse.json({ error: 'Dokument sa nepodarilo vytvoriť' }, { status: 500 })
  }
}
