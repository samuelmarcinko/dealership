'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import {
  FileText, Upload, Trash2, ToggleLeft, ToggleRight, Info, ChevronDown, ChevronUp
} from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string | null
  originalName: string
  isActive: boolean
  sortOrder: number
  createdAt: string | Date
}

interface Props {
  initialTemplates: Template[]
}

const VARIABLES = [
  { group: 'Klient (kupujúci)', vars: [
    '{klient_meno}', '{klient_priezvisko}', '{klient_cele_meno}',
    '{klient_firma}', '{klient_nazov}',
    '{klient_ico}', '{klient_dic}', '{klient_ic_dph}',
    '{klient_telefon}', '{klient_email}', '{klient_adresa}',
  ]},
  { group: 'Vozidlo', vars: [
    '{vozidlo_titul}', '{vozidlo_znacka}', '{vozidlo_model}', '{vozidlo_variant}',
    '{vozidlo_rok}', '{vozidlo_vin}', '{vozidlo_farba}', '{vozidlo_km}',
    '{vozidlo_palivo}', '{vozidlo_prevodovka}', '{vozidlo_karoseria}',
    '{vozidlo_objem}', '{vozidlo_vykon}',
  ]},
  { group: 'Predaj', vars: [
    '{predaj_cena}', '{predaj_cena_cislo}', '{predaj_datum}', '{predaj_poznamka}',
  ]},
  { group: 'Predajca (z Nastavení)', vars: [
    '{predajca_nazov}', '{predajca_adresa}', '{predajca_telefon}',
    '{predajca_email}', '{predajca_ico}', '{predajca_dic}',
  ]},
  { group: 'Ostatné', vars: ['{datum_dnes}'] },
]

export default function DocumentTemplatesManager({ initialTemplates }: Props) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [templates, setTemplates] = useState<Template[]>(initialTemplates)
  const [uploading, setUploading] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showVars, setShowVars] = useState(false)

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFile || !name.trim()) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', selectedFile)
      fd.append('name', name.trim())
      if (description.trim()) fd.append('description', description.trim())

      const res = await fetch('/api/documents/templates', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) { toast('error', json.error ?? 'Nastala chyba'); return }

      setTemplates((prev) => [...prev, json.data])
      setName('')
      setDescription('')
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      toast('success', 'Šablóna nahraná')
    } catch {
      toast('error', 'Nastala chyba pri nahrávaní')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Naozaj odstrániť túto šablónu?')) return
    const res = await fetch(`/api/documents/templates/${id}`, { method: 'DELETE' })
    if (!res.ok) { toast('error', 'Nepodarilo sa odstrániť'); return }
    setTemplates((prev) => prev.filter((t) => t.id !== id))
    toast('success', 'Šablóna odstránená')
  }

  async function toggleActive(t: Template) {
    const res = await fetch(`/api/documents/templates/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !t.isActive }),
    })
    if (!res.ok) { toast('error', 'Nastala chyba'); return }
    const json = await res.json()
    setTemplates((prev) => prev.map((x) => x.id === t.id ? json.data : x))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Šablóny dokumentov</h1>
        <p className="text-slate-500 text-sm mt-1">
          Nahrajte .docx šablóny s premennými — pri predaji vozidla sa automaticky doplnia dáta klienta.
        </p>
      </div>

      {/* Upload form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
              <Upload className="h-4 w-4 text-orange-600" />
            </span>
            Nahrať novú šablónu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tpl-name">Názov šablóny *</Label>
                <Input
                  id="tpl-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Kúpno-predajná zmluva"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tpl-desc">Popis <span className="text-slate-400 font-normal text-xs">— nepovinný</span></Label>
                <Input
                  id="tpl-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Pre fyzické osoby"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Súbor (.docx) *</Label>
              <div
                className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-orange-300 hover:bg-orange-50/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                {selectedFile ? (
                  <p className="text-sm font-medium text-slate-700">{selectedFile.name}</p>
                ) : (
                  <>
                    <p className="text-sm text-slate-600 font-medium">Kliknite pre výber súboru</p>
                    <p className="text-xs text-slate-400 mt-1">Len .docx — max 20 MB</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={!selectedFile || !name.trim() || uploading}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {uploading ? 'Nahrávam...' : 'Nahrať šablónu'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Variables reference */}
      <Card>
        <CardHeader className="pb-0">
          <button
            type="button"
            className="flex items-center justify-between w-full text-left"
            onClick={() => setShowVars((v) => !v)}
          >
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <Info className="h-4 w-4 text-blue-600" />
              </span>
              Dostupné premenné
            </CardTitle>
            {showVars ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>
        </CardHeader>
        {showVars && (
          <CardContent className="pt-4">
            <p className="text-sm text-slate-500 mb-4">
              Vložte tieto premenné do vášho <strong>.docx</strong> dokumentu presne ako sú napísané (vrátane zložených zátvoriek).
              Pri generovaní sa automaticky nahradia skutočnými dátami.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {VARIABLES.map((group) => (
                <div key={group.group}>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{group.group}</p>
                  <div className="space-y-1">
                    {group.vars.map((v) => (
                      <code
                        key={v}
                        className="block text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-mono"
                      >
                        {v}
                      </code>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Template list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
              <FileText className="h-4 w-4 text-green-600" />
            </span>
            Nahrané šablóny
            <span className="ml-1 text-sm font-normal text-slate-400">({templates.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {templates.length === 0 ? (
            <p className="px-6 py-8 text-center text-slate-400 text-sm">Zatiaľ žiadne šablóny. Nahrajte prvú.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {templates.map((t) => (
                <div key={t.id} className="flex items-center gap-4 px-6 py-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${t.isActive ? 'bg-green-100' : 'bg-slate-100'}`}>
                    <FileText className={`h-4 w-4 ${t.isActive ? 'text-green-600' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${t.isActive ? 'text-slate-900' : 'text-slate-400'}`}>{t.name}</p>
                    <p className="text-xs text-slate-400 truncate">{t.originalName}</p>
                    {t.description && <p className="text-xs text-slate-400 truncate">{t.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleActive(t)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                        t.isActive
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                      title={t.isActive ? 'Deaktivovať' : 'Aktivovať'}
                    >
                      {t.isActive
                        ? <><ToggleRight className="h-3.5 w-3.5" />Aktívna</>
                        : <><ToggleLeft className="h-3.5 w-3.5" />Neaktívna</>
                      }
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(t.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Odstrániť"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
