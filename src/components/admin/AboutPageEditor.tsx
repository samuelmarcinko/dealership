'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Save, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Props {
  settings: Record<string, string>
}

interface Field {
  key: string
  label: string
  type: 'input' | 'textarea' | 'icon-select'
  rows?: number
  placeholder?: string
  hint?: string
}

const ICON_OPTIONS = [
  { value: 'shield',        label: 'Shield — štít' },
  { value: 'award',         label: 'Award — ocenenie' },
  { value: 'users',         label: 'Users — ľudia' },
  { value: 'map_pin',       label: 'MapPin — poloha' },
  { value: 'star',          label: 'Star — hviezda' },
  { value: 'heart',         label: 'Heart — srdce' },
  { value: 'clock',         label: 'Clock — hodiny' },
  { value: 'check',         label: 'Check — fajka' },
  { value: 'zap',           label: 'Zap — blesk' },
  { value: 'car',           label: 'Car — auto' },
  { value: 'phone',         label: 'Phone — telefón' },
  { value: 'mail',          label: 'Mail — email' },
  { value: 'wrench',        label: 'Wrench — kľúč' },
  { value: 'headphones',    label: 'Headphones — slúchadlá' },
  { value: 'trending_down', label: 'TrendingDown — cena klesá' },
]

const MAIN_SECTIONS: { title: string; description?: string; fields: Field[] }[] = [
  {
    title: 'Hero sekcia',
    description: 'Nadpis a podtitulok v hornej čiernej sekcii stránky.',
    fields: [
      { key: 'about_hero_title',    label: 'Nadpis',      type: 'input',    placeholder: 'O nás' },
      { key: 'about_hero_subtitle', label: 'Podtitulok',  type: 'textarea', rows: 2,
        placeholder: 'Sme profesionálny autobazár s dlhoročnou tradíciou...' },
    ],
  },
  {
    title: 'Náš príbeh',
    description: 'Text v strednej sekcii vedľa štatistík. Môžete použiť HTML tagy <p>, <strong>, <br>.',
    fields: [
      { key: 'about_story', label: 'Text príbehu', type: 'textarea', rows: 8,
        hint: 'Každý odstavec zabaľte do <p>...</p>. Napr.: <p>Prvý odstavec.</p><p>Druhý odstavec.</p>' },
    ],
  },
  {
    title: 'Náš tím',
    description: 'Krátky popis tímu v dolnej bielej sekcii.',
    fields: [
      { key: 'about_team_text', label: 'Popis tímu', type: 'textarea', rows: 3,
        placeholder: 'Tím skúsených odborníkov, ktorí sú vám vždy k dispozícii...' },
    ],
  },
]

const VALUE_SECTIONS: { title: string; fields: Field[] }[] = [
  {
    title: 'Hodnota 1',
    fields: [
      { key: 'about_value_1_icon',  label: 'Ikona',  type: 'icon-select' },
      { key: 'about_value_1_title', label: 'Názov',  type: 'input',    placeholder: 'Dôveryhodnosť' },
      { key: 'about_value_1_desc',  label: 'Popis',  type: 'textarea', rows: 2,
        placeholder: 'Každé vozidlo prechádza dôkladnou technickou kontrolou.' },
    ],
  },
  {
    title: 'Hodnota 2',
    fields: [
      { key: 'about_value_2_icon',  label: 'Ikona',  type: 'icon-select' },
      { key: 'about_value_2_title', label: 'Názov',  type: 'input',    placeholder: 'Kvalita' },
      { key: 'about_value_2_desc',  label: 'Popis',  type: 'textarea', rows: 2,
        placeholder: 'Ponúkame len vozidlá vo výbornom technickom stave.' },
    ],
  },
  {
    title: 'Hodnota 3',
    fields: [
      { key: 'about_value_3_icon',  label: 'Ikona',  type: 'icon-select' },
      { key: 'about_value_3_title', label: 'Názov',  type: 'input',    placeholder: 'Zákaznícky servis' },
      { key: 'about_value_3_desc',  label: 'Popis',  type: 'textarea', rows: 2,
        placeholder: 'Naši odborníci sú vám k dispozícii pred aj po kúpe.' },
    ],
  },
  {
    title: 'Hodnota 4',
    fields: [
      { key: 'about_value_4_icon',  label: 'Ikona',  type: 'icon-select' },
      { key: 'about_value_4_title', label: 'Názov',  type: 'input',    placeholder: 'Miestny predajca' },
      { key: 'about_value_4_desc',  label: 'Popis',  type: 'textarea', rows: 2,
        placeholder: 'Sme tu pre vás osobne — nie len online.' },
    ],
  },
]

const STAT_FIELDS: { key: string; label: string; defaultValue: string; defaultLabel: string }[] = [
  { key: 'stat_1', label: 'Štatistika 1', defaultValue: '500+', defaultLabel: 'Predaných vozidiel' },
  { key: 'stat_2', label: 'Štatistika 2', defaultValue: '98%',  defaultLabel: 'Spokojných zákazníkov' },
  { key: 'stat_3', label: 'Štatistika 3', defaultValue: '10+',  defaultLabel: 'Rokov na trhu' },
  { key: 'stat_4', label: 'Štatistika 4', defaultValue: '24/7', defaultLabel: 'Online podpora' },
]

