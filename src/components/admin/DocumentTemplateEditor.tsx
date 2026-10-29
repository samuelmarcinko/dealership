'use client'

import React, { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import ContractEditor from '@/components/admin/ContractEditor'
import { cn } from '@/lib/utils'
import type { CustomField } from '@/lib/documents/schema'
import { ArrowLeft, Save, Upload, Plus, Trash2, Loader2 } from 'lucide-react'

export interface TemplateFormValue {
  id: string | null
  name: string
  description: string
  content: string
  customFields: CustomField[]
  isActive: boolean
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Dlhý text' },
  { value: 'number', label: 'Číslo' },
  { value: 'amount', label: 'Suma (€)' },
  { value: 'date', label: 'Dátum' },
  { value: 'checkbox', label: 'Áno / Nie' },
] as const

export default function DocumentTemplateEditor({ initial }: { initial: TemplateFormValue }) {
  const router = useRouter()
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<TemplateFormValue>(initial)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)

  function set<K extends keyof TemplateFormValue>(key: K, value: TemplateFormValue[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleImport(file: File) {
    setImporting(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/documents/templates/import', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Import zlyhal')

      set('content', json.data.html)
      if (!form.name.trim()) set('name', file.name.replace(/\.docx$/i, ''))
      toast('success', 'Dokument načítaný — teraz doplňte premenné tam, kde sa majú dopĺňať údaje.')
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Import zlyhal')
    } finally {
      setImporting(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast('error', 'Zadajte názov šablóny')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        content: form.content,
        customFields: form.customFields,
        isActive: form.isActive,
      }
      const res = await fetch(
        form.id ? `/api/documents/templates/${form.id}` : '/api/documents/templates',
        {
          method: form.id ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Uloženie zlyhalo')

      toast('success', 'Šablóna uložená')
      router.push('/admin/documents')
      router.refresh()
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Uloženie zlyhalo')
    } finally {
      setSaving(false)
    }
  }

  // ── Vlastné polia ────────────────────────────────────────────────────────

  function addField() {
    set('customFields', [
      ...form.customFields,
      { key: '', label: '', type: 'text', defaultValue: '' },
    ])
  }

  function updateField(index: number, patch: Partial<CustomField>) {
    set(
      'customFields',
      form.customFields.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    )
  }

  function removeField(index: number) {
    set('customFields', form.customFields.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link
            href="/admin/documents"
            className="mt-1 p-2 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {form.id ? 'Upraviť šablónu' : 'Nová šablóna'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Text, ktorý sa pri generovaní doplní o údaje a ešte sa dá ručne upraviť.
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 shrink-0">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Uložiť
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Základné údaje</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="tpl-name">Názov šablóny *</Label>
              <Input
                id="tpl-name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Sprostredkovateľská zmluva"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="tpl-desc">Krátky popis</Label>
              <Input
                id="tpl-desc"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Zmluva pri prevzatí vozidla do komisie"
                className="mt-1.5"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set('isActive', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
            />
            <span className="text-sm text-slate-700">Aktívna — ponúkať pri predaji vozidla</span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base">Text dokumentu</CardTitle>
            <CardDescription>
              Cez „Vložiť premennú“ pridajte miesta, kde sa majú doplniť údaje o vozidle a zákazníkovi.
            </CardDescription>
          </div>
          <div className="shrink-0">
            <input
              ref={fileRef}
              type="file"
              accept=".docx"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleImport(f)
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              className="gap-2"
            >
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Načítať z Wordu
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ContractEditor value={form.content} onChange={(html) => set('content', html)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Polia dopĺňané pri generovaní</CardTitle>
          <CardDescription>
            Údaje, ktoré systém nepozná — napríklad provízia, počet kľúčov alebo rodné číslo.
            Pri generovaní sa na ne spýta a doplní ich do textu cez premennú s rovnakým kľúčom.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.customFields.length === 0 && (
            <p className="text-sm text-slate-500">Zatiaľ žiadne polia.</p>
          )}

          {form.customFields.map((field, index) => (
            <div key={index} className="flex flex-wrap items-end gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/60">
              <div className="w-44">
                <Label className="text-xs">Kľúč (premenná)</Label>
                <Input
                  value={field.key}
                  onChange={(e) => updateField(index, { key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
                  placeholder="provizia"
                  className="mt-1 font-mono text-xs"
                />
              </div>
              <div className="flex-1 min-w-48">
                <Label className="text-xs">Popis poľa</Label>
                <Input
                  value={field.label}
                  onChange={(e) => updateField(index, { label: e.target.value })}
                  placeholder="Provízia (€ s DPH)"
                  className="mt-1"
                />
              </div>
              <div className="w-36">
                <Label className="text-xs">Typ</Label>
                <select
                  value={field.type}
                  onChange={(e) => updateField(index, { type: e.target.value as CustomField['type'] })}
                  className="mt-1 w-full h-10 rounded-md border border-slate-200 bg-white px-2 text-sm"
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="w-36">
                <Label className="text-xs">Predvolená hodnota</Label>
                <Input
                  value={field.defaultValue ?? ''}
                  onChange={(e) => updateField(index, { defaultValue: e.target.value })}
                  className="mt-1"
                />
              </div>
              <button
                type="button"
                onClick={() => removeField(index)}
                className="h-10 px-2 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"
                title="Odstrániť pole"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              {field.key && (
                <p className="w-full text-[11px] text-slate-500">
                  V texte použite <code className="font-mono text-orange-700">{`{${field.key}}`}</code>
                  {field.type === 'amount' && (
                    <>
                      {' '}— doplní sa suma s medzerami medzi tisíckami. Navyše vznikne
                      {' '}<code className="font-mono text-orange-700">{`{${field.key}_slovom}`}</code>
                      {' '}so sumou vypísanou slovom, takže ju netreba písať ručne.
                    </>
                  )}
                  {field.type === 'checkbox' && (
                    <>
                      {' '}— doplní sa „Áno“ alebo „Nie“. Pre tabuľku so stĺpcami Áno/Nie použite
                      {' '}<code className="font-mono text-orange-700">{`{${field.key}_ano}`}</code> a
                      {' '}<code className="font-mono text-orange-700">{`{${field.key}_nie}`}</code>,
                      {' '}do platného stĺpca sa vloží krížik.
                    </>
                  )}
                </p>
              )}
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addField} className="gap-2">
            <Plus className="h-4 w-4" />
            Pridať pole
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
