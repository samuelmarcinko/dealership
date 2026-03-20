'use client'

import React, { useState, useMemo } from 'react'
import {
  Search, X, Plus, Check, AlertTriangle,
  ShieldCheck, Armchair, MonitorPlay, Car, Wrench, Zap, Star, Heart, Home, Shield,
} from 'lucide-react'
import { CATEGORY_ORDER, CATEGORY_META, type EquipmentCategory } from '@/lib/equipmentData'

interface EquipmentItem {
  id: string
  name: string
  category: string
  subcategory: string
}

interface CustomCategory {
  id: string
  name: string
  icon: string
}

const DEFECTS_TAB = '__defects__'

interface Props {
  items: EquipmentItem[]
  value: Record<string, string[]>
  onChange: (cat: string, names: string[]) => void
  customCategories?: CustomCategory[]
  defects?: string[]
  onDefectsChange?: (defects: string[]) => void
}

const BUILTIN_ICONS: Record<EquipmentCategory, React.ElementType> = {
  SAFETY:     ShieldCheck,
  COMFORT:    Armchair,
  MULTIMEDIA: MonitorPlay,
  EXTERIOR:   Car,
  OTHER:      Wrench,
  EV:         Zap,
}

const CUSTOM_ICON_MAP: Record<string, React.ElementType> = {
  Wrench, Car, Star, Heart, Home, Zap, Shield, ShieldCheck,
}

function getCustomIcon(name: string): React.ElementType {
  return CUSTOM_ICON_MAP[name] ?? Wrench
}

export default function FeatureCheckboxes({ items, value, onChange, customCategories = [], defects = [], onDefectsChange }: Props) {
  const [activeTab, setActiveTab] = useState<string>('SAFETY')
  const [search, setSearch] = useState('')
  const [customInput, setCustomInput] = useState('')

  const isBuiltin = CATEGORY_ORDER.includes(activeTab as EquipmentCategory)

  const tabItems = useMemo(
    () => isBuiltin ? items.filter(i => i.category === activeTab) : [],
    [items, activeTab, isBuiltin]
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

  const totalSelected = [
    ...CATEGORY_ORDER.map(cat => value[cat]?.length ?? 0),
    ...customCategories.map(cc => value[cc.id]?.length ?? 0),
  ].reduce((a, b) => a + b, 0)

  const activeMeta = isBuiltin ? CATEGORY_META[activeTab as EquipmentCategory] : null
  const activeCustomCat = !isBuiltin ? customCategories.find(cc => cc.id === activeTab) : null
  const searchPlaceholder = activeMeta
    ? `Hľadať v ${activeMeta.label.toLowerCase()}...`
    : `Hľadať v ${activeCustomCat?.name ?? ''}...`

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Tab bar */}
      <div className="flex flex-wrap border-b border-slate-200 bg-slate-50">
        {CATEGORY_ORDER.map(cat => {
          const meta = CATEGORY_META[cat]
          const Icon = BUILTIN_ICONS[cat]
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
        {customCategories.map(cc => {
          const Icon = getCustomIcon(cc.icon)
          const count = (value[cc.id] ?? []).length
          return (
            <button
              key={cc.id}
              type="button"
              onClick={() => { setActiveTab(cc.id); setSearch(''); setCustomInput('') }}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === cc.id
                  ? 'border-orange-500 text-orange-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/60'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {cc.name}
              {count > 0 && (
                <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
                  {count}
                </span>
              )}
            </button>
          )
        })}
        {/* ZÁVADY VOZIDLA tab — always last, red */}
        <button
          type="button"
          onClick={() => { setActiveTab(DEFECTS_TAB); setSearch(''); setCustomInput('') }}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === DEFECTS_TAB
              ? 'border-red-500 text-red-600 bg-white'
              : 'border-transparent text-red-500 hover:text-red-600 hover:bg-red-50/60'
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Závady vozidla
          {defects.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
              {defects.length}
            </span>
          )}
        </button>

        {totalSelected > 0 && activeTab !== DEFECTS_TAB && (
          <span className="ml-auto flex items-center px-3 text-xs text-slate-400">
            {totalSelected} vybraných celkom
          </span>
        )}
      </div>

      <div className="p-4 space-y-3 bg-white">

        {/* ZÁVADY VOZIDLA content */}
        {activeTab === DEFECTS_TAB && (
          <div className="space-y-2">
            {defects.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-4">
                Žiadne závady. Kliknite na &ldquo;Pridať riadok&rdquo; pre zápis závady.
              </p>
            ) : (
              <div className="space-y-2">
                {defects.map((defect, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono w-5 shrink-0 text-right">{idx + 1}.</span>
                    <input
                      value={defect}
                      onChange={e => {
                        const next = [...defects]
                        next[idx] = e.target.value
                        onDefectsChange?.(next)
                      }}
                      placeholder="Popíšte závadu..."
                      className="flex-1 h-9 px-3 rounded-md border border-red-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-red-50/30"
                    />
                    <button
                      type="button"
                      onClick={() => onDefectsChange?.(defects.filter((_, i) => i !== idx))}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => onDefectsChange?.([...defects, ''])}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium pt-1"
            >
              <Plus className="h-4 w-4" />
              Pridať riadok
            </button>
          </div>
        )}

        {/* Search (only for builtin tabs with items) */}
        {activeTab !== DEFECTS_TAB && isBuiltin && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
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
        )}

        {/* Items grouped by subcategory (builtin) */}
        {activeTab !== DEFECTS_TAB && isBuiltin && (
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
        )}

        {/* Custom category tab — just custom items */}
        {activeTab !== DEFECTS_TAB && !isBuiltin && (
          <div className="space-y-2 min-h-16">
            {current.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-4">Žiadne položky. Pridajte vlastnú výbavu nižšie.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {current.map(name => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 border border-orange-200 text-orange-800 text-xs rounded-full"
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
        )}

        {/* Custom item input — hidden on defects tab */}
        {activeTab !== DEFECTS_TAB && <div className="pt-3 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            {isBuiltin ? 'Vlastná položka — len pre toto vozidlo' : 'Pridať položku'}
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
          {isBuiltin && customItems.length > 0 && (
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
        </div>}
      </div>
    </div>
  )
}
