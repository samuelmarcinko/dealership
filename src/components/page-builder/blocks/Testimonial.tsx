'use client'

import React from 'react'
import { useNode } from '@craftjs/core'
import {
  SettingsSection, Field, TextInput, TextareaInput, SelectInput,
  ColorInput, RangeInput, UploadButton,
} from '../SettingsUI'
import type { TestimonialProps } from '../types'

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`h-4 w-4 ${i < count ? 'text-yellow-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export function Testimonial({
  quote = 'Skvelá skúsenosť! Veľmi odporúčam.',
  authorName = 'Ján Novák',
  authorTitle = '',
  authorImage = '',
  rating = 5,
  style = 'card',
  bgColor = '',
  textColor = '',
}: TestimonialProps) {
  const { connectors: { connect, drag } } = useNode()

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      className="rounded-xl border border-slate-200 p-6 space-y-4 cursor-grab"
      style={{ backgroundColor: bgColor || '#ffffff', color: textColor || undefined }}
    >
      <Stars count={rating ?? 5} />
      <blockquote className="text-slate-700 italic leading-relaxed">"{quote}"</blockquote>
      <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
        {authorImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={authorImage} alt={authorName} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
            {authorName?.charAt(0) ?? '?'}
          </div>
        )}
        <div>
          <p className="font-semibold text-slate-900 text-sm">{authorName}</p>
          {authorTitle && <p className="text-slate-500 text-xs">{authorTitle}</p>}
        </div>
      </div>
    </div>
  )
}

function TestimonialSettings() {
  const { actions: { setProp }, ...props } = useNode((node) => ({
    quote: node.data.props.quote as string,
    authorName: node.data.props.authorName as string,
    authorTitle: node.data.props.authorTitle as string,
    authorImage: node.data.props.authorImage as string,
    rating: node.data.props.rating as number,
    style: node.data.props.style as string,
    bgColor: node.data.props.bgColor as string,
    textColor: node.data.props.textColor as string,
  }))

  return (
    <div>
      <SettingsSection title="Obsah">
        <Field label="Citát / recenzia">
          <TextareaInput value={props.quote ?? ''} onChange={(v) => setProp((p: TestimonialProps) => { p.quote = v })} rows={4} />
        </Field>
        <Field label="Hodnotenie (1–5 hviezd)">
          <RangeInput value={props.rating ?? 5} onChange={(v) => setProp((p: TestimonialProps) => { p.rating = v })} min={1} max={5} step={1} unit=" ★" />
        </Field>
        <Field label="Meno autora">
          <TextInput value={props.authorName ?? ''} onChange={(v) => setProp((p: TestimonialProps) => { p.authorName = v })} />
        </Field>
        <Field label="Titul / pozícia (nepovinné)">
          <TextInput value={props.authorTitle ?? ''} onChange={(v) => setProp((p: TestimonialProps) => { p.authorTitle = v })} placeholder="Spokojný zákazník" />
        </Field>
        <Field label="Foto autora (URL)">
          <TextInput value={props.authorImage ?? ''} onChange={(v) => setProp((p: TestimonialProps) => { p.authorImage = v })} placeholder="https://…" />
          <UploadButton onUpload={(url) => setProp((p: TestimonialProps) => { p.authorImage = url })} label="Nahrať foto" />
        </Field>
      </SettingsSection>

      <SettingsSection title="Štýl" defaultOpen={false}>
        <Field label="Vzhľad">
          <SelectInput value={props.style ?? 'card'} onChange={(v) => setProp((p: TestimonialProps) => { p.style = v as TestimonialProps['style'] })}>
            <option value="card">Karta (s orámovaním)</option>
            <option value="minimal">Minimalistický</option>
            <option value="quote">Úvodzovkový</option>
          </SelectInput>
        </Field>
        <Field label="Farba pozadia">
          <ColorInput value={props.bgColor ?? ''} onChange={(v) => setProp((p: TestimonialProps) => { p.bgColor = v })} />
        </Field>
        <Field label="Farba textu">
          <ColorInput value={props.textColor ?? ''} onChange={(v) => setProp((p: TestimonialProps) => { p.textColor = v })} />
        </Field>
      </SettingsSection>
    </div>
  )
}

Testimonial.craft = {
  displayName: 'Recenzia',
  props: {
    quote: 'Skvelá skúsenosť! Veľmi odporúčam.',
    authorName: 'Ján Novák', authorTitle: '', authorImage: '',
    rating: 5, style: 'card', bgColor: '', textColor: '',
  } satisfies TestimonialProps,
  related: { settings: TestimonialSettings },
}
