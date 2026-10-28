'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import DocumentWizard from '@/components/admin/DocumentWizard'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import {
  X, Search, User, Building2, CheckCircle, Loader2, DollarSign,
  ArrowRight, Handshake, FileSignature,
} from 'lucide-react'
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
  salePrice?: number | null
  isConsignment?: boolean
  vehicleCommissionRate?: number | null
  onClose: () => void
}

export default function SellVehicleModal({ vehicleId, vehicleTitle, listedPrice, salePrice, isConsignment, vehicleCommissionRate, onClose }: Props) {
  const router = useRouter()
  const { toast } = useToast()

  // Step: 'sell' | 'documents'
  const [step, setStep] = useState<'sell' | 'documents'>('sell')
  const [sold, setSold] = useState(false)

  const advertisedPrice = salePrice ?? listedPrice

  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [soldPrice, setSoldPrice] = useState(advertisedPrice.toString())
  const [soldAt, setSoldAt] = useState(new Date().toISOString().split('T')[0])
  const [soldNote, setSoldNote] = useState('')
  const [commissionRate, setCommissionRate] = useState(
    vehicleCommissionRate != null ? String(vehicleCommissionRate) : ''
  )
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
    // Vozidlo sa ešte nepredáva. Najprv si používateľ pripraví a skontroluje
    // zmluvy; predaj sa potvrdí až v poslednom kroku.
    setStep('documents')
  }, [selectedId, soldPrice, toast])

  /** Potvrdenie predaja — beží až po kontrole zmlúv. */
  const commitSale = useCallback(async () => {
    const price = parseFloat(soldPrice)
    const rate = commissionRate ? parseFloat(commissionRate) : null

    const res = await fetch(`/api/vehicles/${vehicleId}/sell`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyerId: selectedId,
        soldPrice: price,
        soldAt: new Date(soldAt).toISOString(),
        soldNote: soldNote || undefined,
        ...(isConsignment && rate != null ? { commissionRate: rate } : {}),
      }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? 'Predaj sa nepodarilo dokončiť')

    setSold(true)
    toast('success', `Vozidlo predané — ${selected ? customerDisplayName(selected) : ''}`)
  }, [soldPrice, commissionRate, vehicleId, selectedId, soldAt, soldNote, isConsignment, selected, toast])

  /** Predaj bez generovania zmlúv. */
  const sellWithoutDocuments = useCallback(async () => {
    setSubmitting(true)
    try {
      await commitSale()
      onClose()
      router.push('/admin/sold')
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Nastala chyba')
    } finally {
      setSubmitting(false)
    }
  }, [commitSale, onClose, router, toast])

  function handleFinish() {
    onClose()
    router.push('/admin/sold')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] flex flex-col ${step === 'documents' ? 'max-w-5xl' : 'max-w-lg'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {step === 'sell' ? 'Predaj vozidla' : sold ? 'Zmluvy k predaju' : 'Zmluvy a potvrdenie predaja'}
            </h2>
            <p className="text-sm text-slate-500 truncate max-w-sm">{vehicleTitle}</p>
          </div>
          {step === 'documents' && (
            <button
              onClick={handleFinish}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* ── STEP 1: Sell ── */}
        {step === 'sell' && (
          <>
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

              {/* Commission rate (consignment only) */}
              {isConsignment && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-purple-800">
                    <Handshake className="h-4 w-4" />
                    Komisionárska odmena
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="commissionRate" className="text-xs text-purple-700">Sadzba provízie (%)</Label>
                      <input
                        id="commissionRate"
                        type="number"
                        min={0}
                        max={100}
                        step="0.01"
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(e.target.value)}
                        placeholder="0"
                        className="h-9 w-28 rounded-md border border-purple-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                    {commissionRate && !isNaN(parseFloat(commissionRate)) && !isNaN(parseFloat(soldPrice.replace(',', '.'))) && (
                      <div className="text-sm">
                        <p className="text-xs text-purple-600">Odmena bazáru</p>
                        <p className="font-semibold text-purple-900">
                          {new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' }).format(
                            (parseFloat(soldPrice.replace(',', '.')) * parseFloat(commissionRate)) / 100
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sale details */}
              <div className="space-y-4 border-t pt-4">
                {/* Advertised price (read-only) */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-900">
                    Inzerovaná cena (€)
                    {salePrice != null && (
                      <span className="ml-2 text-xs font-normal text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">zľavnená</span>
                    )}
                  </Label>
                  <div className="h-10 px-3 flex items-center bg-slate-50 border border-slate-200 rounded-md text-sm font-medium text-slate-700 select-none">
                    {new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' }).format(advertisedPrice)}
                  </div>
                </div>

                {/* Sold price */}
                <div className="space-y-2">
                  <Label htmlFor="soldPrice" className="text-sm font-medium text-slate-900">
                    <DollarSign className="inline h-3.5 w-3.5 mr-1" />
                    Predajná cena (€)
                  </Label>
                  {/* Discount quick-buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {[5, 10, 15, 20].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setSoldPrice(Math.round(advertisedPrice * (1 - pct / 100)).toString())}
                        className="px-3 py-1 text-xs font-medium rounded-full border border-slate-200 bg-white hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                      >
                        -{pct}%
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSoldPrice(advertisedPrice.toString())}
                      className="px-3 py-1 text-xs font-medium rounded-full border border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50 transition-colors text-slate-500"
                    >
                      Reset
                    </button>
                  </div>
                  <Input
                    id="soldPrice"
                    value={soldPrice}
                    onChange={(e) => setSoldPrice(e.target.value)}
                    placeholder="15000"
                  />
                  {/* Discount info */}
                  {(() => {
                    const sold = parseFloat(soldPrice.replace(',', '.'))
                    const diff = advertisedPrice - sold
                    const pct = advertisedPrice > 0 ? (diff / advertisedPrice) * 100 : 0
                    if (!isNaN(sold) && diff > 0.01) {
                      return (
                        <p className="text-sm text-emerald-700 font-medium">
                          Zľava: -{new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' }).format(diff)} ({pct.toFixed(1)}%)
                        </p>
                      )
                    }
                    if (!isNaN(sold) && diff < -0.01) {
                      return (
                        <p className="text-sm text-amber-600 font-medium">
                          Príplatok: +{new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' }).format(-diff)}
                        </p>
                      )
                    }
                    return null
                  })()}
                </div>

                {/* Date */}
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

            <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-3">
              <Button
                onClick={handleSubmit}
                disabled={!selectedId || submitting}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                {submitting
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Spracovávam…</>
                  : <><ArrowRight className="h-4 w-4 mr-2" />Pokračovať na zmluvy</>
                }
              </Button>
              <Button variant="outline" onClick={onClose} disabled={submitting}>
                Zrušiť
              </Button>
            </div>
          </>
        )}

        {/* ── STEP 2: Documents ── */}
        {step === 'documents' && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {sold ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900 text-sm">Vozidlo úspešne predané</p>
                    <p className="text-green-700 text-xs mt-0.5">
                      Kupujúci: {selected ? customerDisplayName(selected) : '—'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <FileSignature className="h-5 w-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-900 text-sm">Predaj zatiaľ nie je potvrdený</p>
                    <p className="text-amber-700 text-xs mt-0.5">
                      Pripravte a skontrolujte zmluvy — predaj sa dokončí až posledným krokom.
                    </p>
                  </div>
                </div>
              )}

              <DocumentWizard
                vehicleId={vehicleId}
                party="buyer"
                draftSale={{
                  customerId: selectedId!,
                  soldPrice: parseFloat(soldPrice),
                  soldAt: new Date(soldAt).toISOString(),
                  soldNote: soldNote || undefined,
                  commissionRate: isConsignment && commissionRate ? parseFloat(commissionRate) : null,
                }}
                onBeforeSave={commitSale}
                finishLabel="Potvrdiť predaj a otvoriť tlač"
                onSkip={sellWithoutDocuments}
                skipLabel="Predať bez zmlúv"
              />
            </div>

            {sold && (
              <div className="px-6 py-4 border-t border-slate-100">
                <Button onClick={handleFinish} variant="outline" className="w-full gap-2">
                  Hotovo — prejsť na predané vozidlá
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
