import React from 'react'
import type { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import ImportSettingsForm from '@/components/admin/ImportSettingsForm'
import { Rss, Info } from 'lucide-react'

export const metadata: Metadata = { title: 'Import nastavenia' }

export default async function SettingsPage() {
  const settings = await prisma.tenantSettings.findMany()
  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Import nastavenia</h1>
        <p className="text-slate-500 text-sm mt-1">
          Konfigurácia importu vozidiel z externého XML feedu
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Rss className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-base font-semibold">XML Feed Nastavenia</CardTitle>
              </div>
              <CardDescription>
                Zadajte URL adresu XML feedu z autobazar.eu alebo iného zdroja vozidiel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImportSettingsForm
                xmlFeedUrl={settingsMap['xml_feed_url'] ?? ''}
                syncInterval={settingsMap['sync_interval_minutes'] ?? '30'}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-base font-semibold">Informácie</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 space-y-3">
              <p>
                <strong>Fáza 1:</strong> Ukladáme URL adresu feedu pre neskorší import.
              </p>
              <p>
                <strong>Fáza 2</strong> implementuje automatický sync každých{' '}
                <strong>{settingsMap['sync_interval_minutes'] ?? '30'} minút</strong>{' '}
                pomocou background workera.
              </p>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p className="text-blue-700 text-xs">
                  Vozidlá importované z XML feedu budú označené externým ID a aktualizované automaticky
                  pri každom syncu.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
