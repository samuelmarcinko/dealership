'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ContractEditor from '@/components/admin/ContractEditor'
import { cn } from '@/lib/utils'
import type { CustomField } from '@/lib/documents/schema'
import { amountToSlovakWords, formatAmount } from '@/lib/documents/placeholders'
import {
  FileText, Loader2, AlertCircle, ArrowRight, ArrowLeft, Printer, Check,
} from 'lucide-react'

interface ApplicableTemplate {
  id: string
  name: string
  description: string | null
  customFields: CustomField[]
}

interface PreparedDocument {
  templateId: string
  name: string
  content: string
}

type Step = 'select' | 'fields' | 'edit'

export interface DraftSale {
  customerId: string
  soldPrice: number
  soldAt?: string
  soldNote?: string
  commissionRate?: number | null
}

interface Props {
  vehicleId: string
  party: 'buyer' | 'consignor'
  /**
   * Rozpracovaný predaj — vozidlo ešte nie je predané. Zmluvy sa pripravia
   * z týchto údajov a predaj sa potvrdí až v poslednom kroku.
   */
  draftSale?: DraftSale
  /**
   * Beží pred uložením dokumentov. V predajnom toku tu prebehne samotný
   * predaj, takže zmluvy vzniknú len vtedy, keď sa predaj naozaj podaril.
   */
  onBeforeSave?: () => Promise<void>
  /** Text potvrdzovacieho tlačidla v poslednom kroku. */
  finishLabel?: string
  /** Používateľ sa rozhodol nevygenerovať žiadnu zmluvu. */
  onSkip?: () => void
  skipLabel?: string
  /** Zavolá sa po otvorení tlače. */
  onDone?: () => void
}

