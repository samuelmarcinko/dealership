'use client'

import React from 'react'
import { useNode } from '@craftjs/core'
import * as Icons from 'lucide-react'
import {
  SettingsSection, Field, TextInput, TextareaInput, SelectInput,
  ColorInput, ToggleInput, SegmentedInput, UploadButton,
} from '../SettingsUI'
import type { CardProps } from '../types'

type LucideIconComponent = React.ComponentType<{ className?: string }>

const shadowMap: Record<string, string> = { none: '', sm: 'shadow-sm', md: 'shadow-md', lg: 'shadow-lg' }
const radiusMap: Record<string, string> = { none: '', md: 'rounded-md', lg: 'rounded-lg', xl: 'rounded-xl', '2xl': 'rounded-2xl' }
const paddingMap: Record<string, string> = { sm: 'p-4', md: 'p-6', lg: 'p-8' }

export function Card({
  mode = 'icon', icon = 'Star', imageUrl = '', title = 'Nadpis karty',
  text = 'Popis funkcie alebo služby.', align = 'center',
  showButton = false, buttonText = 'Zistiť viac', buttonHref = '#', buttonVariant = 'primary',
  bgColor = '', borderColor = '', shadow = 'md', borderRadius = 'lg', padding = 'md',
}: CardProps) {
  const { connectors: { connect, drag } } = useNode()
  const LucideIcon = (Icons as unknown as Record<string, LucideIconComponent>)[icon ?? 'Star']
  const alignCls = align === 'center' ? 'items-center text-center' : 'items-start text-left'

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      className={`flex flex-col ${alignCls} ${paddingMap[padding] ?? 'p-6'} ${shadowMap[shadow] ?? 'shadow-md'} ${radiusMap[borderRadius] ?? 'rounded-lg'} border cursor-grab`}
      style={{ backgroundColor: bgColor || undefined, borderColor: borderColor || undefined }}
    >
      {mode === 'image' && imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={title} className="w-full h-40 object-cover rounded-md mb-4" />
      ) : (
        LucideIcon && <LucideIcon className="h-10 w-10 text-orange-500 mb-3" />
      )}
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      {text && <p className="text-slate-600 text-sm leading-relaxed mb-4">{text}</p>}
      {showButton && (
        <span className={`inline-block px-5 py-2 rounded-md text-sm font-medium mt-auto ${
          buttonVariant === 'primary' ? 'bg-orange-500 text-white' : 'border-2 border-orange-500 text-orange-500'
        }`}>
          {buttonText}
        </span>
      )}
    </div>
  )
}

