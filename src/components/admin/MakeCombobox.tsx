'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { ChevronDown } from 'lucide-react'

const ALL_MAKES = [
  'Abarth', 'Alfa Romeo', 'Alpina', 'Aston Martin', 'Audi',
  'Bentley', 'BMW', 'Bugatti', 'Buick',
  'Cadillac', 'Chevrolet', 'Chrysler', 'Citroën',
  'Dacia', 'Daewoo', 'Daihatsu', 'Dodge', 'DS',
  'Ferrari', 'Fiat', 'Ford',
  'Genesis', 'GMC',
  'Honda', 'Hummer', 'Hyundai',
  'Infiniti', 'Isuzu',
  'Jaguar', 'Jeep',
  'Kia',
  'Lamborghini', 'Lancia', 'Land Rover', 'Lexus', 'Lincoln', 'Lotus',
  'Maserati', 'Maybach', 'Mazda', 'McLaren', 'Mercedes-Benz', 'Mercury', 'Mini', 'Mitsubishi', 'Morgan',
  'Nissan',
  'Oldsmobile', 'Opel',
  'Pagani', 'Peugeot', 'Pontiac', 'Porsche',
  'RAM', 'Renault', 'Rolls-Royce',
  'Saab', 'Seat', 'Škoda', 'Smart', 'Subaru', 'Suzuki',
  'Tesla', 'Toyota',
  'Vauxhall', 'Volkswagen', 'Volvo',
  'Zastava',
].sort()

interface Props {
  value: string
  onChange: (v: string) => void
  topMakes?: string[]
}

export default function MakeCombobox({ value, onChange, topMakes = [] }: Props) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  const q = query.toLowerCase()
  const filteredAll = ALL_MAKES.filter((m) => m.toLowerCase().includes(q))
  const filteredTop = topMakes.filter((m) => m.toLowerCase().includes(q))

  function select(make: string) {
    onChange(make)
    setQuery(make)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            onChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Volkswagen"
          autoComplete="off"
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          onClick={() => setOpen((o) => !o)}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
          {filteredTop.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide bg-slate-50">
                Najpoužívanejšie
              </div>
              {filteredTop.map((make) => (
                <button
                  key={`top-${make}`}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-orange-50 hover:text-orange-700 transition-colors"
                  onMouseDown={(e) => { e.preventDefault(); select(make) }}
                >
                  {make}
                </button>
              ))}
              <div className="border-t border-slate-100" />
            </>
          )}

          <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide bg-slate-50">
            Všetky značky
          </div>
          {filteredAll.length > 0 ? (
            filteredAll.map((make) => (
              <button
                key={make}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-orange-50 hover:text-orange-700 transition-colors"
                onMouseDown={(e) => { e.preventDefault(); select(make) }}
              >
                {make}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-slate-400">Žiadne výsledky</div>
          )}
        </div>
      )}
    </div>
  )
}
