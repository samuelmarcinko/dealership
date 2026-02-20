'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { X, Search, User, Building2, CheckCircle, Loader2, DollarSign } from 'lucide-react'
import { customerDisplayName, customerShortInfo } from '@/lib/customer'

interface Customer {
  id: string
  type: string
  firstName?: string | null
  lastName?: string | null
  companyName?: string | null
  ico?: string | null
  phone?: string | null
  email?: string | null
}

interface Props {
  vehicleId: string
  vehicleTitle: string
  listedPrice: number
  onClose: () => void
}

export default function SellVehicleModal({ vehicleId, vehicleTitle, listedPrice, onClose }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [soldPrice, setSoldPrice] = useState(listedPrice.toString())
  const [soldAt, setSoldAt] = useState(new Date().toISOString().split('T')[0])
  const [soldNote, setSoldNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/customers')
      .then((r) => r.json())
      .then((j) => setCustomers(j.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingCustomers(false))
  }, [])

  const filtered = customers.filter((c) => {
    const name = customerDisplayName(c).toLowerCase()
    const q = search.toLowerCase()
    return (
      name.includes(q) ||
      (c.email ?? '').toLowerCase().includes(q) ||
      (c.phone ?? '').includes(q) ||
      (c.ico ?? '').includes(q)
    )
  })

  const selected = customers.find((c) => c.id === selectedId)

  const handleSubmit = useCallback(async () => {
    if (!selectedId) return
    const price = parseFloat(soldPrice.replace(',', '.'))
    if (isNaN(price) || price <= 0) {
      toast('error', 'Zadajte platnú predajnú cenu')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/sell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: selectedId,
          soldPrice: price,
          soldAt: new Date(soldAt).toISOString(),
          soldNote: soldNote || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast('error', json.error ?? 'Nastala chyba')
        return
      }
      toast('success', `Vozidlo bolo predané — ${customerDisplayName(selected!)}`)
      onClose()
      router.push('/admin/sold')
      router.refresh()
    } catch {
      toast('error', 'Nastala chyba')
    } finally {
      setSubmitting(false)
    }
  }, [selectedId, soldPrice, soldAt, soldNote, vehicleId, selected, onClose, router, toast])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Predaj vozidla</h2>
            <p className="text-sm text-slate-500 truncate max-w-sm">{vehicleTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Customer select */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-900">Kupujúci *</Label>

            {selected ? (
              <div className="flex items-center justify-between p-3 bg-orange-50 border-2 border-orange-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                    {selected.type === 'COMPANY'
                      ? <Building2 className="h-4 w-4 text-orange-600" />
                      : <User className="h-4 w-4 text-orange-600" />
                    }
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{customerDisplayName(selected)}</p>
                    <p className="text-xs text-slate-500">{customerShortInfo(selected)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="text-xs text-orange-600 hover:text-orange-800 font-medium"
                >
                  Zmeniť
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Hľadať zákazníka…"
                    className="pl-9"
                    autoFocus
                  />
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  {loadingCustomers ? (
                    <div className="flex items-center justify-center py-6 text-slate-400">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Načítavam…
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="py-6 text-center text-sm text-slate-400">
                      {customers.length === 0 ? (
                        <>Žiadni zákazníci. <a href="/admin/customers/new" className="text-orange-500 hover:underline">Vytvoriť zákazníka</a></>
                      ) : 'Žiadny výsledok'}
                    </div>
                  ) : (
                    filtered.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedId(c.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 text-left"
                      >
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                          {c.type === 'COMPANY'
                            ? <Building2 className="h-3.5 w-3.5 text-slate-500" />
                            : <User className="h-3.5 w-3.5 text-slate-500" />
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 text-sm truncate">{customerDisplayName(c)}</p>
                          <p className="text-xs text-slate-400 truncate">{c.phone ?? c.email ?? customerShortInfo(c)}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sale details */}
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="soldPrice">
                <DollarSign className="inline h-3.5 w-3.5 mr-1" />
                Predajná cena (€)
              </Label>
              <Input
                id="soldPrice"
                value={soldPrice}
                onChange={(e) => setSoldPrice(e.target.value)}
                placeholder="15000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="soldAt">Dátum predaja</Label>
              <Input
                id="soldAt"
                type="date"
                value={soldAt}
                onChange={(e) => setSoldAt(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="soldNote">Poznámka k predaju</Label>
            <Textarea
              id="soldNote"
              value={soldNote}
              onChange={(e) => setSoldNote(e.target.value)}
              placeholder="Platba v hotovosti, odovzdané kľúče…"
              rows={2}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-3">
          <Button
            onClick={handleSubmit}
            disabled={!selectedId || submitting}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
          >
            {submitting
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Spracovávam…</>
              : <><CheckCircle className="h-4 w-4 mr-2" />Potvrdiť predaj</>
            }
          </Button>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Zrušiť
          </Button>
        </div>
      </div>
    </div>
  )
}
