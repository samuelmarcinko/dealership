'use client'

import { GitCompareArrows } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCompare, type CompareVehicle } from '@/contexts/CompareContext'

interface Props {
  vehicle: CompareVehicle
  variant?: 'card' | 'detail' | 'top'
}

export default function CompareButton({ vehicle, variant = 'card' }: Props) {
  const { toggle, has, isFull } = useCompare()
  const selected = has(vehicle.id)
  const disabled = !selected && isFull

  if (variant === 'top') {
    return (
      <button
        type="button"
        onClick={() => toggle(vehicle)}
        disabled={disabled}
        title={selected ? 'Odstrániť z porovnania' : disabled ? 'Porovnanie plné (max 3)' : 'Pridať do porovnania'}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-150',
          selected
            ? 'bg-orange-600 border-orange-600 text-white shadow-sm hover:bg-orange-700 hover:border-orange-700'
            : disabled
            ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
            : 'bg-primary border-primary text-white shadow-sm hover:opacity-90 hover:shadow-md'
        )}
      >
        <GitCompareArrows className="h-3.5 w-3.5 shrink-0" />
        <span>{selected ? 'Porovnávam' : 'Porovnať'}</span>
      </button>
    )
  }

  if (variant === 'detail') {
    return (
      <button
        type="button"
        onClick={() => toggle(vehicle)}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors',
          selected
            ? 'bg-orange-500 border-orange-500 text-white hover:bg-orange-600'
            : disabled
            ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
            : 'border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50'
        )}
      >
        <GitCompareArrows className="h-4 w-4" />
        {selected
          ? 'Odstrániť z porovnania'
          : disabled
          ? 'Porovnanie plné (max 3)'
          : 'Pridať do porovnania'}
      </button>
    )
  }

  // Card variant — compact button in price row
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(vehicle)
      }}
      disabled={disabled}
      title={
        selected
          ? 'Odstrániť z porovnania'
          : disabled
          ? 'Porovnanie plné (max 3)'
          : 'Pridať do porovnania'
      }
      className={cn(
        'shrink-0 flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors',
        selected
          ? 'bg-orange-500 border-orange-500 text-white'
          : disabled
          ? 'border-slate-100 text-slate-300 cursor-not-allowed'
          : 'border-slate-200 text-slate-500 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50'
      )}
    >
      <GitCompareArrows className="h-3 w-3" />
      <span className="hidden sm:inline">{selected ? 'Porovnávam' : 'Porovnať'}</span>
    </button>
  )
}
