import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendContactNotification, sendContactConfirmation } from '@/lib/email'

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(5).max(2000),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = contactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Neplatné dáta' },
        { status: 400 }
      )
    }

    const { name, email, phone, subject, message } = parsed.data

    // Send both emails concurrently; ignore individual failures
    const [notified] = await Promise.allSettled([
      sendContactNotification({ name, email, phone, subject, message }),
      sendContactConfirmation({ name, email }),
    ])

    if (notified.status === 'rejected') {
      console.error('[Contact] Notification failed:', notified.reason)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/contact]', err)
    return NextResponse.json({ error: 'Nastala chyba servera' }, { status: 500 })
  }
}