export default function DocumentWizard({
  vehicleId, party, draftSale, onBeforeSave, finishLabel, onSkip, skipLabel, onDone,
}: Props) {
  const [step, setStep] = useState<Step>('select')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [templates, setTemplates] = useState<ApplicableTemplate[]>([])
  const [customerId, setCustomerId] = useState<string | null>(draftSale?.customerId ?? null)
  const [selected, setSelected] = useState<string[]>([])
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [documents, setDocuments] = useState<PreparedDocument[]>([])
  const [activeDoc, setActiveDoc] = useState(0)

  // ── Načítanie použiteľných šablón ────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/documents/templates?active=1')
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Šablóny sa nepodarilo načítať')
        if (cancelled) return

        setTemplates(json.data ?? [])
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Načítanie zlyhalo')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  // Polia zo všetkých vybraných šablón, bez duplicít podľa kľúča
  const mergedFields = useMemo(() => {
    const seen = new Map<string, CustomField>()
    for (const t of templates) {
      if (!selected.includes(t.id)) continue
      for (const f of t.customFields) {
        if (f.key && !seen.has(f.key)) seen.set(f.key, f)
      }
    }
    return [...seen.values()]
  }, [templates, selected])

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const checkboxFields = useMemo(
    () => mergedFields.filter((f) => f.type === 'checkbox'),
    [mergedFields],
  )
  const otherFields = useMemo(
    () => mergedFields.filter((f) => f.type !== 'checkbox'),
    [mergedFields],
  )

  function setAllCheckboxes(value: 'Áno' | 'Nie') {
    setFieldValues((v) => {
      const next = { ...v }
      for (const f of checkboxFields) next[f.key] = value
      return next
    })
  }

  function fieldValue(f: CustomField): string {
    return fieldValues[f.key] ?? f.defaultValue ?? (f.type === 'checkbox' ? 'Nie' : '')
  }

  // ── Príprava dokumentov ──────────────────────────────────────────────────
  const prepare = useCallback(async () => {
    setBusy(true)
    setError(null)
    try {
      const values: Record<string, string> = {}
      for (const f of mergedFields) values[f.key] = fieldValue(f)

      const res = await fetch('/api/documents/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId,
          party,
          templateIds: selected,
          fieldValues: values,
          ...(draftSale ? { draftSale } : {}),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Dokumenty sa nepodarilo pripraviť')

      setDocuments(json.data.documents)
      setCustomerId(json.data.customerId)
      setActiveDoc(0)
      setStep('edit')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Príprava zlyhala')
    } finally {
      setBusy(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergedFields, fieldValues, selected, vehicleId, party, draftSale])

  // ── Uloženie a tlač ──────────────────────────────────────────────────────
  async function finish() {
    setBusy(true)
    setError(null)
    try {
      const values: Record<string, string> = {}
      for (const f of mergedFields) values[f.key] = fieldValue(f)

      // V predajnom toku tu prebehne samotný predaj. Ak zlyhá, dokumenty
      // sa neuložia a používateľ to vidí ako chybu.
      await onBeforeSave?.()

      const res = await fetch('/api/documents/generated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId,
          customerId,
          fieldValues: values,
          documents: documents.map((d) => ({
            templateId: d.templateId,
            name: d.name,
            content: d.content,
          })),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Uloženie zlyhalo')

      window.open(`/admin/tlac/dokumenty?ids=${json.data.ids.join(',')}`, '_blank')
      onDone?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Uloženie zlyhalo')
    } finally {
      setBusy(false)
    }
  }

  // ── Stavy ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Načítavam šablóny…
      </div>
    )
  }

  if (error && templates.length === 0) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
        <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
        <p className="text-sm text-red-800">{error}</p>
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-10">
        <FileText className="h-9 w-9 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-600 font-medium">Žiadne aktívne šablóny</p>
        <p className="text-sm text-slate-500 mt-1">
          Nahrajte zmluvy v sekcii Šablóny zmlúv a znova to skúste.
        </p>
        {onSkip && (
          <Button variant="outline" onClick={onSkip} className="mt-5">
            {skipLabel ?? 'Pokračovať bez zmlúv'}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* ── Krok 1: výber dokumentov ── */}
      {step === 'select' && (
        <>
          <p className="text-sm text-slate-600">
            Označte zmluvy, ktoré sa majú vygenerovať. Údaje o vozidle a zákazníkovi
            sa doplnia automaticky.
          </p>

          <div className="space-y-2">
            {templates.map((t) => (
              <label
                key={t.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                  selected.includes(t.id)
                    ? 'border-orange-300 bg-orange-50/60'
                    : 'border-slate-200 hover:bg-slate-50',
                )}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(t.id)}
                  onChange={() => toggle(t.id)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-slate-900">{t.name}</span>
                  {t.description && (
                    <span className="block text-xs text-slate-500 mt-0.5">{t.description}</span>
                  )}
                </span>
              </label>
            ))}
          </div>

          <div className="flex justify-between gap-3">
            {onSkip ? (
              <Button variant="outline" onClick={onSkip} disabled={busy}>
                {skipLabel ?? 'Pokračovať bez zmlúv'}
              </Button>
            ) : <span />}
            <Button
              onClick={() => (mergedFields.length > 0 ? setStep('fields') : prepare())}
              disabled={selected.length === 0 || busy}
              className="gap-2"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Pripraviť zmluvy
            </Button>
          </div>
        </>
      )}

      {/* ── Krok 2: doplnenie polí ── */}
      {step === 'fields' && (
        <>
          <p className="text-sm text-slate-600">
            Doplňte údaje, ktoré systém nepozná. Použijú sa vo všetkých vybraných dokumentoch.
          </p>

          {checkboxFields.length > 0 && (
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200">
                <span className="text-xs font-medium text-slate-600">
                  Odovzdané / prevzaté ({checkboxFields.filter((f) => fieldValue(f) === 'Áno').length} z {checkboxFields.length})
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setAllCheckboxes('Áno')}
                    className="text-xs px-2 py-1 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                  >
                    Všetko áno
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllCheckboxes('Nie')}
                    className="text-xs px-2 py-1 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                  >
                    Všetko nie
                  </button>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {checkboxFields.map((f) => {
                  const yes = fieldValue(f) === 'Áno'
                  return (
                    <div key={f.key} className="flex items-center gap-3 px-3 py-1.5">
                      <span className="text-sm text-slate-700 flex-1 min-w-0">{f.label || f.key}</span>
                      <div className="flex rounded-md border border-slate-200 overflow-hidden shrink-0">
                        <button
                          type="button"
                          onClick={() => setFieldValues((v) => ({ ...v, [f.key]: 'Áno' }))}
                          className={cn(
                            'px-3 py-1 text-xs font-medium transition-colors',
                            yes ? 'bg-green-600 text-white' : 'text-slate-500 hover:bg-slate-100',
                          )}
                        >
                          Áno
                        </button>
                        <button
                          type="button"
                          onClick={() => setFieldValues((v) => ({ ...v, [f.key]: 'Nie' }))}
                          className={cn(
                            'px-3 py-1 text-xs font-medium border-l border-slate-200 transition-colors',
                            !yes ? 'bg-slate-600 text-white' : 'text-slate-500 hover:bg-slate-100',
                          )}
                        >
                          Nie
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {otherFields.map((f) => (
              <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                <Label htmlFor={`f-${f.key}`}>{f.label || f.key}</Label>
                {f.type === 'textarea' ? (
                  <Textarea
                    id={`f-${f.key}`}
                    rows={3}
                    value={fieldValue(f)}
                    onChange={(e) => setFieldValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    className="mt-1.5"
                  />
                ) : (
                  <>
                    <Input
                      id={`f-${f.key}`}
                      type={f.type === 'number' || f.type === 'amount' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                      inputMode={f.type === 'amount' ? 'decimal' : undefined}
                      step={f.type === 'amount' ? '0.01' : undefined}
                      value={fieldValue(f)}
                      onChange={(e) => setFieldValues((v) => ({ ...v, [f.key]: e.target.value }))}
                      className="mt-1.5"
                    />
                    {f.type === 'amount' && (() => {
                      const n = Number(fieldValue(f).replace(',', '.'))
                      if (!fieldValue(f) || !Number.isFinite(n)) return null
                      return (
                        <p className="mt-1 text-[11px] text-slate-500">
                          {formatAmount(n)} € — slovom{' '}
                          <span className="text-slate-700">{amountToSlovakWords(n)}</span>
                        </p>
                      )
                    })()}
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('select')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Späť
            </Button>
            <Button onClick={prepare} disabled={busy} className="gap-2">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Pripraviť dokumenty
            </Button>
          </div>
        </>
      )}

      {/* ── Krok 3: úprava pred tlačou ── */}
      {step === 'edit' && documents.length > 0 && (
        <>
          <p className="text-sm text-slate-600">
            Text je doplnený o údaje. Skontrolujte ho a čokoľvek v ňom ešte upravte —
            až potom potvrďte.
          </p>

          {documents.length > 1 && (
            <div className="flex flex-wrap gap-1 border-b border-slate-200">
              {documents.map((d, i) => (
                <button
                  key={d.templateId}
                  onClick={() => setActiveDoc(i)}
                  className={cn(
                    'px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                    i === activeDoc
                      ? 'border-orange-500 text-orange-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800',
                  )}
                >
                  {d.name}
                </button>
              ))}
            </div>
          )}

          <ContractEditor
            key={documents[activeDoc].templateId}
            value={documents[activeDoc].content}
            onChange={(html) =>
              setDocuments((prev) =>
                prev.map((d, i) => (i === activeDoc ? { ...d, content: html } : d)),
              )
            }
            showVariables={false}
            minHeight={420}
          />

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(mergedFields.length > 0 ? 'fields' : 'select')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Späť
            </Button>
            <Button onClick={finish} disabled={busy} className="gap-2">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
              {finishLabel ?? 'Uložiť a otvoriť tlač'}
            </Button>
          </div>
        </>
      )}

      {/* ── Indikátor krokov ── */}
      <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400">
        {(['select', 'fields', 'edit'] as const)
          .filter((s) => s !== 'fields' || mergedFields.length > 0)
          .map((s, i, arr) => (
            <React.Fragment key={s}>
              <span className={cn('flex items-center gap-1', step === s && 'text-orange-600 font-medium')}>
                {(['select', 'fields', 'edit'] as const).indexOf(step) >
                  (['select', 'fields', 'edit'] as const).indexOf(s) && (
                  <Check className="h-3 w-3" />
                )}
                {s === 'select' ? 'Výber' : s === 'fields' ? 'Doplnenie' : 'Úprava a tlač'}
              </span>
              {i < arr.length - 1 && <span>›</span>}
            </React.Fragment>
          ))}
      </div>
    </div>
  )
}
