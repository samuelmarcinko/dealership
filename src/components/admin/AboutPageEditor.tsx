'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Save, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface Props {
  settings: Record<string, string>
}

interface Field {
  key: string
  label: string
  type: 'input' | 'textarea'
  rows?: number
  placeholder?: string
  hint?: string
}

const SECTIONS: { title: string; description?: string; fields: Field[] }[] = [
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
  {
    title: 'Hodnota 1',
    fields: [
      { key: 'about_value_1_title', label: 'Názov',  type: 'input',    placeholder: 'Dôveryhodnosť' },
      { key: 'about_value_1_desc',  label: 'Popis',  type: 'textarea', rows: 2,
        placeholder: 'Každé vozidlo prechádza dôkladnou technickou kontrolou.' },
    ],
  },
  {
    title: 'Hodnota 2',
    fields: [
      { key: 'about_value_2_title', label: 'Názov', type: 'input',    placeholder: 'Kvalita' },
      { key: 'about_value_2_desc',  label: 'Popis', type: 'textarea', rows: 2,
        placeholder: 'Ponúkame len vozidlá vo výbornom technickom stave.' },
    ],
  },
  {
    title: 'Hodnota 3',
    fields: [
      { key: 'about_value_3_title', label: 'Názov', type: 'input',    placeholder: 'Zákaznícky servis' },
      { key: 'about_value_3_desc',  label: 'Popis', type: 'textarea', rows: 2,
        placeholder: 'Naši odborníci sú vám k dispozícii pred aj po kúpe.' },
    ],
  },
  {
    title: 'Hodnota 4',
    fields: [
      { key: 'about_value_4_title', label: 'Názov', type: 'input',    placeholder: 'Miestny predajca' },
      { key: 'about_value_4_desc',  label: 'Popis', type: 'textarea', rows: 2,
        placeholder: 'Sme tu pre vás osobne — nie len online.' },
    ],
  },
]

// All keys managed by this editor
const ALL_KEYS = SECTIONS.flatMap(s => s.fields.map(f => f.key))

export default function AboutPageEditor({ settings }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    ALL_KEYS.forEach(k => { init[k] = settings[k] ?? '' })
    return init
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  // Group values 1-4 into a 2x2 grid for display
  const mainSections = SECTIONS.slice(0, 3)
  const valueSections = SECTIONS.slice(3)

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
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Ukladám...' : saved ? 'Uložené ✓' : 'Uložiť zmeny'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Main sections */}
      {mainSections.map(section => (
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

      {/* Values — 2x2 grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Naše hodnoty</CardTitle>
          <CardDescription>Štyri hodnoty zobrazené v sekcii &quot;Čo nás definuje&quot;.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {valueSections.map(section => (
              <div key={section.title} className="space-y-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-sm font-semibold text-slate-700">{section.title}</p>
                {section.fields.map(field => (
                  <div key={field.key} className="space-y-1.5">
                    <Label htmlFor={field.key} className="text-xs text-slate-500">{field.label}</Label>
                    {field.type === 'textarea' ? (
                      <Textarea
                        id={field.key}
                        rows={field.rows ?? 2}
                        placeholder={field.placeholder}
                        value={values[field.key]}
                        onChange={e => set(field.key, e.target.value)}
                        className="text-sm"
                      />
                    ) : (
                      <Input
                        id={field.key}
                        placeholder={field.placeholder}
                        value={values[field.key]}
                        onChange={e => set(field.key, e.target.value)}
                        className="text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom save */}
      <div className="flex justify-end pb-6">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Ukladám...' : 'Uložiť zmeny'}
        </Button>
      </div>
    </div>
  )
}
