'use client'

import React from 'react'
import { useNode } from '@craftjs/core'
import {
  SettingsSection, Field, TextInput, SelectInput,
  ColorInput, ToggleInput, SegmentedInput, RangeInput,
} from '../SettingsUI'
import type { HeadingProps } from '../types'

const alignMap: Record<string, string> = { left: 'text-left', center: 'text-center', right: 'text-right' }

export function Heading({
  text = 'Nový nadpis',
  tag = 'h2',
  fontSize = 'text-3xl',
  fontWeight = 'font-bold',
  align = 'left',
  color = '',
  italic = false,
  uppercase = false,
  paddingTop = 0,
  paddingBottom = 8,
}: HeadingProps) {
  const { connectors: { connect, drag } } = useNode()
  const Tag = (tag ?? 'h2') as React.ElementType
  const classes = [
    fontSize,
    fontWeight,
    alignMap[align] ?? 'text-left',
    italic ? 'italic' : '',
    uppercase ? 'uppercase tracking-wide' : '',
    'cursor-grab w-full',
  ].filter(Boolean).join(' ')

  return (
    <Tag
      ref={(ref: unknown) => { if (ref) connect(drag(ref as HTMLElement)) }}
      className={classes}
      style={{
        color: color || undefined,
        paddingTop: paddingTop ? `${paddingTop}px` : undefined,
        paddingBottom: paddingBottom ? `${paddingBottom}px` : undefined,
      }}
    >
      {text}
    </Tag>
  )
}

function HeadingSettings() {
  const { actions: { setProp }, ...props } = useNode((node) => ({
    text: node.data.props.text as string,
    tag: node.data.props.tag as string,
    fontSize: node.data.props.fontSize as string,
    fontWeight: node.data.props.fontWeight as string,
    align: node.data.props.align as string,
    color: node.data.props.color as string,
    italic: node.data.props.italic as boolean,
    uppercase: node.data.props.uppercase as boolean,
    paddingTop: node.data.props.paddingTop as number,
    paddingBottom: node.data.props.paddingBottom as number,
  }))

  return (
    <div className="space-y-0">
      <SettingsSection title="Obsah">
        <Field label="Text nadpisu">
          <TextInput
            value={props.text ?? ''}
            onChange={(v) => setProp((p: HeadingProps) => { p.text = v })}
          />
        </Field>
        <Field label="HTML tag">
          <SelectInput value={props.tag ?? 'h2'} onChange={(v) => setProp((p: HeadingProps) => { p.tag = v as HeadingProps['tag'] })}>
            <option value="h1">H1 — Hlavný nadpis stránky</option>
            <option value="h2">H2 — Nadpis sekcie</option>
            <option value="h3">H3 — Podnadpis</option>
            <option value="h4">H4</option>
            <option value="h5">H5</option>
            <option value="h6">H6</option>
          </SelectInput>
        </Field>
      </SettingsSection>

      <SettingsSection title="Typografia">
        <Field label="Veľkosť">
          <SelectInput value={props.fontSize ?? 'text-3xl'} onChange={(v) => setProp((p: HeadingProps) => { p.fontSize = v as HeadingProps['fontSize'] })}>
            <option value="text-lg">Malý (18px)</option>
            <option value="text-xl">Stredný (20px)</option>
            <option value="text-2xl">Väčší (24px)</option>
            <option value="text-3xl">Veľký (30px)</option>
            <option value="text-4xl">X-Large (36px)</option>
            <option value="text-5xl">XX-Large (48px)</option>
          </SelectInput>
        </Field>
        <Field label="Hrúbka písma">
          <SelectInput value={props.fontWeight ?? 'font-bold'} onChange={(v) => setProp((p: HeadingProps) => { p.fontWeight = v as HeadingProps['fontWeight'] })}>
            <option value="font-normal">Normal</option>
            <option value="font-medium">Medium</option>
            <option value="font-semibold">Semibold</option>
            <option value="font-bold">Bold</option>
            <option value="font-extrabold">Extrabold</option>
          </SelectInput>
        </Field>
        <Field label="Zarovnanie">
          <SegmentedInput
            value={props.align ?? 'left'}
            onChange={(v) => setProp((p: HeadingProps) => { p.align = v as HeadingProps['align'] })}
            options={[{ value: 'left', label: '←' }, { value: 'center', label: '↔' }, { value: 'right', label: '→' }]}
          />
        </Field>
        <ToggleInput value={props.italic ?? false} onChange={(v) => setProp((p: HeadingProps) => { p.italic = v })} label="Kurzíva" />
        <ToggleInput value={props.uppercase ?? false} onChange={(v) => setProp((p: HeadingProps) => { p.uppercase = v })} label="VEĽKÉ PÍSMENÁ" />
      </SettingsSection>

      <SettingsSection title="Farba">
        <Field label="Farba textu (prázdne = zdedená)">
          <ColorInput value={props.color ?? ''} onChange={(v) => setProp((p: HeadingProps) => { p.color = v })} />
        </Field>
      </SettingsSection>

      <SettingsSection title="Rozostupy" defaultOpen={false}>
        <Field label="Padding hore">
          <RangeInput value={props.paddingTop ?? 0} onChange={(v) => setProp((p: HeadingProps) => { p.paddingTop = v })} min={0} max={120} />
        </Field>
        <Field label="Padding dole">
          <RangeInput value={props.paddingBottom ?? 8} onChange={(v) => setProp((p: HeadingProps) => { p.paddingBottom = v })} min={0} max={120} />
        </Field>
      </SettingsSection>
    </div>
  )
}

Heading.craft = {
  displayName: 'Nadpis',
  props: { text: 'Nový nadpis', tag: 'h2', fontSize: 'text-3xl', fontWeight: 'font-bold', align: 'left', color: '', italic: false, uppercase: false, paddingTop: 0, paddingBottom: 8 } satisfies HeadingProps,
  related: { settings: HeadingSettings },
}
