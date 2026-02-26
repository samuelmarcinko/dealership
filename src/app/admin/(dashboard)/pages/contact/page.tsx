import React from 'react'
import type { Metadata } from 'next'
import { getTenantSettings } from '@/lib/tenant'
import ContactPageEditor from '@/components/admin/ContactPageEditor'

export const metadata: Metadata = { title: 'Upraviť: Kontakt' }

export default async function AdminContactPage() {
  const settings = await getTenantSettings()
  return <ContactPageEditor settings={settings} />
}
