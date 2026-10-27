import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'
import { getSessionFromRequest } from '@/lib/auth'

export const maxDuration = 60

const MAX_SIZE = 20 * 1024 * 1024 // 20 MB

/**
 * Prevedie nahraný .docx na HTML, ktoré sa dá ďalej upravovať v editore.
 * Nič neukladá — vrátené HTML si používateľ pozrie a uloží ako šablónu.
 */
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'Žiadny súbor' }, { status: 400 })
    if (!file.name.toLowerCase().endsWith('.docx')) {
      return NextResponse.json(
        { error: 'Podporovaný je len formát .docx. Starší .doc najprv uložte vo Worde ako .docx.' },
        { status: 400 },
      )
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Súbor je príliš veľký (max 20 MB)' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await mammoth.convertToHtml(
      { buffer },
      {
        styleMap: [
          "p[style-name='Title'] => h1:fresh",
          "p[style-name='Heading 1'] => h2:fresh",
          "p[style-name='Heading 2'] => h3:fresh",
        ],
      },
    )

    return NextResponse.json({
      data: {
        html: result.value,
        warnings: result.messages.filter((m) => m.type === 'warning').map((m) => m.message),
      },
    })
  } catch (err) {
    console.error('[POST /api/documents/templates/import]', err)
    return NextResponse.json({ error: 'Súbor sa nepodarilo načítať' }, { status: 500 })
  }
}
