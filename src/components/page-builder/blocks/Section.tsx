'use client'

import React from 'react'
import { useNode, Element } from '@craftjs/core'
import { ColumnCanvas } from './ColumnCanvas'
import type { SectionProps } from '../types'

const colClasses: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
}

const gapClasses: Record<string, string> = {
  sm: 'gap-4',
  md: 'gap-8',
  lg: 'gap-12',
}

const paddingClasses: Record<string, string> = {
  none: '',
  sm: 'py-8',
  md: 'py-16',
  lg: 'py-24',
}

export function Section({
  columns = 1,
  gap = 'md',
  bgColor = '',
  padding = 'md',
}: SectionProps) {
  const {
    connectors: { connect, drag },
    isSelected,
  } = useNode((node) => ({ isSelected: node.events.selected }))

  return (
    <section
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      className={`w-full cursor-grab ${paddingClasses[padding] ?? 'py-16'} ${
        isSelected ? 'outline outline-2 outline-orange-400 outline-offset-2' : ''
      }`}
      style={bgColor ? { backgroundColor: bgColor } : {}}
    >
      <div className="container mx-auto px-4">
        <div className={`grid ${colClasses[columns] ?? 'grid-cols-1'} ${gapClasses[gap] ?? 'gap-8'}`}>
          <Element id="col-0" is={ColumnCanvas} canvas />
          {(columns ?? 1) >= 2 && <Element id="col-1" is={ColumnCanvas} canvas />}
          {(columns ?? 1) >= 3 && <Element id="col-2" is={ColumnCanvas} canvas />}
          {(columns ?? 1) >= 4 && <Element id="col-3" is={ColumnCanvas} canvas />}
        </div>
      </div>
    </section>
  )
}

function SectionSettings() {
  const {
    columns,
    gap,
    bgColor,
    padding,
    actions: { setProp },
  } = useNode((node) => ({
    columns: node.data.props.columns as number,
    gap: node.data.props.gap as string,
    bgColor: node.data.props.bgColor as string,
    padding: node.data.props.padding as string,
  }))

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Počet stĺpcov</label>
        <div className="grid grid-cols-4 gap-1">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setProp((p: SectionProps) => { p.columns = n as SectionProps['columns'] })}
              className={`py-2 rounded text-sm font-medium border transition-colors ${
                (columns ?? 1) === n
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'border-slate-300 hover:border-orange-400'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Medzera medzi stĺpcami</label>
        <select
          value={gap ?? 'md'}
          onChange={(e) => setProp((p: SectionProps) => { p.gap = e.target.value as SectionProps['gap'] })}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="sm">Malá</option>
          <option value="md">Stredná</option>
          <option value="lg">Veľká</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Vertikálny padding</label>
        <select
          value={padding ?? 'md'}
          onChange={(e) => setProp((p: SectionProps) => { p.padding = e.target.value as SectionProps['padding'] })}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="none">Žiadny</option>
          <option value="sm">Malý (py-8)</option>
          <option value="md">Stredný (py-16)</option>
          <option value="lg">Veľký (py-24)</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Farba pozadia</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={bgColor || '#ffffff'}
            onChange={(e) => setProp((p: SectionProps) => { p.bgColor = e.target.value })}
            className="h-8 w-8 rounded cursor-pointer border border-slate-300"
          />
          <span className="text-sm text-slate-600 flex-1">{bgColor || 'Priehľadné'}</span>
          {bgColor && (
            <button
              type="button"
              onClick={() => setProp((p: SectionProps) => { p.bgColor = '' })}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Odstrániť
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

Section.craft = {
  displayName: 'Sekcia',
  props: {
    columns: 1,
    gap: 'md',
    bgColor: '',
    padding: 'md',
  } satisfies SectionProps,
  related: {
    settings: SectionSettings,
  },
}
