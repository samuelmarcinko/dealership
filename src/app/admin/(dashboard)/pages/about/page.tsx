import React from 'react'
import type { Metadata } from 'next'
import { getTenantSettings } from '@/lib/tenant'
import AboutPageEditor from '@/components/admin/AboutPageEditor'

export const metadata: Metadata = { title: 'Upraviť: O nás' }

export default async function AdminAboutPage() {
  const settings = await getTenantSettings()
  return <AboutPageEditor settings={settings} />
}
