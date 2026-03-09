'use client'

import React, { useState } from 'react'
import { Building2, Palette, LayoutGrid, ImageIcon, Search, Megaphone, Phone, ChevronDown } from 'lucide-react'
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

function CollapsibleSection({
  title,
  description,
  icon: Icon,
  defaultOpen = true,
  children,
}: {
  title: string
  description?: string
  icon: React.ElementType
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
          </div>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
        {description && (
          <CardDescription className="mt-1">{description}</CardDescription>
        )}
      </CardHeader>
      {open && <CardContent>{children}</CardContent>}
    </Card>
  )
}

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
          <CollapsibleSection
            title="Firemná identita"
            description="Názov firmy, logo, kontaktné údaje, sociálne siete a päta stránky."
            icon={Building2}
          >
            <BrandingForm settings={settings} />
          </CollapsibleSection>

          <CollapsibleSection
            title={'Stránka \u201EKontakt\u201C'}
            description="Hero sekcia, otváracie hodiny a mapa."
            icon={Phone}
          >
            <ContactSettingsForm settings={settings} />
          </CollapsibleSection>
        </div>
      )}

      {activeTab === 'vzhled' && (
        <div className="space-y-6">
          <CollapsibleSection
            title="Vizuálny dizajn"
            description="Primárna farba, custom CSS, font webu a štýl navigačnej lišty."
            icon={Palette}
          >
            <AppearanceSettingsForm settings={settings} />
          </CollapsibleSection>
        </div>
      )}

      {activeTab === 'homepage' && (
        <div className="space-y-6">
          <CollapsibleSection
            title="Hero sekcia"
            description="Pozadie, badge, nadpisy a tlačidlá v hlavnej hero sekcii."
            icon={ImageIcon}
          >
            <HeroSettingsForm settings={settings} />
          </CollapsibleSection>

          <CollapsibleSection
            title="Obsah domovskej stránky"
            description="Štatistiky (farebný pruh) a sekcia výhod."
            icon={LayoutGrid}
          >
            <HomepageSettingsForm settings={settings} />
          </CollapsibleSection>

          <CollapsibleSection
            title="SEO — Domovská stránka"
            description="SEO nadpis, meta popis a OG obrázok (Google, Facebook, Twitter…)."
            icon={Search}
          >
            <HomepageSeoSettingsForm settings={settings} />
          </CollapsibleSection>

          <CollapsibleSection
            title="Oznamovací pruh (Banner)"
            description="Tenký pruh v hornej časti stránky s oznámením alebo akciou."
            icon={Megaphone}
          >
            <BannerSettingsForm settings={settings} />
          </CollapsibleSection>
        </div>
      )}
    </div>
  )
}
