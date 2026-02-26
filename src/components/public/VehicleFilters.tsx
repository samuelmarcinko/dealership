'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
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

// ── Multiselect inline checkboxes ─────────────────────────────────────────────
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
          <button onClick={onClear} className="text-xs text-slate-400 hover:text-red-500 transition-colors">
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
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
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

// ── Custom dual range slider ───────────────────────────────────────────────────
// onCommit receives the final (min, max) values directly — no async state issues
interface DualRangeProps {
  min: number
  max: number
  step: number
  valueMin: number
  valueMax: number
  onChangeMin: (v: number) => void
  onChangeMax: (v: number) => void
  onCommit: (min: number, max: number) => void
  formatFn: (v: number) => string
}

// Thumb radius in px — visual size is 20px, touch target is 44px
const THUMB_R = 10

function DualRange({
  min, max, step,
  valueMin, valueMax,
  onChangeMin, onChangeMax, onCommit,
  formatFn,
}: DualRangeProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef<'min' | 'max' | null>(null)
  // Keeps the true latest values available inside event listeners
  const latestRef = useRef({ min: valueMin, max: valueMax })
  const cleanupRef = useRef<(() => void) | null>(null)
  const [active, setActive] = useState<'min' | 'max' | null>(null)

  latestRef.current = { min: valueMin, max: valueMax }

  // Cleanup drag listeners on unmount
  useEffect(() => () => { cleanupRef.current?.() }, [])

  function snapAndClamp(raw: number, lo: number, hi: number): number {
    const snapped = Math.round((raw - min) / step) * step + min
    return Math.max(lo, Math.min(hi, snapped))
  }

  function getValueFromX(clientX: number): number {
    const track = trackRef.current
    if (!track) return min
    const { left, width } = track.getBoundingClientRect()
    const usable = Math.max(1, width - THUMB_R * 2)
    const pct = Math.max(0, Math.min(1, (clientX - left - THUMB_R) / usable))
    return snapAndClamp(min + pct * (max - min), min, max)
  }

  // Clicking directly on the track (not on a thumb) moves the nearest thumb
  function handleTrackPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest('[data-thumb]')) return
    e.preventDefault()

    const val = getValueFromX(e.clientX)
    const { min: cMin, max: cMax } = latestRef.current

    if (Math.abs(val - cMin) <= Math.abs(val - cMax)) {
      const v = snapAndClamp(val, min, cMax - step)
      latestRef.current.min = v
      onChangeMin(v)
      onCommit(v, cMax)
    } else {
      const v = snapAndClamp(val, cMin + step, max)
      latestRef.current.max = v
      onChangeMax(v)
      onCommit(cMin, v)
    }
  }

  // Dragging a thumb — pointer capture via document listeners
  function startDrag(thumb: 'min' | 'max') {
    return (e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      draggingRef.current = thumb
      setActive(thumb)

      function onMove(me: PointerEvent) {
        const val = getValueFromX(me.clientX)
        if (draggingRef.current === 'min') {
          const v = snapAndClamp(val, min, latestRef.current.max - step)
          latestRef.current.min = v
          onChangeMin(v)
        } else if (draggingRef.current === 'max') {
          const v = snapAndClamp(val, latestRef.current.min + step, max)
          latestRef.current.max = v
          onChangeMax(v)
        }
      }

      function onUp() {
        onCommit(latestRef.current.min, latestRef.current.max)
        draggingRef.current = null
        setActive(null)
        cleanup()
        cleanupRef.current = null
      }

      function cleanup() {
        document.removeEventListener('pointermove', onMove)
        document.removeEventListener('pointerup', onUp)
        document.removeEventListener('pointercancel', onUp)
      }

      cleanupRef.current = cleanup
      document.addEventListener('pointermove', onMove)
      document.addEventListener('pointerup', onUp)
      document.addEventListener('pointercancel', onUp)
    }
  }

  // Keyboard accessibility
  function handleKeyDown(thumb: 'min' | 'max') {
    return (e: React.KeyboardEvent) => {
      const inc = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? step : 0
      const dec = e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? step : 0
      const delta = inc - dec
      if (!delta) return
      e.preventDefault()
      const { min: cMin, max: cMax } = latestRef.current
      if (thumb === 'min') {
        const v = snapAndClamp(cMin + delta, min, cMax - step)
        latestRef.current.min = v
        onChangeMin(v)
        onCommit(v, cMax)
      } else {
        const v = snapAndClamp(cMax + delta, cMin + step, max)
        latestRef.current.max = v
        onChangeMax(v)
        onCommit(cMin, v)
      }
    }
  }

  const minPct = ((valueMin - min) / (max - min)) * 100
  const maxPct = ((valueMax - min) / (max - min)) * 100

  // CSS left position so the thumb CENTER sits exactly on the track
  const thumbLeft = (pct: number): React.CSSProperties => ({
    left: `calc(${THUMB_R}px + (100% - ${THUMB_R * 2}px) * ${(pct / 100).toFixed(6)})`,
    transform: 'translateX(-50%)',
    zIndex: active === (pct === minPct ? 'min' : 'max') ? 4 : pct === maxPct ? 3 : 2,
  })

  return (
    <div className="space-y-2.5">
      {/* Value labels — update live while dragging */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-800 tabular-nums">
          {formatFn(valueMin)}
        </span>
        <span className="text-sm font-semibold text-slate-800 tabular-nums">
          {formatFn(valueMax)}
        </span>
      </div>

      {/* Track area — h-12 (48px) for comfortable touch target */}
      <div
        ref={trackRef}
        role="presentation"
        className="relative h-12 flex items-center cursor-pointer select-none touch-none"
        onPointerDown={handleTrackPointerDown}
      >
        {/* Background rail */}
        <div
          className="absolute rounded-full bg-slate-200"
          style={{ left: THUMB_R, right: THUMB_R, height: 4 }}
        />

        {/* Active fill between thumbs */}
        <div
          className="absolute rounded-full bg-primary transition-none"
          style={{
            left: `calc(${THUMB_R}px + (100% - ${THUMB_R * 2}px) * ${(minPct / 100).toFixed(6)})`,
            width: `calc((100% - ${THUMB_R * 2}px) * ${((maxPct - minPct) / 100).toFixed(6)})`,
            height: 4,
          }}
        />

        {/* Min thumb */}
        <div
          data-thumb="min"
          role="slider"
          aria-valuemin={min}
          aria-valuemax={valueMax - step}
          aria-valuenow={valueMin}
          aria-label="Minimum"
          tabIndex={0}
          onPointerDown={startDrag('min')}
          onKeyDown={handleKeyDown('min')}
          className="absolute flex items-center justify-center w-11 h-11 cursor-grab active:cursor-grabbing touch-none outline-none focus-visible:outline-none"
          style={{
            ...thumbLeft(minPct),
            zIndex: active === 'min' ? 4 : 2,
          }}
        >
          <div
            className={[
              'rounded-full bg-white border-[2.5px] border-primary transition-all duration-100',
              active === 'min'
                ? 'w-6 h-6 shadow-[0_0_0_5px_color-mix(in_srgb,var(--primary)_15%,transparent)]'
                : 'w-5 h-5 shadow-md',
            ].join(' ')}
          />
        </div>

        {/* Max thumb */}
        <div
          data-thumb="max"
          role="slider"
          aria-valuemin={valueMin + step}
          aria-valuemax={max}
          aria-valuenow={valueMax}
          aria-label="Maximum"
          tabIndex={0}
          onPointerDown={startDrag('max')}
          onKeyDown={handleKeyDown('max')}
          className="absolute flex items-center justify-center w-11 h-11 cursor-grab active:cursor-grabbing touch-none outline-none focus-visible:outline-none"
          style={{
            ...thumbLeft(maxPct),
            zIndex: active === 'max' ? 4 : 3,
          }}
        >
          <div
            className={[
              'rounded-full bg-white border-[2.5px] border-primary transition-all duration-100',
              active === 'max'
                ? 'w-6 h-6 shadow-[0_0_0_5px_color-mix(in_srgb,var(--primary)_15%,transparent)]'
                : 'w-5 h-5 shadow-md',
            ].join(' ')}
          />
        </div>
      </div>

      {/* Min/max bounds hint */}
      <div className="flex justify-between text-[11px] text-slate-400">
        <span>{formatFn(min)}</span>
        <span>{formatFn(max)}</span>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function VehicleFilters({ makes, currentParams, yearDbMin, yearDbMax }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const [priceMin, setPriceMin] = useState(parseInt(currentParams.minPrice ?? String(PRICE_MIN)))
  const [priceMax, setPriceMax] = useState(parseInt(currentParams.maxPrice ?? String(PRICE_MAX)))
  const [yearMin, setYearMin] = useState(parseInt(currentParams.minYear ?? String(yearDbMin)))
  const [yearMax, setYearMax] = useState(parseInt(currentParams.maxYear ?? String(yearDbMax)))

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

  function updateFilter(key: string, value: string | undefined) {
    router.push(buildUrl({ [key]: value }), { scroll: false })
  }

  function toggleMulti(key: string, current: string[], value: string) {
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    updateFilter(key, next.length > 0 ? next.join(',') : undefined)
  }

  // onCommit receives final values directly — avoids stale closure from useCallback
  function commitPriceRange(newMin: number, newMax: number) {
    router.push(buildUrl({
      minPrice: newMin > PRICE_MIN ? String(newMin) : undefined,
      maxPrice: newMax < PRICE_MAX ? String(newMax) : undefined,
    }), { scroll: false })
  }

  function commitYearRange(newMin: number, newMax: number) {
    router.push(buildUrl({
      minYear: newMin > yearDbMin ? String(newMin) : undefined,
      maxYear: newMax < yearDbMax ? String(newMax) : undefined,
    }), { scroll: false })
  }

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
      {/* Header */}
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

      {/* Filter content */}
      <div className={`px-5 pb-5 space-y-6 ${isOpen ? 'block' : 'hidden'} lg:block`}>

        <MultiSelectFilter
          label="Značka"
          options={makeOptions}
          selected={selectedMakes}
          onToggle={(v) => toggleMulti('make', selectedMakes, v)}
          onClear={() => updateFilter('make', undefined)}
        />

        <MultiSelectFilter
          label="Palivo"
          options={FUEL_OPTIONS}
          selected={selectedFuels}
          onToggle={(v) => toggleMulti('fuelType', selectedFuels, v)}
          onClear={() => updateFilter('fuelType', undefined)}
        />

        <MultiSelectFilter
          label="Prevodovka"
          options={TRANSMISSION_OPTIONS}
          selected={selectedTransmissions}
          onToggle={(v) => toggleMulti('transmission', selectedTransmissions, v)}
          onClear={() => updateFilter('transmission', undefined)}
        />

        {/* Cena */}
        <div className="space-y-1">
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
        <div className="space-y-1">
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
