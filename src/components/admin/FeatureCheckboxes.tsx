'use client'

import React, { useState, useMemo } from 'react'
import {
  Search, X, Plus, Check,
  ShieldCheck, Armchair, MonitorPlay, Car, Wrench, Zap,
} from 'lucide-react'
import { CATEGORY_ORDER, CATEGORY_META, type EquipmentCategory } from '@/lib/equipmentData'

interface EquipmentItem {
  id: string
  name: string
  category: string
  subcategory: string
}

interface Props {
  items: EquipmentItem[]
  value: Record<EquipmentCategory, string[]>
  onChange: (cat: EquipmentCategory, names: string[]) => void
}

const CATEGORY_ICONS: Record<EquipmentCategory, React.ElementType> = {
  SAFETY:     ShieldCheck,
  COMFORT:    Armchair,
  MULTIMEDIA: MonitorPlay,
  EXTERIOR:   Car,
  OTHER:      Wrench,
  EV:         Zap,
}

export default function FeatureCheckboxes({ items, value, onChange }: Props) {
  const [activeTab, setActiveTab] = useState<EquipmentCategory>('SAFETY')
  const [search, setSearch] = useState('')
  const [customInput, setCustomInput] = useState('')

  const tabItems = useMemo(
    () => items.filter(i => i.category === activeTab),
    [items, activeTab]
  )

  const filteredItems = useMemo(() => {
    if (!search.trim()) return tabItems
    const q = search.toLowerCase()
    return tabItems.filter(i => i.name.toLowerCase().includes(q))
  }, [tabItems, search])

  const grouped = useMemo(() => {
    const map = new Map<string, EquipmentItem[]>()
    for (const item of filteredItems) {
      const arr = map.get(item.subcategory) ?? []
      arr.push(item)
      map.set(item.subcategory, arr)
    }
    return map
  }, [filteredItems])

  const current = value[activeTab] ?? []
  const globalNames = useMemo(() => new Set(tabItems.map(i => i.name)), [tabItems])
  const customItems = useMemo(
    () => current.filter(n => !globalNames.has(n)),
    [current, globalNames]
  )

  function toggle(name: string) {
    const next = current.includes(name)
      ? current.filter(n => n !== name)
      : [...current, name]
    onChange(activeTab, next)
  }

  function addCustom() {
    const name = customInput.trim()
    if (!name || current.includes(name)) { setCustomInput(''); return }
    onChange(activeTab, [...current, name])
    setCustomInput('')
  }

  function removeItem(name: string) {
    onChange(activeTab, current.filter(n => n !== name))
  }

  const totalSelected = CATEGORY_ORDER.reduce(
    (sum, cat) => sum + (value[cat]?.length ?? 0), 0
  )

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Tab bar */}
      <div className="flex flex-wrap border-b border-slate-200 bg-slate-50">
        {CATEGORY_ORDER.map(cat => {
          const meta = CATEGORY_META[cat]
          const Icon = CATEGORY_ICONS[cat]
          const count = (value[cat] ?? []).length
          return (
            <button
              key={cat}
              type="button"
              onClick={() => { setActiveTab(cat); setSearch(''); setCustomInput('') }}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === cat
                  ? 'border-orange-500 text-orange-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/60'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {meta.label}
              {count > 0 && (
                <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
                  {count}
                </span>
              )}
            </button>
          )
        })}
        {totalSelected > 0 && (
          <span className="ml-auto flex items-center px-3 text-xs text-slate-400">
            {totalSelected} vybraných celkom
          </span>
        )}
      </div>

      <div className="p-4 space-y-3 bg-white">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Hľadať v ${CATEGORY_META[activeTab].label.toLowerCase()}...`}
            className="w-full pl-9 pr-8 h-9 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>


        {/* Items grouped by subcategory */}
        <div className="space-y-4 max-h-80 overflow-y-auto pr-0.5 overscroll-contain">
          {grouped.size === 0 ? (
            <p className="text-center text-slate-400 text-sm py-6">
              {items.filter(i => i.category === activeTab).length === 0
                ? 'Táto kategória neobsahuje žiadne položky. Pridajte ich v menu Výbava vozidiel.'
                : `Žiadna výbava nezodpovedá „${search}"`
              }
            </p>
          ) : (
            [...grouped.entries()].map(([subcategory, groupItems]) => (
              <div key={subcategory}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 sticky top-0 bg-white py-0.5">
                  {subcategory}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                  {groupItems.map(item => {
                    const checked = current.includes(item.name)
                    return (
                      <label
                        key={item.id}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-sm transition-all select-none border ${
                          checked
                            ? 'bg-orange-50 border-orange-200 text-orange-900'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          onChange={() => toggle(item.name)}
                        />
                        <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          checked ? 'bg-orange-500 border-orange-500' : 'border-slate-300 bg-white'
                        }`}>
                          {checked && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                        </span>
                        <span className="leading-snug">{item.name}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Custom item input */}
        <div className="pt-3 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Vlastná položka — len pre toto vozidlo
          </p>
          <div className="flex gap-2">
            <input
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
              placeholder="Napíšte vlastnú výbavu a stlačte Enter..."
              className="flex-1 h-9 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50"
            />
            <button
              type="button"
              onClick={addCustom}
              disabled={!customInput.trim()}
              className="h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-md disabled:opacity-40 transition-colors flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Pridať
            </button>
          </div>
          {customItems.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {customItems.map(name => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-800 text-xs rounded-full"
                >
                  {name}
                  <button type="button" onClick={() => removeItem(name)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
