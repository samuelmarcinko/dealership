'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { Save } from 'lucide-react'

const ICON_OPTIONS = [
  { value: 'shield', label: 'Shield' },
  { value: 'award', label: 'Award' },
  { value: 'users', label: 'Users' },
  { value: 'map_pin', label: 'Map Pin' },
  { value: 'star', label: 'Star' },
  { value: 'heart', label: 'Heart' },
  { value: 'clock', label: 'Clock' },
  { value: 'check', label: 'Check' },
  { value: 'zap', label: 'Zap' },
  { value: 'car', label: 'Car' },
  { value: 'wrench', label: 'Wrench' },
  { value: 'headphones', label: 'Headphones' },
]

interface Props {
  settings: Record<string, string>
}

export default function AboutSettingsForm({ settings }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)

    const updates = [
      { key: 'about_hero_title', value: fd.get('about_hero_title') as string },
      { key: 'about_hero_subtitle', value: fd.get('about_hero_subtitle') as string },
      { key: 'about_story', value: fd.get('about_story') as string },
      { key: 'about_value_1_icon', value: fd.get('about_value_1_icon') as string },
      { key: 'about_value_1_title', value: fd.get('about_value_1_title') as string },
      { key: 'about_value_1_desc', value: fd.get('about_value_1_desc') as string },
      { key: 'about_value_2_icon', value: fd.get('about_value_2_icon') as string },
      { key: 'about_value_2_title', value: fd.get('about_value_2_title') as string },
      { key: 'about_value_2_desc', value: fd.get('about_value_2_desc') as string },
      { key: 'about_value_3_icon', value: fd.get('about_value_3_icon') as string },
      { key: 'about_value_3_title', value: fd.get('about_value_3_title') as string },
      { key: 'about_value_3_desc', value: fd.get('about_value_3_desc') as string },
      { key: 'about_value_4_icon', value: fd.get('about_value_4_icon') as string },
      { key: 'about_value_4_title', value: fd.get('about_value_4_title') as string },
      { key: 'about_value_4_desc', value: fd.get('about_value_4_desc') as string },
      { key: 'about_team_text', value: fd.get('about_team_text') as string },
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
      toast('success', 'Stránka „O nás" uložená')
    } catch {
      toast('error', 'Nastala chyba')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Hero */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-slate-900">Hero sekcia</p>
        <div className="space-y-2">
          <Label htmlFor="about_hero_title">Nadpis</Label>
          <Input
            id="about_hero_title"
            name="about_hero_title"
            defaultValue={settings['about_hero_title'] ?? ''}
            placeholder="O nás"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="about_hero_subtitle">Podnadpis</Label>
          <Textarea
            id="about_hero_subtitle"
            name="about_hero_subtitle"
            rows={2}
            defaultValue={settings['about_hero_subtitle'] ?? ''}
            placeholder="Sme profesionálny autobazár s dlhoročnou tradíciou…"
          />
        </div>
      </div>

      {/* Story */}
      <div className="space-y-2 border-t pt-5">
        <Label htmlFor="about_story">Príbeh firmy (HTML)</Label>
        <Textarea
          id="about_story"
          name="about_story"
          rows={6}
          defaultValue={settings['about_story'] ?? ''}
          placeholder="<p>Náš príbeh...</p>"
          className="font-mono text-sm"
        />
        <p className="text-xs text-slate-400">Môžete použiť HTML tagy ako &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;. Prázdne = predvolený text.</p>
      </div>

      {/* Values */}
      <div className="space-y-3 border-t pt-5">
        <p className="text-sm font-medium text-slate-900">Hodnoty</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="border rounded-lg p-4 space-y-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Hodnota {n}</p>
              <div className="space-y-2">
                <Label htmlFor={`about_value_${n}_icon`}>Ikona</Label>
                <select
                  id={`about_value_${n}_icon`}
                  name={`about_value_${n}_icon`}
                  defaultValue={settings[`about_value_${n}_icon`] ?? ''}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Predvolená</option>
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`about_value_${n}_title`}>Názov</Label>
                <Input
                  id={`about_value_${n}_title`}
                  name={`about_value_${n}_title`}
                  defaultValue={settings[`about_value_${n}_title`] ?? ''}
                  placeholder={['Dôveryhodnosť', 'Kvalita', 'Zákaznícky servis', 'Miestny predajca'][n - 1]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`about_value_${n}_desc`}>Popis</Label>
                <Input
                  id={`about_value_${n}_desc`}
                  name={`about_value_${n}_desc`}
                  defaultValue={settings[`about_value_${n}_desc`] ?? ''}
                  placeholder="Krátky popis hodnoty…"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team text */}
      <div className="space-y-2 border-t pt-5">
        <Label htmlFor="about_team_text">Text o tíme</Label>
        <Textarea
          id="about_team_text"
          name="about_team_text"
          rows={3}
          defaultValue={settings['about_team_text'] ?? ''}
          placeholder="Tím skúsených odborníkov, ktorí sú vám vždy k dispozícii…"
        />
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
