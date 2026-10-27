'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import {
  FileText, Plus, Pencil, Trash2, Eye, EyeOff,
  ArrowUp, ArrowDown, HandCoins, PackageCheck, Files,
} from 'lucide-react'

export interface TemplateRow {
  id: string
  name: string
  description: string | null
  context: 'INTAKE' | 'SALE' | 'BOTH'
  customerType: 'PERSON' | 'COMPANY' | null
  isActive: boolean
  sortOrder: number
}

const CONTEXT_META = {
  INTAKE: { label: 'Pri prevzatí', icon: PackageCheck, className: 'bg-blue-100 text-blue-700' },
  SALE: { label: 'Pri predaji', icon: HandCoins, className: 'bg-green-100 text-green-700' },
  BOTH: { label: 'Vždy', icon: Files, className: 'bg-purple-100 text-purple-700' },
} as const

const CUSTOMER_TYPE_LABEL: Record<string, string> = {
  PERSON: 'Fyzická osoba',
  COMPANY: 'Firma / Živnostník',
}

export default function DocumentTemplatesManager({
  initialTemplates,
}: {
  initialTemplates: TemplateRow[]
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [templates, setTemplates] = useState(initialTemplates)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function patch(id: string, data: Partial<TemplateRow>) {
    setBusyId(id)
    try {
      const res = await fetch(`/api/documents/templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Uloženie zlyhalo')
      setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)))
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Uloženie zlyhalo')
    } finally {
      setBusyId(null)
    }
  }

  async function remove(t: TemplateRow) {
    if (!confirm(`Naozaj zmazať šablónu „${t.name}“?\n\nUž vygenerované dokumenty zostanú v archíve.`)) return
    setBusyId(t.id)
    try {
      const res = await fetch(`/api/documents/templates/${t.id}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error ?? 'Mazanie zlyhalo')
      setTemplates((prev) => prev.filter((x) => x.id !== t.id))
      toast('success', 'Šablóna zmazaná')
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Mazanie zlyhalo')
    } finally {
      setBusyId(null)
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= templates.length) return
    const reordered = [...templates]
    const [item] = reordered.splice(index, 1)
    reordered.splice(target, 0, item)
    setTemplates(reordered.map((t, i) => ({ ...t, sortOrder: i })))

    await Promise.all(
      reordered.map((t, i) =>
        fetch(`/api/documents/templates/${t.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sortOrder: i }),
        }),
      ),
    )
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Šablóny zmlúv</h1>
          <p className="text-sm text-slate-500 mt-1">
            Zmluvy a dokumenty, ktoré sa ponúknu pri prevzatí vozidla do komisie a pri predaji.
          </p>
        </div>
        <Link href="/admin/documents/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nová šablóna
          </Button>
        </Link>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">Zatiaľ nemáte žiadne šablóny</p>
            <p className="text-sm text-slate-500 mt-1 mb-5 max-w-md mx-auto">
              Vytvorte šablónu od nuly, alebo nahrajte existujúcu zmluvu z Wordu a upravte ju.
            </p>
            <Link href="/admin/documents/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Vytvoriť prvú šablónu
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Zoznam šablón</CardTitle>
            <CardDescription>
              Poradie určuje, v akom poradí sa dokumenty ponúkajú a tlačia.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100 p-0">
            {templates.map((t, index) => {
              const meta = CONTEXT_META[t.context]
              const Icon = meta.icon
              return (
                <div
                  key={t.id}
                  className={cn(
                    'flex items-center gap-4 px-6 py-4 transition-opacity',
                    busyId === t.id && 'opacity-50 pointer-events-none',
                    !t.isActive && 'bg-slate-50/60',
                  )}
                >
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-25"
                      title="Posunúť vyššie"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => move(index, 1)}
                      disabled={index === templates.length - 1}
                      className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-25"
                      title="Posunúť nižšie"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn('font-medium', t.isActive ? 'text-slate-900' : 'text-slate-500')}>
                        {t.name}
                      </span>
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium', meta.className)}>
                        <Icon className="h-3 w-3" />
                        {meta.label}
                      </span>
                      {t.customerType && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                          {CUSTOMER_TYPE_LABEL[t.customerType]}
                        </span>
                      )}
                      {!t.isActive && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200 text-slate-600">
                          Neaktívna
                        </span>
                      )}
                    </div>
                    {t.description && (
                      <p className="text-sm text-slate-500 mt-0.5 truncate">{t.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => patch(t.id, { isActive: !t.isActive })}
                      title={t.isActive ? 'Deaktivovať' : 'Aktivovať'}
                      className="p-2 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      {t.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <Link
                      href={`/admin/documents/${t.id}`}
                      className="p-2 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      title="Upraviť"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => remove(t)}
                      title="Zmazať"
                      className="p-2 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
