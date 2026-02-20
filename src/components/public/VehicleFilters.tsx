'use client'

import React, { useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fuelTypeLabel, transmissionLabel, formatPrice } from '@/lib/utils'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'

interface Props {
  makes: string[]
  currentParams: Record<string, string | undefined>
}

const FUEL_TYPES = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'LPG', 'CNG']
const TRANSMISSIONS = ['MANUAL', 'AUTOMATIC', 'SEMI_AUTOMATIC']
const PRICE_MIN = 0
const PRICE_MAX = 200000
const PRICE_STEP = 500
const YEAR_MIN = 1990
const YEAR_MAX = new Date().getFullYear()

// ── Dual range slider component ──────────────────────────────────────────────
interface DualRangeProps {
  min: number
  max: number
  step: number
  valueMin: number
  valueMax: number
  onChangeMin: (v: number) => void
  onChangeMax: (v: number) => void
  onCommit: () => void
  formatFn: (v: number) => string
  labelMin?: string
  labelMax?: string
}

function DualRange({
  min, max, step,
  valueMin, valueMax,
  onChangeMin, onChangeMax, onCommit,
  formatFn,
}: DualRangeProps) {
  const minPct = ((valueMin - min) / (max - min)) * 100
  const maxPct = ((valueMax - min) / (max - min)) * 100

  return (
    <div className="space-y-2">
      {/* Value labels */}
      <div className="flex justify-between text-xs font-medium text-slate-700">
        <span>{valueMin <= min ? 'Akékoľvek' : formatFn(valueMin)}</span>
        <span>{valueMax >= max ? 'Max' : formatFn(valueMax)}</span>
      </div>

      {/* Slider track */}
      <div className="relative h-5 flex items-center">
        {/* Background track */}
        <div className="absolute w-full h-1.5 rounded-full bg-slate-200 pointer-events-none" />
        {/* Active range fill */}
        <div
          className="absolute h-1.5 rounded-full bg-primary pointer-events-none"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
        {/* Visual thumb min */}
        <div
          className="absolute w-4 h-4 rounded-full bg-white border-2 border-primary shadow pointer-events-none -translate-x-1/2"
          style={{ left: `${minPct}%` }}
        />
        {/* Visual thumb max */}
        <div
          className="absolute w-4 h-4 rounded-full bg-white border-2 border-primary shadow pointer-events-none -translate-x-1/2"
          style={{ left: `${maxPct}%` }}
        />

        {/* Min range input (transparent, interactive) */}
        <input
          type="range"
          min={min} max={max} step={step}
          value={valueMin}
          onChange={(e) => onChangeMin(Math.min(+e.target.value, valueMax - step))}
          onMouseUp={onCommit}
          onTouchEnd={onCommit}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: valueMin > max - (max - min) * 0.1 ? 5 : 3 }}
        />
        {/* Max range input (transparent, interactive) */}
        <input
          type="range"
          min={min} max={max} step={step}
          value={valueMax}
          onChange={(e) => onChangeMax(Math.max(+e.target.value, valueMin + step))}
          onMouseUp={onCommit}
          onTouchEnd={onCommit}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: 4 }}
        />
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function VehicleFilters({ makes, currentParams }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Slider local state (updates live while dragging, commits to URL on release)
  const [priceMin, setPriceMin] = useState(parseInt(currentParams.minPrice ?? String(PRICE_MIN)))
  const [priceMax, setPriceMax] = useState(parseInt(currentParams.maxPrice ?? String(PRICE_MAX)))
  const [yearMin, setYearMin] = useState(parseInt(currentParams.minYear ?? String(YEAR_MIN)))
  const [yearMax, setYearMax] = useState(parseInt(currentParams.maxYear ?? String(YEAR_MAX)))

  function buildUrl(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams()
    const merged = { ...currentParams, ...updates }
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  function updateFilter(key: string, value: string | undefined) {
    router.push(buildUrl({ [key]: value }))
  }

  const commitPriceRange = useCallback(() => {
    router.push(buildUrl({
      minPrice: priceMin > PRICE_MIN ? String(priceMin) : undefined,
      maxPrice: priceMax < PRICE_MAX ? String(priceMax) : undefined,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceMin, priceMax])

  const commitYearRange = useCallback(() => {
    router.push(buildUrl({
      minYear: yearMin > YEAR_MIN ? String(yearMin) : undefined,
      maxYear: yearMax < YEAR_MAX ? String(yearMax) : undefined,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearMin, yearMax])

  function clearAll() {
    setPriceMin(PRICE_MIN)
    setPriceMax(PRICE_MAX)
    setYearMin(YEAR_MIN)
    setYearMax(YEAR_MAX)
    router.push(pathname)
  }

  const hasFilters = Object.values(currentParams).some(Boolean)
  const activeFilterCount = Object.values(currentParams).filter(Boolean).length

  const filterContent = (
    <div className="space-y-6">
      {/* Make */}
      <div className="space-y-2">
        <Label>Značka</Label>
        <Select
          value={currentParams.make ?? ''}
          onValueChange={(v) => updateFilter('make', v === 'all' ? undefined : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Všetky značky" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všetky značky</SelectItem>
            {makes.map((make) => (
              <SelectItem key={make} value={make}>{make}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Fuel */}
      <div className="space-y-2">
        <Label>Palivo</Label>
        <Select
          value={currentParams.fuelType ?? ''}
          onValueChange={(v) => updateFilter('fuelType', v === 'all' ? undefined : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Všetky palivá" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všetky palivá</SelectItem>
            {FUEL_TYPES.map((f) => (
              <SelectItem key={f} value={f}>{fuelTypeLabel(f)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Transmission */}
      <div className="space-y-2">
        <Label>Prevodovka</Label>
        <Select
          value={currentParams.transmission ?? ''}
          onValueChange={(v) => updateFilter('transmission', v === 'all' ? undefined : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Všetky" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všetky</SelectItem>
            {TRANSMISSIONS.map((t) => (
              <SelectItem key={t} value={t}>{transmissionLabel(t)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price range slider */}
      <div className="space-y-2">
        <Label>Cena (€)</Label>
        <DualRange
          min={PRICE_MIN} max={PRICE_MAX} step={PRICE_STEP}
          valueMin={priceMin} valueMax={priceMax}
          onChangeMin={setPriceMin}
          onChangeMax={setPriceMax}
          onCommit={commitPriceRange}
          formatFn={(v) => formatPrice(v)}
        />
      </div>

      {/* Year range slider */}
      <div className="space-y-2">
        <Label>Rok výroby</Label>
        <DualRange
          min={YEAR_MIN} max={YEAR_MAX} step={1}
          valueMin={yearMin} valueMax={yearMax}
          onChangeMin={setYearMin}
          onChangeMax={setYearMax}
          onCommit={commitYearRange}
          formatFn={(v) => String(v)}
        />
      </div>

      {hasFilters && (
        <Button variant="outline" className="w-full" onClick={clearAll}>
          Zrušiť všetky filtre
        </Button>
      )}
    </div>
  )

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-2 font-semibold text-slate-900">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Filtre
          {hasFilters && (
            <span className="inline-flex items-center justify-center w-5 h-5 bg-primary text-white text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button
              onClick={clearAll}
              className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Zrušiť
            </button>
          )}
          <button
            className="lg:hidden p-1 text-slate-400 hover:text-slate-600"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Zobraziť filtre"
          >
            <ChevronDown
              className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Filter content — collapsible on mobile, always open on lg */}
      <div className={`px-5 pb-5 ${isOpen ? 'block' : 'hidden'} lg:block`}>
        {filterContent}
      </div>
    </div>
  )
}
