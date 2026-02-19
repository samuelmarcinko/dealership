import React from 'react'
import type { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getTenantSettings } from '@/lib/tenant'
import BrandingForm from '@/components/admin/BrandingForm'
import HeroSettingsForm from '@/components/admin/HeroSettingsForm'
import { Palette, ImageIcon } from 'lucide-react'

export const metadata: Metadata = { title: 'Nastavenia' }

export default async function SettingsPage() {
  const settings = await getTenantSettings()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nastavenia</h1>
        <p className="text-slate-500 text-sm mt-1">Branding, vzhľad a obsah verejnej stránky</p>
      </div>

      {/* Branding */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-base font-semibold">Branding & Kontakt</CardTitle>
          </div>
          <CardDescription>
            Názov firmy, logo, kontaktné údaje, sociálne siete a farebná schéma verejnej stránky.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BrandingForm settings={settings} />
        </CardContent>
      </Card>

      {/* Hero section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-base font-semibold">Hero sekcia (úvodná strana)</CardTitle>
          </div>
          <CardDescription>
            Pozadie, nadpisy a tlačidlá v hlavnej hero sekcii na úvodnej stránke.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HeroSettingsForm settings={settings} />
        </CardContent>
      </Card>
    </div>
  )
}
