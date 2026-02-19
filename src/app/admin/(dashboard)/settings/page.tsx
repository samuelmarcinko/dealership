import React from 'react'
import type { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getTenantSettings } from '@/lib/tenant'
import ImportSettingsForm from '@/components/admin/ImportSettingsForm'
import BrandingForm from '@/components/admin/BrandingForm'
import SyncStatusCard from '@/components/admin/SyncStatusCard'
import { Rss, Palette, Info } from 'lucide-react'

export const metadata: Metadata = { title: 'Nastavenia' }

export default async function SettingsPage() {
  const settings = await getTenantSettings()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nastavenia</h1>
        <p className="text-slate-500 text-sm mt-1">Konfigurácia platformy pre vášho tenantu</p>
      </div>

      {/* ── XML Import ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Rss className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-base font-semibold">XML Feed Import</CardTitle>
              </div>
              <CardDescription>
                Automatický import vozidiel z autobazar.eu alebo iného XML zdroja.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImportSettingsForm
                xmlFeedUrl={settings['xml_feed_url'] ?? ''}
                syncInterval={settings['sync_interval_minutes'] ?? '30'}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sync status */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-base font-semibold">Stav synchronizácie</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <SyncStatusCard />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-sm text-slate-600 space-y-2">
                <p className="font-medium text-slate-900">Ako funguje import?</p>
                <ul className="space-y-1 text-slate-500 list-disc list-inside">
                  <li>Nové vozidlá sa automaticky pridajú</li>
                  <li>Existujúce sa aktualizujú podľa XML</li>
                  <li>Vozidlá chýbajúce vo feede sa označia ako Predané</li>
                  <li>Manuálne pridané vozidlá nie sú ovplyvnené</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Branding ────────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-base font-semibold">Branding & Kontakt</CardTitle>
          </div>
          <CardDescription>
            Názov firmy, logo, kontaktné údaje a sociálne siete zobrazené na verejnej stránke.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BrandingForm settings={settings} />
        </CardContent>
      </Card>
    </div>
  )
}
