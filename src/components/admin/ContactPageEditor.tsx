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
      { key: 'contact_hero_title',    label: 'Nadpis',      type: 'input',    placeholder: 'Kontakt' },
      { key: 'contact_hero_subtitle', label: 'Podtitulok',  type: 'textarea', rows: 2,
        placeholder: 'Máte otázku alebo záujem o vozidlo? Sme tu pre vás.' },
    ],
  },
  {
    title: 'Kontaktné údaje',
    description: 'Zobrazujú sa ako info kartičky a používajú sa aj inde na webe (päta, stránka O nás...).',
    fields: [
      { key: 'contact_phone',   label: 'Telefón',  type: 'input',    placeholder: '+421 900 000 000' },
      { key: 'contact_email',   label: 'Email',    type: 'input',    placeholder: 'info@autobazar.sk' },
      { key: 'contact_address', label: 'Adresa',   type: 'input',    placeholder: 'Hlavná 1, 010 01 Žilina' },
      { key: 'contact_hours',   label: 'Otváracie hodiny', type: 'textarea', rows: 3,
        placeholder: 'Po–Pia: 9:00–17:00\nSo: 9:00–13:00',
        hint: 'Každý riadok = jeden čas. Napr.: Po–Pia: 9:00–17:00' },
    ],
  },
  {
    title: 'Google Maps',
    description: 'Vložte embed URL z Google Maps (Zdieľať → Vložiť mapu → skopírovať src atribút z iframe).',
    fields: [
      { key: 'contact_map_url', label: 'Embed URL mapy', type: 'input',
        placeholder: 'https://www.google.com/maps/embed?pb=...',
        hint: 'Formát: https://www.google.com/maps/embed?pb=...' },
    ],
  },
]

const ALL_KEYS = SECTIONS.flatMap(s => s.fields.map(f => f.key))

export default function ContactPageEditor({ settings }: Props) {
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
            <h1 className="text-2xl font-bold text-slate-900">Kontakt</h1>
            <p className="text-slate-500 text-sm">Editujte obsah stránky /contact</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/contact"
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

      {SECTIONS.map(section => (
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

      {/* Bottom save */}
      <div className="flex justify-end pb-6">
        {saveBtn}
      </div>
    </div>
  )
}
