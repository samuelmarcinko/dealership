'use client'

import React from 'react'
import { useNode } from '@craftjs/core'
import * as Icons from 'lucide-react'
import type { IconBoxProps } from '../types'

type LucideIconComponent = React.ComponentType<{ className?: string }>

const POPULAR_ICONS = [
  'Star', 'Check', 'Shield', 'Zap', 'Heart', 'Phone', 'Mail', 'MapPin',
  'Car', 'Wrench', 'Clock', 'Users', 'Award', 'Thumbs Up', 'Info', 'AlertCircle',
  'CheckCircle', 'XCircle', 'ArrowRight', 'ChevronRight',
]

export function IconBox({
  icon = 'Star',
  title = 'Názov',
  description = 'Popis funkcie alebo služby.',
  align = 'center',
}: IconBoxProps) {
  const {
    connectors: { connect, drag },
  } = useNode()

  const LucideIcon = (Icons as unknown as Record<string, LucideIconComponent>)[icon ?? 'Star']

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      className={`flex flex-col ${align === 'center' ? 'items-center text-center' : 'items-start'} gap-3 p-6 cursor-grab`}
    >
      {LucideIcon && <LucideIcon className="h-10 w-10 text-orange-500" />}
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {description && <p className="text-slate-600 leading-relaxed">{description}</p>}
    </div>
  )
}

function IconBoxSettings() {
  const {
    icon,
    title,
    description,
    align,
    actions: { setProp },
  } = useNode((node) => ({
    icon: node.data.props.icon as string,
    title: node.data.props.title as string,
    description: node.data.props.description as string,
    align: node.data.props.align as string,
  }))

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Ikona</label>
        <select
          value={icon ?? 'Star'}
          onChange={(e) => setProp((p: IconBoxProps) => { p.icon = e.target.value })}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
        >
          {POPULAR_ICONS.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <p className="text-xs text-slate-400">Názov Lucide ikony (napr. Star, Car, Shield…)</p>
        <input
          type="text"
          value={icon ?? ''}
          onChange={(e) => setProp((p: IconBoxProps) => { p.icon = e.target.value })}
          placeholder="Vlastná ikona…"
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Nadpis</label>
        <input
          type="text"
          value={title ?? ''}
          onChange={(e) => setProp((p: IconBoxProps) => { p.title = e.target.value })}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Popis</label>
        <textarea
          value={description ?? ''}
          onChange={(e) => setProp((p: IconBoxProps) => { p.description = e.target.value })}
          rows={3}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Zarovnanie</label>
        <select
          value={align ?? 'center'}
          onChange={(e) => setProp((p: IconBoxProps) => { p.align = e.target.value as IconBoxProps['align'] })}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="center">Na stred</option>
          <option value="left">Vľavo</option>
        </select>
      </div>
    </div>
  )
}

IconBox.craft = {
  displayName: 'Icon Box',
  props: {
    icon: 'Star',
    title: 'Názov',
    description: 'Popis funkcie alebo služby.',
    align: 'center',
  } satisfies IconBoxProps,
  related: {
    settings: IconBoxSettings,
  },
}
