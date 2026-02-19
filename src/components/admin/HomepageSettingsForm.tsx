'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { Save } from 'lucide-react'

const ICON_OPTIONS = [
  { value: 'shield', label: 'Shield' },
  { value: 'award', label: 'Award' },
  { value: 'trending_down', label: 'Trending Down' },
  { value: 'headphones', label: 'Headphones' },
  { value: 'star', label: 'Star' },
  { value: 'heart', label: 'Heart' },
  { value: 'clock', label: 'Clock' },
  { value: 'check', label: 'Check' },
  { value: 'zap', label: 'Zap' },
  { value: 'car', label: 'Car' },
  { value: 'users', label: 'Users' },
  { value: 'map_pin', label: 'Map Pin' },
  { value: 'wrench', label: 'Wrench' },
]

interface Props {
  settings: Record<string, string>
}

export default function HomepageSettingsForm({ settings }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)

    const updates = [
      { key: 'stat_1_value', value: fd.get('stat_1_value') as string },
      { key: 'stat_1_label', value: fd.get('stat_1_label') as string },
      { key: 'stat_2_value', value: fd.get('stat_2_value') as string },
      { key: 'stat_2_label', value: fd.get('stat_2_label') as string },
      { key: 'stat_3_value', value: fd.get('stat_3_value') as string },
      { key: 'stat_3_label', value: fd.get('stat_3_label') as string },
      { key: 'stat_4_value', value: fd.get('stat_4_value') as string },
      { key: 'stat_4_label', value: fd.get('stat_4_label') as string },
      { key: 'feature_1_icon', value: fd.get('feature_1_icon') as string },
      { key: 'feature_1_title', value: fd.get('feature_1_title') as string },
      { key: 'feature_1_desc', value: fd.get('feature_1_desc') as string },
      { key: 'feature_2_icon', value: fd.get('feature_2_icon') as string },
      { key: 'feature_2_title', value: fd.get('feature_2_title') as string },
      { key: 'feature_2_desc', value: fd.get('feature_2_desc') as string },
      { key: 'feature_3_icon', value: fd.get('feature_3_icon') as string },
      { key: 'feature_3_title', value: fd.get('feature_3_title') as string },
      { key: 'feature_3_desc', value: fd.get('feature_3_desc') as string },
      { key: 'feature_4_icon', value: fd.get('feature_4_icon') as string },
      { key: 'feature_4_title', value: fd.get('feature_4_title') as string },
      { key: 'feature_4_desc', value: fd.get('feature_4_desc') as string },
    ]

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: updates }),
      })
      if (!res.ok) {
        const json = await res.json()
        toast('error', json.error ?? 'Nastala chyba')
        return
      }
      toast('success', 'Nastavenia domovskej stránky uložené')
    } catch {
      toast('error', 'Nastala chyba')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Stats */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-900">Štatistiky (farebný pruh)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="border rounded-lg p-4 space-y-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Štatistika {n}</p>
              <div className="space-y-2">
                <Label htmlFor={`stat_${n}_value`}>Hodnota</Label>
                <Input
                  id={`stat_${n}_value`}
                  name={`stat_${n}_value`}
                  defaultValue={settings[`stat_${n}_value`] ?? ''}
                  placeholder={['500+', '98%', '10+', '24/7'][n - 1]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`stat_${n}_label`}>Popis</Label>
                <Input
                  id={`stat_${n}_label`}
                  name={`stat_${n}_label`}
                  defaultValue={settings[`stat_${n}_label`] ?? ''}
                  placeholder={['Predaných vozidiel', 'Spokojných zákazníkov', 'Rokov na trhu', 'Online podpora'][n - 1]}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="space-y-3 border-t pt-5">
        <p className="text-sm font-medium text-slate-900">Výhody / Prečo my</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="border rounded-lg p-4 space-y-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Výhoda {n}</p>
              <div className="space-y-2">
                <Label htmlFor={`feature_${n}_icon`}>Ikona</Label>
                <select
                  id={`feature_${n}_icon`}
                  name={`feature_${n}_icon`}
                  defaultValue={settings[`feature_${n}_icon`] ?? ''}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Predvolená</option>
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`feature_${n}_title`}>Názov</Label>
                <Input
                  id={`feature_${n}_title`}
                  name={`feature_${n}_title`}
                  defaultValue={settings[`feature_${n}_title`] ?? ''}
                  placeholder={['Overené vozidlá', 'Záruka kvality', 'Férové ceny', 'Podpora zákazníkov'][n - 1]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`feature_${n}_desc`}>Popis</Label>
                <Input
                  id={`feature_${n}_desc`}
                  name={`feature_${n}_desc`}
                  defaultValue={settings[`feature_${n}_desc`] ?? ''}
                  placeholder="Krátky popis výhody…"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        className="bg-orange-500 hover:bg-orange-600 text-white"
        disabled={loading}
      >
        <Save className="h-4 w-4 mr-2" />
        {loading ? 'Ukladám…' : 'Uložiť'}
      </Button>
    </form>
  )
}
