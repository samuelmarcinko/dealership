'use client'

import React from 'react'
import { useNode } from '@craftjs/core'
import type { DividerProps } from '../types'

const spacingMap: Record<string, string> = { sm: 'py-4', md: 'py-8', lg: 'py-16' }
const spacingLabels: Record<string, string> = { sm: 'Malé', md: 'Stredné', lg: 'Veľké' }

export function Divider({ spacing = 'md', color = '#e2e8f0' }: DividerProps) {
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <div ref={(ref) => { if (ref) connect(drag(ref)) }} className={`w-full cursor-grab ${spacingMap[spacing] ?? 'py-8'}`}>
      <hr style={{ borderColor: color }} className="border-t" />
    </div>
  )
}

function DividerSettings() {
  const {
    spacing,
    color,
    actions: { setProp },
  } = useNode((node) => ({
    spacing: node.data.props.spacing as string,
    color: node.data.props.color as string,
  }))

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Medzera</label>
        <select
          value={spacing ?? 'md'}
          onChange={(e) => setProp((p: DividerProps) => { p.spacing = e.target.value as DividerProps['spacing'] })}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
        >
          {Object.entries(spacingLabels).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Farba čiary</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color ?? '#e2e8f0'}
            onChange={(e) => setProp((p: DividerProps) => { p.color = e.target.value })}
            className="h-8 w-8 rounded cursor-pointer border border-slate-300"
          />
          <span className="text-sm text-slate-600">{color ?? '#e2e8f0'}</span>
        </div>
      </div>
    </div>
  )
}

Divider.craft = {
  displayName: 'Divider',
  props: {
    spacing: 'md',
    color: '#e2e8f0',
  } satisfies DividerProps,
  related: {
    settings: DividerSettings,
  },
}
