'use client'

import React from 'react'
import { useNode } from '@craftjs/core'
import type { ButtonBlockProps } from '../types'

const sizeMap: Record<string, string> = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-6 py-2 text-base',
  lg: 'px-8 py-3 text-lg',
}

const variantMap: Record<string, string> = {
  primary: 'bg-orange-500 hover:bg-orange-600 text-white',
  outline: 'border-2 border-orange-500 text-orange-500 hover:bg-orange-50',
}

const alignMap: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

export function ButtonBlock({
  text = 'Kliknite sem',
  href = '#',
  variant = 'primary',
  size = 'md',
  align = 'left',
}: ButtonBlockProps) {
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      className={`w-full cursor-grab p-2 ${alignMap[align] ?? 'text-left'}`}
    >
      <span
        className={`inline-block rounded-md font-medium ${sizeMap[size] ?? sizeMap.md} ${variantMap[variant] ?? variantMap.primary}`}
      >
        {text}
      </span>
    </div>
  )
}

function ButtonBlockSettings() {
  const {
    text,
    href,
    variant,
    size,
    align,
    actions: { setProp },
  } = useNode((node) => ({
    text: node.data.props.text as string,
    href: node.data.props.href as string,
    variant: node.data.props.variant as string,
    size: node.data.props.size as string,
    align: node.data.props.align as string,
  }))

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Text tlačidla</label>
        <input
          type="text"
          value={text ?? ''}
          onChange={(e) => setProp((p: ButtonBlockProps) => { p.text = e.target.value })}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Odkaz (URL)</label>
        <input
          type="text"
          value={href ?? ''}
          onChange={(e) => setProp((p: ButtonBlockProps) => { p.href = e.target.value })}
          placeholder="/kontakt"
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Štýl</label>
        <select
          value={variant ?? 'primary'}
          onChange={(e) => setProp((p: ButtonBlockProps) => { p.variant = e.target.value as ButtonBlockProps['variant'] })}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="primary">Primárne (oranžové)</option>
          <option value="outline">Outline</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Veľkosť</label>
        <select
          value={size ?? 'md'}
          onChange={(e) => setProp((p: ButtonBlockProps) => { p.size = e.target.value as ButtonBlockProps['size'] })}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="sm">Malé</option>
          <option value="md">Stredné</option>
          <option value="lg">Veľké</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Zarovnanie</label>
        <select
          value={align ?? 'left'}
          onChange={(e) => setProp((p: ButtonBlockProps) => { p.align = e.target.value as ButtonBlockProps['align'] })}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="left">Vľavo</option>
          <option value="center">Na stred</option>
          <option value="right">Vpravo</option>
        </select>
      </div>
    </div>
  )
}

ButtonBlock.craft = {
  displayName: 'Tlačidlo',
  props: {
    text: 'Kliknite sem',
    href: '#',
    variant: 'primary',
    size: 'md',
    align: 'left',
  } satisfies ButtonBlockProps,
  related: {
    settings: ButtonBlockSettings,
  },
}
