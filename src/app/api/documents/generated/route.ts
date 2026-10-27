import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

const schema = z.object({
  vehicleId: z.string().min(1),
  customerId: z.string().nullable().optional(),
  fieldValues: z.record(z.string()).default({}),
  documents: z
    .array(
      z.object({
        templateId: z.string().nullable().optional(),
        name: z.string().min(1),
        content: z.string(),
      }),
    )
    .min(1),
})

/** Uloží finálne znenie dokumentov do archívu a vráti ich id na tlač. */
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const parsed = schema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Neplatné dáta' },
        { status: 400 },
      )
    }
    const { vehicleId, customerId, fieldValues, documents } = parsed.data

    const created = await prisma.$transaction(
      documents.map((doc, index) =>
        prisma.generatedDocument.create({
          data: {
            vehicleId,
            customerId: customerId ?? null,
            templateId: doc.templateId ?? null,
            templateName: doc.name,
            content: doc.content,
            fieldValues,
            sortOrder: index,
          },
          select: { id: true },
        }),
      ),
    )

    return NextResponse.json({ data: { ids: created.map((c) => c.id) } }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/documents/generated]', err)
    return NextResponse.json({ error: 'Dokumenty sa nepodarilo uložiť' }, { status: 500 })
  }
}
