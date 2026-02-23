'use client'

import React from 'react'
import { useNode } from '@craftjs/core'
import { SettingsSection, Field, TextInput, TextareaInput, SelectInput, ToggleInput } from '../SettingsUI'
import type { AlertProps } from '../types'

const config = {
  info:    { bg: 'bg-blue-50',   border: 'border-blue-300',   text: 'text-blue-800',   icon: 'ℹ' },
  success: { bg: 'bg-green-50',  border: 'border-green-300',  text: 'text-green-800',  icon: '✓' },
  warning: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-800', icon: '⚠' },
  error:   { bg: 'bg-red-50',    border: 'border-red-300',    text: 'text-red-800',    icon: '✕' },
}

export function Alert({ type = 'info', title = 'Nadpis oznámenia', message = 'Text oznámenia…', showIcon = true }: AlertProps) {
  const { connectors: { connect, drag } } = useNode()
  const c = config[type ?? 'info'] ?? config.info

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      className={`flex gap-3 p-4 rounded-lg border cursor-grab ${c.bg} ${c.border}`}
    >
      {showIcon && <span className={`flex-shrink-0 text-lg font-bold ${c.text}`}>{c.icon}</span>}
      <div>
        {title && <p className={`font-semibold mb-0.5 ${c.text}`}>{title}</p>}
        {message && <p className={`text-sm ${c.text} opacity-90`}>{message}</p>}
      </div>
    </div>
  )
}

function AlertSettings() {
  const { actions: { setProp }, ...props } = useNode((node) => ({
    type: node.data.props.type as string,
    title: node.data.props.title as string,
    message: node.data.props.message as string,
    showIcon: node.data.props.showIcon as boolean,
  }))

  return (
    <div>
      <SettingsSection title="Obsah">
        <Field label="Typ">
          <SelectInput value={props.type ?? 'info'} onChange={(v) => setProp((p: AlertProps) => { p.type = v as AlertProps['type'] })}>
            <option value="info">ℹ Informácia (modrá)</option>
            <option value="success">✓ Úspech (zelená)</option>
            <option value="warning">⚠ Upozornenie (žltá)</option>
            <option value="error">✕ Chyba (červená)</option>
          </SelectInput>
        </Field>
        <Field label="Nadpis (nepovinné)">
          <TextInput value={props.title ?? ''} onChange={(v) => setProp((p: AlertProps) => { p.title = v })} placeholder="Dôležitá informácia" />
        </Field>
        <Field label="Text správy">
          <TextareaInput value={props.message ?? ''} onChange={(v) => setProp((p: AlertProps) => { p.message = v })} rows={3} />
        </Field>
        <ToggleInput value={props.showIcon ?? true} onChange={(v) => setProp((p: AlertProps) => { p.showIcon = v })} label="Zobraziť ikonu" />
      </SettingsSection>
    </div>
  )
}

Alert.craft = {
  displayName: 'Oznámenie',
  props: { type: 'info', title: 'Nadpis oznámenia', message: 'Text oznámenia…', showIcon: true } satisfies AlertProps,
  related: { settings: AlertSettings },
}
