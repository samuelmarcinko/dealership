import React from 'react'
import type { Metadata } from 'next'
import { getTenantSettings } from '@/lib/tenant'
import SettingsTabs from '@/components/admin/SettingsTabs'

export const metadata: Metadata = { title: 'Nastavenia' }

export default async function SettingsPage() {
  const settings = await getTenantSettings()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nastavenia</h1>
        <p className="text-slate-500 text-sm mt-1">Branding, vzhľad a obsah verejnej stránky</p>
      </div>

      <SettingsTabs settings={settings} />
    </div>
  )
}