const ALL_MAIN_KEYS   = MAIN_SECTIONS.flatMap(s => s.fields.map(f => f.key))
const ALL_VALUE_KEYS  = VALUE_SECTIONS.flatMap(s => s.fields.map(f => f.key))
const ALL_STAT_KEYS   = STAT_FIELDS.flatMap(s => [`${s.key}_value`, `${s.key}_label`])
const ALL_KEYS        = [...ALL_MAIN_KEYS, ...ALL_VALUE_KEYS, ...ALL_STAT_KEYS]

export default function AboutPageEditor({ settings }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    ALL_KEYS.forEach(k => { init[k] = settings[k] ?? '' })
    return init
  })
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const [error,  setError]  = useState<string | null>(null)

  function set(key: string, value: string) {
    setValues(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: ALL_KEYS.map(k => ({ key: k, value: values[k] ?? '' })),
        }),
      })
      if (!res.ok) throw new Error('Chyba servera')
      setSaved(true)
    } catch {
      setError('Nastala chyba pri ukladaní. Skúste to znova.')
    } finally {
      setSaving(false)
    }
  }

  function renderField(field: Field) {
    if (field.type === 'icon-select') {
      return (
        <Select value={values[field.key] || ''} onValueChange={v => set(field.key, v)}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="— vybrať ikonu —" />
          </SelectTrigger>
          <SelectContent>
            {ICON_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }
    if (field.type === 'textarea') {
      return (
        <Textarea
          id={field.key}
          rows={field.rows ?? 3}
          placeholder={field.placeholder}
          value={values[field.key]}
          onChange={e => set(field.key, e.target.value)}
          className="text-sm"
        />
      )
    }
    return (
      <Input
        id={field.key}
        placeholder={field.placeholder}
        value={values[field.key]}
        onChange={e => set(field.key, e.target.value)}
        className="text-sm"
      />
    )
  }

  const saveBtn = (
    <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white">
      <Save className="h-4 w-4 mr-2" />
      {saving ? 'Ukladám...' : saved ? 'Uložené ✓' : 'Uložiť zmeny'}
    </Button>
  )

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="text-slate-500">
            <Link href="/admin/pages">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Stránky
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">O nás</h1>
            <p className="text-slate-500 text-sm">Editujte obsah stránky /about</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Náhľad
          </a>
          {saveBtn}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Main sections */}
      {MAIN_SECTIONS.map(section => (
        <Card key={section.title}>
          <CardHeader>
            <CardTitle className="text-base">{section.title}</CardTitle>
            {section.description && (
              <CardDescription>{section.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {section.fields.map(field => (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={field.key}>{field.label}</Label>
                {field.type === 'textarea' ? (
                  <Textarea
                    id={field.key}
                    rows={field.rows ?? 3}
                    placeholder={field.placeholder}
                    value={values[field.key]}
                    onChange={e => set(field.key, e.target.value)}
                  />
                ) : (
                  <Input
                    id={field.key}
                    placeholder={field.placeholder}
                    value={values[field.key]}
                    onChange={e => set(field.key, e.target.value)}
                  />
                )}
                {field.hint && (
                  <p className="text-xs text-slate-400">{field.hint}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Stats — 2x2 grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Štatistiky</CardTitle>
          <CardDescription>
            Štyri čísla zobrazené v sekcii &quot;Náš príbeh&quot;. Používajú sa aj na hlavnej stránke.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {STAT_FIELDS.map(stat => (
              <div key={stat.key} className="space-y-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-sm font-semibold text-slate-700">{stat.label}</p>
                <div className="space-y-1.5">
                  <Label htmlFor={`${stat.key}_value`} className="text-xs text-slate-500">Hodnota</Label>
                  <Input
                    id={`${stat.key}_value`}
                    placeholder={stat.defaultValue}
                    value={values[`${stat.key}_value`]}
                    onChange={e => set(`${stat.key}_value`, e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`${stat.key}_label`} className="text-xs text-slate-500">Popis</Label>
                  <Input
                    id={`${stat.key}_label`}
                    placeholder={stat.defaultLabel}
                    value={values[`${stat.key}_label`]}
                    onChange={e => set(`${stat.key}_label`, e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Values — 2x2 grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Naše hodnoty</CardTitle>
          <CardDescription>Štyri hodnoty zobrazené v sekcii &quot;Čo nás definuje&quot;.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUE_SECTIONS.map(section => (
              <div key={section.title} className="space-y-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-sm font-semibold text-slate-700">{section.title}</p>
                {section.fields.map(field => (
                  <div key={field.key} className="space-y-1.5">
                    <Label htmlFor={field.key} className="text-xs text-slate-500">{field.label}</Label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom save */}
      <div className="flex justify-end pb-6">
        {saveBtn}
      </div>
    </div>
  )
}
