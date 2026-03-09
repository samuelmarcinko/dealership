'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import {
  Search, Plus, Trash2, DatabaseZap, ShieldCheck, Armchair, MonitorPlay,
  Car, Wrench, Zap, X, ChevronDown, ChevronUp, Star, Heart, Home, Shield,
} from 'lucide-react'
import { CATEGORY_ORDER, CATEGORY_META, type EquipmentCategory } from '@/lib/equipmentData'

interface EquipmentItem {
  id: string
  name: string
  category: string
  subcategory: string
  sortOrder: number
  isActive: boolean
}

interface CustomCategory {
  id: string
  name: string
  icon: string
}

interface Props {
  initialItems: EquipmentItem[]
}

const BUILTIN_ICONS: Record<EquipmentCategory, React.ElementType> = {
  SAFETY:     ShieldCheck,
  COMFORT:    Armchair,
  MULTIMEDIA: MonitorPlay,
  EXTERIOR:   Car,
  OTHER:      Wrench,
  EV:         Zap,
}

const ICON_OPTIONS = [
  { name: 'Wrench', icon: Wrench },
  { name: 'Car', icon: Car },
  { name: 'Star', icon: Star },
  { name: 'Heart', icon: Heart },
  { name: 'Home', icon: Home },
  { name: 'Zap', icon: Zap },
  { name: 'Shield', icon: Shield },
  { name: 'ShieldCheck', icon: ShieldCheck },
]

const ICON_MAP: Record<string, React.ElementType> = Object.fromEntries(ICON_OPTIONS.map(i => [i.name, i.icon]))

function getIcon(name: string): React.ElementType {
  return ICON_MAP[name] ?? Wrench
}

