'use client'

import React, { useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { fuelTypeLabel, transmissionLabel, formatPrice } from '@/lib/utils'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'

interface Props {
  makes: string[]
  currentParams: Record<string, string | undefined>
  yearDbMin: number
  yearDbMax: number
}

const FUEL_OPTIONS = [
  { value: 'PETROL', label: 'Benzín' },
  { value: 'DIESEL', label: 'Nafta' },
  { value: 'ELECTRIC', label: 'Elektro' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'LPG', label: 'LPG' },
  { value: 'CNG', label: 'CNG' },
]

const TRANSMISSION_OPTIONS = [
  { value: 'MANUAL', label: 'Manuál' },
  { value: 'AUTOMATIC', label: 'Automat' },
  { value: 'SEMI_AUTOMATIC', label: 'Semi-automat' },
]

const PRICE_MIN = 0
const PRICE_MAX = 200000
const PRICE_STEP = 500

// ── Multiselect inline checkboxes ────────────────────────────────────────────
interface MultiSelectFilterProps {
  label: string
  options: { value: string; label: string }[]
  selected: string[]
  onToggle: (value: string) => void
  onClear: () => void
}

function MultiSelectFilter({ label, options, selected, onToggle, onClear }: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false)

  const displayLabel =
    selected.length === 0
      ? 'Všetky'
      : selected.length === 1
      ? options.find((o) => o.value === selected[0])?.label ?? selected[0]
      : `${selected.length} vybraté`

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {selected.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            Zrušiť
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-9 px-3 text-left text-sm border border-slate-300 rounded-md bg-white flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <span className={selected.length === 0 ? 'text-slate-400' : 'text-slate-900 font-medium'}>
          {displayLabel}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 select-none"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => onToggle(opt.value)}
                className="h-4 w-4 rounded border-slate-300 cursor-pointer"
                style={{ accentColor: 'var(--primary, #f97316)' }}
              />
              <span className="text-sm text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Dual range slider ─────────────────────────────────────────────────────────
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
}

function DualRange({ min, max, step, valueMin, valueMax, onChangeMin, onChangeMax, onCommit, formatFn }: DualRangeProps) {
  const minPct = ((valueMin - min) / (max - min)) * 100
  const maxPct = ((valueMax - min) / (max - min)) * 100

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-medium text-slate-700">
        <span>{formatFn(valueMin)}</span>
        <span>{formatFn(valueMax)}</span>
      </div>
      <div className="relative h-5 flex items-center">
        <div className="absolute w-full h-1.5 rounded-full bg-slate-200 pointer-events-none" />
        <div
          className="absolute h-1.5 rounded-full bg-primary pointer-events-none"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
        <div
          className="absolute w-4 h-4 rounded-full bg-white border-2 border-primary shadow pointer-events-none -translate-x-1/2"
          style={{ left: `${minPct}%` }}
        />
        <div
          className="absolute w-4 h-4 rounded-full bg-white border-2 border-primary shadow pointer-events-none -translate-x-1/2"
          style={{ left: `${maxPct}%` }}
        />
        <input
          type="range" min={min} max={max} step={step}
          value={valueMin}
          onChange={(e) => onChangeMin(Math.min(+e.target.value, valueMax - step))}
          onMouseUp={onCommit}
          onTouchEnd={onCommit}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto"
          style={{ zIndex: 3 }}
        />
        <input
          type="range" min={min} max={max} step={step}
          value={valueMax}
          onChange={(e) => onChangeMax(Math.max(+e.target.value, valueMin + step))}
          onMouseUp={onCommit}
          onTouchEnd={onCommit}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto"
          style={{ zIndex: 3 }}
        />
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function VehicleFilters({ makes, currentParams, yearDbMin, yearDbMax }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Slider local state (smooth while dragging, commit on release)
  const [priceMin, setPriceMin] = useState(parseInt(currentParams.minPrice ?? String(PRICE_MIN)))
  const [priceMax, setPriceMax] = useState(parseInt(currentParams.maxPrice ?? String(PRICE_MAX)))
  const [yearMin, setYearMin] = useState(parseInt(currentParams.minYear ?? String(yearDbMin)))
  const [yearMax, setYearMax] = useState(parseInt(currentParams.maxYear ?? String(yearDbMax)))

  // Multiselect selections (derived from URL params)
  const selectedMakes = currentParams.make ? currentParams.make.split(',').filter(Boolean) : []
  const selectedFuels = currentParams.fuelType ? currentParams.fuelType.split(',').filter(Boolean) : []
  const selectedTransmissions = currentParams.transmission ? currentParams.transmission.split(',').filter(Boolean) : []

  function buildUrl(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams()
    const merged = { ...currentParams, ...updates }
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v) })
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  // scroll: false — keeps scroll position when filtering
  function updateFilter(key: string, value: string | undefined) {
    router.push(buildUrl({ [key]: value }), { scroll: false })
  }

  function toggleMulti(key: string, current: string[], value: string) {
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    updateFilter(key, next.length > 0 ? next.join(',') : undefined)
  }

  const commitPriceRange = useCallback(() => {
    router.push(buildUrl({
      minPrice: priceMin > PRICE_MIN ? String(priceMin) : undefined,
      maxPrice: priceMax < PRICE_MAX ? String(priceMax) : undefined,
    }), { scroll: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceMin, priceMax])

  const commitYearRange = useCallback(() => {
    router.push(buildUrl({
      minYear: yearMin > yearDbMin ? String(yearMin) : undefined,
      maxYear: yearMax < yearDbMax ? String(yearMax) : undefined,
    }), { scroll: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearMin, yearMax, yearDbMin, yearDbMax])

  function clearAll() {
    setPriceMin(PRICE_MIN)
    setPriceMax(PRICE_MAX)
    setYearMin(yearDbMin)
    setYearMax(yearDbMax)
    router.push(pathname, { scroll: false })
  }

  const hasFilters = Object.values(currentParams).some(Boolean)
  const activeFilterCount = Object.values(currentParams).filter(Boolean).length

  const makeOptions = makes.map((m) => ({ value: m, label: m }))

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header — entire div clickable on mobile */}
      <div
        className="flex items-center justify-between p-5 cursor-pointer lg:cursor-default"
        onClick={() => setIsOpen((v) => !v)}
      >
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
              onClick={(e) => { e.stopPropagation(); clearAll() }}
              className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <X className="h-3 w-3" />
              Zrušiť
            </button>
          )}
          <ChevronDown
            className={`h-5 w-5 text-slate-400 transition-transform duration-200 lg:hidden ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Filter content — collapsible on mobile, always open on lg */}
      <div className={`px-5 pb-5 space-y-6 ${isOpen ? 'block' : 'hidden'} lg:block`}>

        {/* Značka */}
        <MultiSelectFilter
          label="Značka"
          options={makeOptions}
          selected={selectedMakes}
          onToggle={(v) => toggleMulti('make', selectedMakes, v)}
          onClear={() => updateFilter('make', undefined)}
        />

        {/* Palivo */}
        <MultiSelectFilter
          label="Palivo"
          options={FUEL_OPTIONS}
          selected={selectedFuels}
          onToggle={(v) => toggleMulti('fuelType', selectedFuels, v)}
          onClear={() => updateFilter('fuelType', undefined)}
        />

        {/* Prevodovka */}
        <MultiSelectFilter
          label="Prevodovka"
          options={TRANSMISSION_OPTIONS}
          selected={selectedTransmissions}
          onToggle={(v) => toggleMulti('transmission', selectedTransmissions, v)}
          onClear={() => updateFilter('transmission', undefined)}
        />

        {/* Cena */}
        <div className="space-y-2">
          <Label>Cena (€)</Label>
          <DualRange
            min={PRICE_MIN} max={PRICE_MAX} step={PRICE_STEP}
            valueMin={priceMin} valueMax={priceMax}
            onChangeMin={setPriceMin}
            onChangeMax={setPriceMax}
            onCommit={commitPriceRange}
            formatFn={formatPrice}
          />
        </div>

        {/* Rok výroby */}
        <div className="space-y-2">
          <Label>Rok výroby</Label>
          <DualRange
            min={yearDbMin} max={yearDbMax} step={1}
            valueMin={yearMin} valueMax={yearMax}
            onChangeMin={setYearMin}
            onChangeMax={setYearMax}
            onCommit={commitYearRange}
            formatFn={String}
          />
        </div>

        {hasFilters && (
          <Button variant="outline" className="w-full" onClick={clearAll}>
            Zrušiť všetky filtre
          </Button>
        )}
      </div>
    </div>
  )
}
