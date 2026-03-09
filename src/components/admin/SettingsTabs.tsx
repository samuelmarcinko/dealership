'use client'

import React, { useState } from 'react'
import { Building2, Palette, LayoutGrid, ImageIcon, Search, Megaphone, Phone } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import BrandingForm from '@/components/admin/BrandingForm'
import ContactSettingsForm from '@/components/admin/ContactSettingsForm'
import AppearanceSettingsForm from '@/components/admin/AppearanceSettingsForm'
import HeroSettingsForm from '@/components/admin/HeroSettingsForm'
import HomepageSettingsForm from '@/components/admin/HomepageSettingsForm'
import HomepageSeoSettingsForm from '@/components/admin/HomepageSeoSettingsForm'
import BannerSettingsForm from '@/components/admin/BannerSettingsForm'

type Tab = 'firma' | 'vzhled' | 'homepage'

interface Props {
  settings: Record<string, string>
}

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'firma', label: 'Firma', icon: Building2 },
  { id: 'vzhled', label: 'Vzhľad', icon: Palette },
  { id: 'homepage', label: 'Domovská stránka', icon: LayoutGrid },
]

export default function SettingsTabs({ settings }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('firma')

  return (
    <div>
      {/* Tab bar */}
      <div className="border-b border-slate-200 mb-6">
        <div className="flex gap-0">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  isActive
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'firma' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-base font-semibold">Firemná identita</CardTitle>
              </div>
              <CardDescription>
                Názov firmy, logo, kontaktné údaje, sociálne siete a päta stránky.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BrandingForm settings={settings} />
            </CardContent>
          </Card>

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
        </div>
      )}

      {activeTab === 'vzhled' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-base font-semibold">Vizuálny dizajn</CardTitle>
              </div>
              <CardDescription>
                Primárna farba, custom CSS, font webu a štýl navigačnej lišty.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AppearanceSettingsForm settings={settings} />
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'homepage' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-base font-semibold">Hero sekcia</CardTitle>
              </div>
              <CardDescription>
                Pozadie, badge, nadpisy a tlačidlá v hlavnej hero sekcii.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HeroSettingsForm settings={settings} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-base font-semibold">Obsah domovskej stránky</CardTitle>
              </div>
              <CardDescription>
                Štatistiky (farebný pruh) a sekcia výhod.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HomepageSettingsForm settings={settings} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-base font-semibold">SEO — Domovská stránka</CardTitle>
              </div>
              <CardDescription>
                SEO nadpis, meta popis a OG obrázok (Google, Facebook, Twitter…).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HomepageSeoSettingsForm settings={settings} />
            </CardContent>
          </Card>

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
      )}
    </div>
  )
}
