'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronUp, ChevronDown, Plus, Trash2, Eye, EyeOff, Lock } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface MenuItem {
  id: string
  href: string
  label: string
  exact?: boolean
  enabled: boolean
  isBuiltin: boolean
}

interface Props {
  initialItems: MenuItem[]
}

export default function MenuEditor({ initialItems }: Props) {
  const [items, setItems] = useState<MenuItem[]>(initialItems)
  const [newLabel, setNewLabel] = useState('')
  const [newHref, setNewHref] = useState('')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  function move(index: number, direction: 'up' | 'down') {
    const next = [...items]
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setItems(next)
  }

  function updateLabel(index: number, label: string) {
    setItems(items.map((item, i) => (i === index ? { ...item, label } : item)))
  }

  function toggle(index: number) {
    setItems(items.map((item, i) => (i === index ? { ...item, enabled: !item.enabled } : item)))
  }

  function remove(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  function addItem() {
    const label = newLabel.trim()
    const href = newHref.trim()
    if (!label || !href) return
    setItems([
      ...items,
      {
        id: `custom-${Date.now()}`,
        href: href.startsWith('/') ? href : `/${href}`,
        label,
        enabled: true,
        isBuiltin: false,
      },
    ])
    setNewLabel('')
    setNewHref('')
  }

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      if (!res.ok) throw new Error()
      toast('success', 'Menu uložené')
    } catch {
      toast('error', 'Chyba pri ukladaní')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Item list */}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              item.enabled ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'
            }`}
          >
            {/* Up/down */}
            <div className="flex flex-col gap-0.5 shrink-0">
              <button
                type="button"
                onClick={() => move(i, 'up')}
                disabled={i === 0}
                className="p-0.5 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 'down')}
                disabled={i === items.length - 1}
                className="p-0.5 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Toggle visibility */}
            <button
              type="button"
              onClick={() => toggle(i)}
              className={`shrink-0 p-1.5 rounded-md transition-colors ${
                item.enabled
                  ? 'text-green-600 hover:bg-green-50'
                  : 'text-slate-400 hover:bg-slate-100'
              }`}
              title={item.enabled ? 'Skryť' : 'Zobraziť'}
            >
              {item.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>

            {/* Label input */}
            <div className="flex-1 min-w-0">
              <Input
                value={item.label}
                onChange={(e) => updateLabel(i, e.target.value)}
                className="h-8 text-sm"
              />
              <p className="text-xs text-slate-400 mt-0.5 ml-0.5">{item.href}</p>
            </div>

            {/* Builtin badge or delete */}
            {item.isBuiltin ? (
              <span
                className="shrink-0 flex items-center gap-1 text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded"
                title="Zabudovaná položka — URL sa nedá zmeniť"
              >
                <Lock className="h-3 w-3" />
                Zabudovaná
              </span>
            ) : (
              <button
                type="button"
                onClick={() => remove(i)}
                className="shrink-0 p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Odstrániť"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add custom item */}
      <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200 space-y-3">
        <p className="text-sm font-medium text-slate-600">Pridať vlastnú položku</p>
        <div className="flex gap-2">
          <Input
            placeholder="Názov (napr. Blog)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
          />
          <Input
            placeholder="URL (napr. /blog)"
            value={newHref}
            onChange={(e) => setNewHref(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
          />
          <Button
            type="button"
            onClick={addItem}
            variant="outline"
            disabled={!newLabel.trim() || !newHref.trim()}
          >
            <Plus className="h-4 w-4 mr-1" />
            Pridať
          </Button>
        </div>
      </div>

      <Button
        type="button"
        onClick={save}
        disabled={saving}
        className="bg-orange-500 hover:bg-orange-600 text-white"
      >
        {saving ? 'Ukladám...' : 'Uložiť menu'}
      </Button>
    </div>
  )
}
