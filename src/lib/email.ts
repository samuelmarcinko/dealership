/**
 * Email sending abstraction
 *
 * Uses Nodemailer with SMTP (works with any provider: Gmail, Brevo, Mailjet, Resend SMTP…)
 *
 * Required env vars:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 *
 * Optional:
 *   SMTP_SECURE=true   (use TLS on port 465)
 *
 * If SMTP is not configured, emails are logged to the console (development mode).
 */

import nodemailer from 'nodemailer'

export interface EmailOptions {
  to: string | string[]
  subject: string
  text: string
  html?: string
  replyTo?: string
}

function createTransport() {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    return null // SMTP not configured
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT ?? '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  })
}

export async function sendEmail(opts: EmailOptions): Promise<boolean> {
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'noreply@autobazar.sk'

  const transport = createTransport()

  if (!transport) {
    // Graceful fallback: log the email in development
    console.log('[Email] SMTP not configured. Would have sent:')
    console.log(`  To: ${Array.isArray(opts.to) ? opts.to.join(', ') : opts.to}`)
    console.log(`  Subject: ${opts.subject}`)
    console.log(`  Body: ${opts.text}`)
    return process.env.NODE_ENV === 'development' // true in dev (simulate success)
  }

  try {
    await transport.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
      replyTo: opts.replyTo,
    })
    return true
  } catch (err) {
    console.error('[Email] Send error:', err)
    return false
  }
}

// ── Templated emails ──────────────────────────────────────────────────────

export async function sendContactNotification(data: {
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
}) {
  const recipient = process.env.CONTACT_EMAIL ?? process.env.SMTP_USER
  if (!recipient) return false

  const text = `
Nová správa z kontaktného formulára
=====================================
Meno: ${data.name}
Email: ${data.email}
${data.phone ? `Telefón: ${data.phone}` : ''}
${data.subject ? `Predmet: ${data.subject}` : ''}

Správa:
${data.message}
  `.trim()

  const html = `
<div style="font-family:sans-serif;max-width:600px">
  <h2 style="color:#0f172a">Nová správa z kontaktného formulára</h2>
  <table style="border-collapse:collapse;width:100%">
    <tr><td style="padding:8px 0;color:#64748b;width:100px">Meno:</td><td style="padding:8px 0;font-weight:600">${data.name}</td></tr>
    <tr><td style="padding:8px 0;color:#64748b">Email:</td><td style="padding:8px 0"><a href="mailto:${data.email}">${data.email}</a></td></tr>
    ${data.phone ? `<tr><td style="padding:8px 0;color:#64748b">Telefón:</td><td style="padding:8px 0">${data.phone}</td></tr>` : ''}
    ${data.subject ? `<tr><td style="padding:8px 0;color:#64748b">Predmet:</td><td style="padding:8px 0">${data.subject}</td></tr>` : ''}
  </table>
  <h3 style="color:#0f172a;margin-top:24px">Správa:</h3>
  <div style="background:#f8fafc;padding:16px;border-radius:8px;white-space:pre-wrap">${data.message}</div>
</div>
  `

  return sendEmail({
    to: recipient,
    subject: `Kontaktný formulár: ${data.name}`,
    text,
    html,
    replyTo: data.email,
  })
}

export async function sendContactConfirmation(data: { name: string; email: string }) {
  const businessName = process.env.TENANT_NAME ?? 'AutoBazar'

  return sendEmail({
    to: data.email,
    subject: `Ďakujeme za správu – ${businessName}`,
    text: `Dobrý deň ${data.name},\n\nĎakujeme za vašu správu. Ozveme sa vám čo najskôr.\n\nS pozdravom,\n${businessName}`,
    html: `
<div style="font-family:sans-serif;max-width:600px">
  <h2 style="color:#0f172a">Ďakujeme za správu!</h2>
  <p>Dobrý deň <strong>${data.name}</strong>,</p>
  <p>Ďakujeme za vašu správu. Ozveme sa vám čo najskôr.</p>
  <p style="color:#64748b">S pozdravom,<br><strong>${businessName}</strong></p>
</div>
    `,
  })
}
