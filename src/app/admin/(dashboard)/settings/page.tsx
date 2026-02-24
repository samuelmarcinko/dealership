import React from 'react'
import type { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getTenantSettings } from '@/lib/tenant'
import BrandingForm from '@/components/admin/BrandingForm'
import HeroSettingsForm from '@/components/admin/HeroSettingsForm'
import AppearanceSettingsForm from '@/components/admin/AppearanceSettingsForm'
import HomepageSettingsForm from '@/components/admin/HomepageSettingsForm'
import HomepageSeoSettingsForm from '@/components/admin/HomepageSeoSettingsForm'
import AboutSettingsForm from '@/components/admin/AboutSettingsForm'
import ContactSettingsForm from '@/components/admin/ContactSettingsForm'
import BannerSettingsForm from '@/components/admin/BannerSettingsForm'
import { Palette, ImageIcon, Sliders, LayoutGrid, Info, Phone, Megaphone, Search } from 'lucide-react'

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
            Názov firmy, logo, kontaktné údaje, sociálne siete, päta a farebná schéma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BrandingForm settings={settings} />
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-base font-semibold">Vzhľad</CardTitle>
          </div>
          <CardDescription>
            Font webu a štýl navigačnej lišty.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AppearanceSettingsForm settings={settings} />
        </CardContent>
      </Card>

      {/* Hero */}
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

      {/* Homepage */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-base font-semibold">Domovská stránka — obsah</CardTitle>
          </div>
          <CardDescription>
            Štatistiky (farebný pruh) a sekcia výhod.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HomepageSettingsForm settings={settings} />
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-base font-semibold">Stránka „O nás"</CardTitle>
          </div>
          <CardDescription>
            Hero sekcia, príbeh firmy, hodnoty a text o tíme.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AboutSettingsForm settings={settings} />
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-base font-semibold">Stránka „Kontakt"</CardTitle>
          </div>
          <CardDescription>
            Hero sekcia, otváracie hodiny a mapa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactSettingsForm settings={settings} />
        </CardContent>
      </Card>

      {/* Homepage SEO */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-base font-semibold">SEO — Domovská stránka</CardTitle>
          </div>
          <CardDescription>
            SEO nadpis, meta popis a OG obrázok pre domovskú stránku (Google, Facebook, Twitter…).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HomepageSeoSettingsForm settings={settings} />
        </CardContent>
      </Card>

      {/* Banner */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-base font-semibold">Oznamovací pruh (Banner)</CardTitle>
          </div>
          <CardDescription>
            Tenký pruh v hornej časti stránky s oznámením alebo akciou.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BannerSettingsForm settings={settings} />
        </CardContent>
      </Card>
    </div>
  )
}