function CardSettings() {
  const { actions: { setProp }, ...props } = useNode((node) => ({
    mode: node.data.props.mode as string,
    icon: node.data.props.icon as string,
    imageUrl: node.data.props.imageUrl as string,
    title: node.data.props.title as string,
    text: node.data.props.text as string,
    align: node.data.props.align as string,
    showButton: node.data.props.showButton as boolean,
    buttonText: node.data.props.buttonText as string,
    buttonHref: node.data.props.buttonHref as string,
    buttonVariant: node.data.props.buttonVariant as string,
    bgColor: node.data.props.bgColor as string,
    borderColor: node.data.props.borderColor as string,
    shadow: node.data.props.shadow as string,
    borderRadius: node.data.props.borderRadius as string,
    padding: node.data.props.padding as string,
  }))

  return (
    <div>
      <SettingsSection title="Obsah">
        <Field label="Typ ikony/obrázka">
          <SegmentedInput
            value={props.mode ?? 'icon'}
            onChange={(v) => setProp((p: CardProps) => { p.mode = v as CardProps['mode'] })}
            options={[{ value: 'icon', label: 'Ikona' }, { value: 'image', label: 'Obrázok' }]}
          />
        </Field>
        {(props.mode ?? 'icon') === 'icon' ? (
          <Field label="Ikona (Lucide)">
            <TextInput value={props.icon ?? 'Star'} onChange={(v) => setProp((p: CardProps) => { p.icon = v })} placeholder="Star, Car, Shield…" />
          </Field>
        ) : (
          <Field label="URL obrázka">
            <TextInput value={props.imageUrl ?? ''} onChange={(v) => setProp((p: CardProps) => { p.imageUrl = v })} placeholder="https://…" />
            <UploadButton onUpload={(url) => setProp((p: CardProps) => { p.imageUrl = url })} />
          </Field>
        )}
        <Field label="Nadpis">
          <TextInput value={props.title ?? ''} onChange={(v) => setProp((p: CardProps) => { p.title = v })} />
        </Field>
        <Field label="Text">
          <TextareaInput value={props.text ?? ''} onChange={(v) => setProp((p: CardProps) => { p.text = v })} rows={3} />
        </Field>
        <Field label="Zarovnanie">
          <SegmentedInput
            value={props.align ?? 'center'}
            onChange={(v) => setProp((p: CardProps) => { p.align = v as CardProps['align'] })}
            options={[{ value: 'left', label: 'Vľavo' }, { value: 'center', label: 'Na stred' }]}
          />
        </Field>
      </SettingsSection>

      <SettingsSection title="Tlačidlo" defaultOpen={false}>
        <ToggleInput value={props.showButton ?? false} onChange={(v) => setProp((p: CardProps) => { p.showButton = v })} label="Zobraziť tlačidlo" />
        {props.showButton && (<>
          <Field label="Text tlačidla">
            <TextInput value={props.buttonText ?? ''} onChange={(v) => setProp((p: CardProps) => { p.buttonText = v })} />
          </Field>
          <Field label="Odkaz (URL)">
            <TextInput value={props.buttonHref ?? ''} onChange={(v) => setProp((p: CardProps) => { p.buttonHref = v })} placeholder="/kontakt" />
          </Field>
          <Field label="Štýl tlačidla">
            <SegmentedInput
              value={props.buttonVariant ?? 'primary'}
              onChange={(v) => setProp((p: CardProps) => { p.buttonVariant = v as CardProps['buttonVariant'] })}
              options={[{ value: 'primary', label: 'Plné' }, { value: 'outline', label: 'Obrys' }]}
            />
          </Field>
        </>)}
      </SettingsSection>

      <SettingsSection title="Štýl" defaultOpen={false}>
        <Field label="Tieň">
          <SelectInput value={props.shadow ?? 'md'} onChange={(v) => setProp((p: CardProps) => { p.shadow = v as CardProps['shadow'] })}>
            <option value="none">Žiadny</option>
            <option value="sm">Jemný</option>
            <option value="md">Stredný</option>
            <option value="lg">Výrazný</option>
          </SelectInput>
        </Field>
        <Field label="Zaoblenie rohov">
          <SelectInput value={props.borderRadius ?? 'lg'} onChange={(v) => setProp((p: CardProps) => { p.borderRadius = v as CardProps['borderRadius'] })}>
            <option value="none">Ostré</option>
            <option value="md">Malé</option>
            <option value="lg">Stredné</option>
            <option value="xl">Veľké</option>
            <option value="2xl">Extra veľké</option>
          </SelectInput>
        </Field>
        <Field label="Vnútorný okraj">
          <SelectInput value={props.padding ?? 'md'} onChange={(v) => setProp((p: CardProps) => { p.padding = v as CardProps['padding'] })}>
            <option value="sm">Malý</option>
            <option value="md">Stredný</option>
            <option value="lg">Veľký</option>
          </SelectInput>
        </Field>
        <Field label="Farba pozadia">
          <ColorInput value={props.bgColor ?? ''} onChange={(v) => setProp((p: CardProps) => { p.bgColor = v })} />
        </Field>
        <Field label="Farba orámovanie">
          <ColorInput value={props.borderColor ?? ''} onChange={(v) => setProp((p: CardProps) => { p.borderColor = v })} />
        </Field>
      </SettingsSection>
    </div>
  )
}

Card.craft = {
  displayName: 'Karta',
  props: {
    mode: 'icon', icon: 'Star', imageUrl: '', title: 'Nadpis karty',
    text: 'Popis funkcie alebo služby.', align: 'center',
    showButton: false, buttonText: 'Zistiť viac', buttonHref: '#', buttonVariant: 'primary',
    bgColor: '', borderColor: '', shadow: 'md', borderRadius: 'lg', padding: 'md',
  } satisfies CardProps,
  related: { settings: CardSettings },
}
