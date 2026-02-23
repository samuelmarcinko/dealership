'use client'

import React from 'react'
import { useNode } from '@craftjs/core'
import * as Icons from 'lucide-react'
import { Plus, Trash2 } from 'lucide-react'
import { SettingsSection, Field, TextInput, SelectInput, ColorInput, ToggleInput } from '../SettingsUI'
import type { IconListProps, IconListItem } from '../types'

type LucideIconComponent = React.ComponentType<{ className?: string }>
const iconSizeMap: Record<string, string> = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' }
const spacingMap: Record<string, string> = { sm: 'gap-2', md: 'gap-3', lg: 'gap-5' }

export function IconList({
  items = [{ icon: 'Check', text: 'Položka zoznamu' }],
  iconColor = '#f97316',
  iconSize = 'md',
  spacing = 'md',
  dividers = false,
}: IconListProps) {
  const { connectors: { connect, drag } } = useNode()

  return (
    <ul ref={(ref) => { if (ref) connect(drag(ref)) }} className={`flex flex-col ${spacingMap[spacing] ?? 'gap-3'} cursor-grab`}>
      {(items ?? []).map((item, i) => {
        const LucideIcon = (Icons as unknown as Record<string, LucideIconComponent>)[item.icon ?? 'Check']
        return (
          <li key={i} className={`flex items-start gap-3 ${dividers && i > 0 ? 'pt-3 border-t border-slate-200' : ''}`}>
            {LucideIcon && (
              <span className="flex-shrink-0 mt-0.5" style={{ color: iconColor }}>
                <LucideIcon className={iconSizeMap[iconSize] ?? 'h-5 w-5'} />
              </span>
            )}
            <span className="text-slate-700">{item.text}</span>
          </li>
        )
      })}
    </ul>
  )
}

function IconListSettings() {
  const { actions: { setProp }, ...props } = useNode((node) => ({
    items: node.data.props.items as IconListItem[],
    iconColor: node.data.props.iconColor as string,
    iconSize: node.data.props.iconSize as string,
    spacing: node.data.props.spacing as string,
    dividers: node.data.props.dividers as boolean,
  }))

  const items: IconListItem[] = props.items ?? [{ icon: 'Check', text: 'Položka' }]

  function updateItem(index: number, field: keyof IconListItem, value: string) {
    setProp((p: IconListProps) => {
      const newItems = [...(p.items ?? [])]
      newItems[index] = { ...newItems[index], [field]: value }
      p.items = newItems
    })
  }

  function addItem() {
    setProp((p: IconListProps) => {
      p.items = [...(p.items ?? []), { icon: 'Check', text: 'Nová položka' }]
    })
  }

  function removeItem(index: number) {
    setProp((p: IconListProps) => {
      p.items = (p.items ?? []).filter((_, i) => i !== index)
    })
  }

  return (
    <div>
      <SettingsSection title="Položky">
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-500">Položka {i + 1}</span>
                <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <Field label="Ikona (Lucide)">
                <TextInput value={item.icon ?? 'Check'} onChange={(v) => updateItem(i, 'icon', v)} placeholder="Check, Star, Car…" />
              </Field>
              <Field label="Text">
                <TextInput value={item.text ?? ''} onChange={(v) => updateItem(i, 'text', v)} />
              </Field>
              <Field label="Odkaz (nepovinné)">
                <TextInput value={item.link ?? ''} onChange={(v) => updateItem(i, 'link', v)} placeholder="/stranka" />
              </Field>
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-orange-400 hover:text-orange-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Pridať položku
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="Štýl" defaultOpen={false}>
        <Field label="Farba ikon">
          <ColorInput value={props.iconColor ?? '#f97316'} onChange={(v) => setProp((p: IconListProps) => { p.iconColor = v })} allowEmpty={false} />
        </Field>
        <Field label="Veľkosť ikon">
          <SelectInput value={props.iconSize ?? 'md'} onChange={(v) => setProp((p: IconListProps) => { p.iconSize = v as IconListProps['iconSize'] })}>
            <option value="sm">Malé</option>
            <option value="md">Stredné</option>
            <option value="lg">Veľké</option>
          </SelectInput>
        </Field>
        <Field label="Rozostup">
          <SelectInput value={props.spacing ?? 'md'} onChange={(v) => setProp((p: IconListProps) => { p.spacing = v as IconListProps['spacing'] })}>
            <option value="sm">Malý</option>
            <option value="md">Stredný</option>
            <option value="lg">Veľký</option>
          </SelectInput>
        </Field>
        <ToggleInput value={props.dividers ?? false} onChange={(v) => setProp((p: IconListProps) => { p.dividers = v })} label="Oddeľovacie čiary medzi položkami" />
      </SettingsSection>
    </div>
  )
}

IconList.craft = {
  displayName: 'Zoznam s ikonami',
  props: {
    items: [{ icon: 'Check', text: 'Prvá výhoda' }, { icon: 'Check', text: 'Druhá výhoda' }, { icon: 'Check', text: 'Tretia výhoda' }],
    iconColor: '#f97316', iconSize: 'md', spacing: 'md', dividers: false,
  } satisfies IconListProps,
  related: { settings: IconListSettings },
}
