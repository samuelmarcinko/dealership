'use client'

import React from 'react'
import { useNode } from '@craftjs/core'
import { SettingsSection, Field, TextInput, SelectInput, ColorInput, SegmentedInput } from '../SettingsUI'
import type { NumberHighlightProps } from '../types'

const alignMap: Record<string, string> = { left: 'text-left', center: 'text-center', right: 'text-right' }

export function NumberHighlight({
  number = '500+',
  label = 'spokojných zákazníkov',
  prefix = '',
  suffix = '',
  color = '#f97316',
  align = 'center',
  numberSize = 'text-5xl',
}: NumberHighlightProps) {
  const { connectors: { connect, drag } } = useNode()

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      className={`py-4 ${alignMap[align] ?? 'text-center'} cursor-grab`}
    >
      <div
        className={`${numberSize ?? 'text-5xl'} font-extrabold leading-none`}
        style={{ color: color || '#f97316' }}
      >
        {prefix}{number}{suffix}
      </div>
      {label && <p className="text-slate-600 mt-2 text-base">{label}</p>}
    </div>
  )
}

function NumberHighlightSettings() {
  const { actions: { setProp }, ...props } = useNode((node) => ({
    number: node.data.props.number as string,
    label: node.data.props.label as string,
    prefix: node.data.props.prefix as string,
    suffix: node.data.props.suffix as string,
    color: node.data.props.color as string,
    align: node.data.props.align as string,
    numberSize: node.data.props.numberSize as string,
  }))

  return (
    <div>
      <SettingsSection title="Obsah">
        <Field label="Číslo / hodnota">
          <TextInput value={props.number ?? ''} onChange={(v) => setProp((p: NumberHighlightProps) => { p.number = v })} placeholder="500, 98%, 12…" />
        </Field>
        <Field label="Prefix (pred číslom)">
          <TextInput value={props.prefix ?? ''} onChange={(v) => setProp((p: NumberHighlightProps) => { p.prefix = v })} placeholder="od " />
        </Field>
        <Field label="Suffix (za číslom)">
          <TextInput value={props.suffix ?? ''} onChange={(v) => setProp((p: NumberHighlightProps) => { p.suffix = v })} placeholder="+" />
        </Field>
        <Field label="Popis pod číslom">
          <TextInput value={props.label ?? ''} onChange={(v) => setProp((p: NumberHighlightProps) => { p.label = v })} placeholder="spokojných zákazníkov" />
        </Field>
      </SettingsSection>

      <SettingsSection title="Štýl" defaultOpen={false}>
        <Field label="Veľkosť čísla">
          <SelectInput value={props.numberSize ?? 'text-5xl'} onChange={(v) => setProp((p: NumberHighlightProps) => { p.numberSize = v as NumberHighlightProps['numberSize'] })}>
            <option value="text-4xl">Stredné (36px)</option>
            <option value="text-5xl">Veľké (48px)</option>
            <option value="text-6xl">Extra veľké (60px)</option>
          </SelectInput>
        </Field>
        <Field label="Farba čísla">
          <ColorInput value={props.color ?? '#f97316'} onChange={(v) => setProp((p: NumberHighlightProps) => { p.color = v })} allowEmpty={false} />
        </Field>
        <Field label="Zarovnanie">
          <SegmentedInput
            value={props.align ?? 'center'}
            onChange={(v) => setProp((p: NumberHighlightProps) => { p.align = v as NumberHighlightProps['align'] })}
            options={[{ value: 'left', label: '←' }, { value: 'center', label: '↔' }, { value: 'right', label: '→' }]}
          />
        </Field>
      </SettingsSection>
    </div>
  )
}

NumberHighlight.craft = {
  displayName: 'Číslo / štatistika',
  props: {
    number: '500+', label: 'spokojných zákazníkov',
    prefix: '', suffix: '', color: '#f97316', align: 'center', numberSize: 'text-5xl',
  } satisfies NumberHighlightProps,
  related: { settings: NumberHighlightSettings },
}