export default function EquipmentManager({ initialItems }: Props) {
  const { toast } = useToast()
  const [items, setItems] = useState<EquipmentItem[]>(initialItems)
  const [activeTab, setActiveTab] = useState<string>('SAFETY')
  const [search, setSearch] = useState('')
  const [seeding, setSeeding] = useState(false)

  // Custom categories
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([])
  const [customCatsLoaded, setCustomCatsLoaded] = useState(false)
  const [showNewCatForm, setShowNewCatForm] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatIcon, setNewCatIcon] = useState('Wrench')
  const [savingCat, setSavingCat] = useState(false)

  React.useEffect(() => {
    if (customCatsLoaded) return
    fetch('/api/equipment/categories')
      .then(r => r.json())
      .then(j => { setCustomCategories(j.data ?? []); setCustomCatsLoaded(true) })
      .catch(() => {})
  }, [customCatsLoaded])

  // Add form state
  const [newName, setNewName] = useState('')
  const [newSubcat, setNewSubcat] = useState('')
  const [newSubcatCustom, setNewSubcatCustom] = useState('')
  const [addingToSubcat, setAddingToSubcat] = useState<string | null>(null)

  // Collapsed subcategory groups
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const isBuiltin = CATEGORY_ORDER.includes(activeTab as EquipmentCategory)
  const activeCustomCat = !isBuiltin ? customCategories.find(cc => cc.id === activeTab) : null

  // For builtin tabs: use equipment items. For custom tabs: use custom cat items from DB (stored per-vehicle in vehicle JSON, but we manage the category list here)
  const tabItems = useMemo(
    () => isBuiltin ? items.filter(i => i.category === activeTab) : items.filter(i => i.category === activeTab),
    [items, activeTab, isBuiltin]
  )

  const filteredItems = useMemo(() => {
    if (!search.trim()) return tabItems
    const q = search.toLowerCase()
    return tabItems.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.subcategory.toLowerCase().includes(q)
    )
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

  const existingSubcats = useMemo(
    () => [...new Set(tabItems.map(i => i.subcategory))].sort(),
    [tabItems]
  )

  async function handleSeed() {
    if (!confirm('Inicializovať predvolenú databázu výbavy? Funguje len ak je databáza prázdna.')) return
    setSeeding(true)
    try {
      const res = await fetch('/api/equipment', { method: 'PUT' })
      const json = await res.json()
      if (!res.ok) { toast('error', json.error ?? 'Chyba'); return }
      if (!json.seeded) { toast('error', 'Databáza nie je prázdna — seed sa nevykonal'); return }
      const listRes = await fetch('/api/equipment')
      const listJson = await listRes.json()
      setItems(listJson.data ?? [])
      toast('success', json.message)
    } catch {
      toast('error', 'Nastala chyba')
    } finally {
      setSeeding(false)
    }
  }

  async function handleAdd(subcategory: string) {
    const name = newName.trim()
    const subcat = subcategory === '__new__' ? newSubcatCustom.trim() : subcategory
    if (!name || !subcat) return
    const category = isBuiltin ? activeTab : activeTab
    try {
      const res = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category, subcategory: subcat }),
      })
      const json = await res.json()
      if (!res.ok) { toast('error', json.error ?? 'Chyba'); return }
      setItems(prev => [...prev, json.data])
      setNewName('')
      setNewSubcat('')
      setNewSubcatCustom('')
      setAddingToSubcat(null)
      toast('success', 'Položka pridaná')
    } catch {
      toast('error', 'Nastala chyba')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Odstrániť túto položku?')) return
    const res = await fetch(`/api/equipment/${id}`, { method: 'DELETE' })
    if (!res.ok) { toast('error', 'Chyba pri odstraňovaní'); return }
    setItems(prev => prev.filter(i => i.id !== id))
    toast('success', 'Položka odstránená')
  }

  async function handleAddCustomCategory() {
    const name = newCatName.trim()
    if (!name) return
    setSavingCat(true)
    try {
      const res = await fetch('/api/equipment/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, icon: newCatIcon }),
      })
      const json = await res.json()
      if (!res.ok) { toast('error', json.error ?? 'Chyba'); return }
      setCustomCategories(prev => [...prev, json.data])
      setNewCatName('')
      setNewCatIcon('Wrench')
      setShowNewCatForm(false)
      toast('success', 'Kategória pridaná')
    } catch {
      toast('error', 'Nastala chyba')
    } finally {
      setSavingCat(false)
    }
  }

  async function handleDeleteCustomCategory(id: string, name: string) {
    if (!confirm(`Odstrániť kategóriu „${name}"?`)) return
    const res = await fetch(`/api/equipment/categories/${id}`, { method: 'DELETE' })
    if (!res.ok) { toast('error', 'Chyba pri odstraňovaní'); return }
    setCustomCategories(prev => prev.filter(cc => cc.id !== id))
    if (activeTab === id) setActiveTab('SAFETY')
    toast('success', 'Kategória odstránená')
  }

  function toggleCollapse(subcat: string) {
    setCollapsed(prev => ({ ...prev, [subcat]: !prev[subcat] }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Výbava vozidiel</h1>
          <p className="text-slate-500 text-sm mt-1">
            Globálna databáza výbavy — pri pridávaní vozidla sa zobrazí ako checkboxy.
          </p>
        </div>
        {items.length === 0 && (
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
          >
            <DatabaseZap className="h-4 w-4" />
            {seeding ? 'Inicializujem...' : 'Inicializovať databázu'}
          </button>
        )}
      </div>

      <Card>
        {/* Category tabs */}
        <div className="flex flex-wrap gap-0 border-b border-slate-100 px-2 pt-2">
          {CATEGORY_ORDER.map(cat => {
            const meta = CATEGORY_META[cat]
            const Icon = BUILTIN_ICONS[cat]
            const count = items.filter(i => i.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => { setActiveTab(cat); setSearch(''); setAddingToSubcat(null) }}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors ${
                  activeTab === cat
                    ? 'border-orange-500 text-orange-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {meta.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-normal ${
                  activeTab === cat ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
          {customCategories.map(cc => {
            const Icon = getIcon(cc.icon)
            const count = items.filter(i => i.category === cc.id).length
            return (
              <div key={cc.id} className="relative group">
                <button
                  onClick={() => { setActiveTab(cc.id); setSearch(''); setAddingToSubcat(null) }}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors ${
                    activeTab === cc.id
                      ? 'border-orange-500 text-orange-600 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {cc.name}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-normal ${
                    activeTab === cc.id ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
                <button
                  onClick={() => handleDeleteCustomCategory(cc.id, cc.name)}
                  className="absolute -top-0.5 -right-0.5 opacity-0 group-hover:opacity-100 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center transition-opacity"
                  title="Odstrániť kategóriu"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            )
          })}
          {/* Add new category button */}
          <button
            onClick={() => setShowNewCatForm(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
            title="Nová kategória"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* New category form */}
        {showNewCatForm && (
          <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border-b border-slate-100">
            <input
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCustomCategory()}
              placeholder="Názov kategórie..."
              autoFocus
              className="h-9 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 min-w-48"
            />
            <div className="flex gap-1">
              {ICON_OPTIONS.map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setNewCatIcon(name)}
                  className={`w-9 h-9 rounded-md border-2 flex items-center justify-center transition-colors ${
                    newCatIcon === name ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                  title={name}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
            <button
              onClick={handleAddCustomCategory}
              disabled={!newCatName.trim() || savingCat}
              className="h-9 px-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
            >
              {savingCat ? 'Ukladám...' : 'Pridať'}
            </button>
            <button
              onClick={() => { setShowNewCatForm(false); setNewCatName(''); setNewCatIcon('Wrench') }}
              className="h-9 px-3 text-slate-500 hover:text-slate-700 text-sm rounded-lg hover:bg-slate-100 transition-colors"
            >
              Zrušiť
            </button>
          </div>
        )}

        <CardContent className="pt-4 space-y-4">
          {/* Custom category info */}
          {!isBuiltin && activeCustomCat && (
            <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
              Pridajte položky výbavy do kategórie <strong>{activeCustomCat.name}</strong>. Tieto položky budú dostupné ako checkboxy pri úprave vozidiel.
            </p>
          )}

          {/* Search + Add new subcategory button */}
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Hľadať výbavu..."
                className="w-full pl-9 pr-8 h-9 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setAddingToSubcat('__new__')}
              className="flex items-center gap-1.5 h-9 px-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Pridať položku
            </button>
          </div>

          {/* New item form */}
          {addingToSubcat !== null && (
            <div className="flex flex-wrap gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl">
              <select
                value={newSubcat}
                onChange={e => setNewSubcat(e.target.value)}
                className="h-9 rounded-md border border-orange-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 min-w-48"
              >
                <option value="">— Vybrať podkategóriu —</option>
                {existingSubcats.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
                <option value="__new__">+ Nová podkategória</option>
              </select>
              {newSubcat === '__new__' && (
                <input
                  value={newSubcatCustom}
                  onChange={e => setNewSubcatCustom(e.target.value)}
                  placeholder="Názov novej podkategórie"
                  className="h-9 px-3 rounded-md border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 min-w-48"
                />
              )}
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd(newSubcat)}
                placeholder="Názov výbavy..."
                className="h-9 px-3 rounded-md border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 flex-1 min-w-48"
                autoFocus
              />
              <button
                onClick={() => handleAdd(newSubcat)}
                disabled={!newName.trim() || !newSubcat}
                className="h-9 px-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
              >
                Pridať
              </button>
              <button
                onClick={() => { setAddingToSubcat(null); setNewName(''); setNewSubcat(''); setNewSubcatCustom('') }}
                className="h-9 px-3 text-slate-500 hover:text-slate-700 text-sm rounded-lg hover:bg-slate-100 transition-colors"
              >
                Zrušiť
              </button>
            </div>
          )}

          {/* Items by subcategory */}
          {grouped.size === 0 ? (
            <div className="py-10 text-center text-slate-400">
              {items.length === 0
                ? <p className="text-sm">Databáza je prázdna. Inicializujte predvolenú databázu alebo pridajte položky manuálne.</p>
                : <p className="text-sm">Žiadne výsledky{search ? ` pre „${search}"` : ''}</p>
              }
            </div>
          ) : (
            <div className="space-y-3">
              {[...grouped.entries()].map(([subcategory, groupItems]) => (
                <div key={subcategory} className="border border-slate-100 rounded-xl overflow-hidden">
                  {/* Subcategory header */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                    <button
                      onClick={() => toggleCollapse(subcategory)}
                      className="flex items-center gap-2 flex-1 text-left"
                    >
                      {collapsed[subcategory]
                        ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                        : <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                      }
                      <span className="text-sm font-semibold text-slate-700">{subcategory}</span>
                      <span className="text-xs text-slate-400 font-normal">({groupItems.length})</span>
                    </button>
                    <button
                      onClick={() => { setAddingToSubcat(subcategory); setNewSubcat(subcategory); setNewName(''); setNewSubcatCustom('') }}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-orange-600 transition-colors px-2 py-1 rounded-md hover:bg-orange-50"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Pridať
                    </button>
                  </div>

                  {/* Items */}
                  {!collapsed[subcategory] && (
                    <div className="divide-y divide-slate-50">
                      {groupItems.map(item => (
                        <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50/70 group">
                          <span className="flex-1 text-sm text-slate-700">{item.name}</span>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                            title="Odstrániť"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
