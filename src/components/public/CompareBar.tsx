'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, GitCompareArrows, Car } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCompare } from '@/contexts/CompareContext'

export default function CompareBar() {
  const { vehicles, remove, clear, count } = useCompare()

  if (count === 0) return null

  const compareUrl = `/compare?ids=${vehicles.map(v => v.id).join(',')}`
  const canCompare = count >= 2

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_24px_rgba(0,0,0,0.1)]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">

          {/* Label */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <GitCompareArrows className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-semibold text-slate-700">
              Porovnanie <span className="text-orange-500">{count}/3</span>
            </span>
          </div>

          {/* Vehicle slots */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto min-w-0">
            {[0, 1, 2].map((i) => {
              const v = vehicles[i]
              if (!v) {
                return (
                  <div key={i} className="hidden sm:flex items-center border-2 border-dashed border-slate-200 rounded-lg px-3 py-2 shrink-0">
                    <span className="text-xs text-slate-300 whitespace-nowrap">+ Pridajte vozidlo</span>
                  </div>
                )
              }
              return (
                <div key={v.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg pl-2.5 pr-2 py-1.5 shrink-0 max-w-[220px]">
                  <div className="w-9 h-6 rounded overflow-hidden bg-slate-200 shrink-0">
                    {v.imageUrl ? (
                      <Image src={v.imageUrl} alt={v.title} width={36} height={24} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="h-3 w-3 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-700 truncate">{v.title}</span>
                  <button
                    onClick={() => remove(v.id)}
                    className="shrink-0 text-slate-400 hover:text-red-500 transition-colors ml-0.5"
                    aria-label="Odstrániť"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={clear}
              className="hidden sm:block text-xs text-slate-400 hover:text-slate-600 transition-colors whitespace-nowrap"
            >
              Zmazať
            </button>
            <Link
              href={canCompare ? compareUrl : '#'}
              aria-disabled={!canCompare}
              className={cn(
                'flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap',
                canCompare
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-slate-100 text-slate-400 pointer-events-none'
              )}
            >
              <GitCompareArrows className="h-4 w-4" />
              <span className="hidden sm:inline">Porovnať</span>
              <span className="sm:hidden">{count}/3</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
