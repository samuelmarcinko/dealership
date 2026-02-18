'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fuelTypeLabel, transmissionLabel } from '@/lib/utils'
import { SlidersHorizontal, X } from 'lucide-react'

interface Props {
  makes: string[]
  currentParams: Record<string, string | undefined>
}

const FUEL_TYPES = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'LPG', 'CNG']
const TRANSMISSIONS = ['MANUAL', 'AUTOMATIC', 'SEMI_AUTOMATIC']

export default function VehicleFilters({ makes, currentParams }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  function buildUrl(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams()
    const merged = { ...currentParams, ...updates }
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    return `${pathname}?${params.toString()}`
  }

  function updateFilter(key: string, value: string | undefined) {
    router.push(buildUrl({ [key]: value }))
  }

  function clearAll() {
    router.push(pathname)
  }

  const hasFilters = Object.values(currentParams).some(Boolean)

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-slate-900">
          <SlidersHorizontal className="h-4 w-4 text-orange-500" />
          Filtre
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Zrušiť
          </button>
        )}
      </div>

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

      {/* Price range */}
      <div className="space-y-2">
        <Label>Cena (€)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Od"
            defaultValue={currentParams.minPrice ?? ''}
            onBlur={(e) => updateFilter('minPrice', e.target.value || undefined)}
            className="text-sm"
          />
          <Input
            type="number"
            placeholder="Do"
            defaultValue={currentParams.maxPrice ?? ''}
            onBlur={(e) => updateFilter('maxPrice', e.target.value || undefined)}
            className="text-sm"
          />
        </div>
      </div>

      {/* Year range */}
      <div className="space-y-2">
        <Label>Rok výroby</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Od"
            defaultValue={currentParams.minYear ?? ''}
            onBlur={(e) => updateFilter('minYear', e.target.value || undefined)}
            className="text-sm"
          />
          <Input
            type="number"
            placeholder="Do"
            defaultValue={currentParams.maxYear ?? ''}
            onBlur={(e) => updateFilter('maxYear', e.target.value || undefined)}
            className="text-sm"
          />
        </div>
      </div>

      {hasFilters && (
        <Button variant="outline" className="w-full" onClick={clearAll}>
          Zrušiť všetky filtre
        </Button>
      )}
    </div>
  )
}
