'use client'

import React, { useRef } from 'react'
import { useNode } from '@craftjs/core'
import { Upload } from 'lucide-react'
import type { HeroBlockProps } from '../types'

export function HeroBlock({
  title = 'Nadpis sekcie',
  subtitle = '',
  bgColor = '#1e293b',
  bgImage = '',
  ctaText = '',
  ctaHref = '#',
  textColor = '#ffffff',
}: HeroBlockProps) {
  const {
    connectors: { connect, drag },
  } = useNode()

  const backgroundStyle: React.CSSProperties = bgImage
    ? { background: `url(${bgImage}) center/cover no-repeat, ${bgColor}`, color: textColor }
    : { backgroundColor: bgColor, color: textColor }

  return (
    <section
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      className="py-20 cursor-grab"
      style={backgroundStyle}
    >
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
        {subtitle && (
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">{subtitle}</p>
        )}
        {ctaText && (
          <span className="inline-block bg-orange-500 text-white px-8 py-3 rounded-md font-medium">
            {ctaText}
          </span>
        )}
      </div>
    </section>
  )
}

function HeroBlockSettings() {
  const {
    title,
    subtitle,
    bgColor,
    bgImage,
    ctaText,
    ctaHref,
    textColor,
    actions: { setProp },
  } = useNode((node) => ({
    title: node.data.props.title as string,
    subtitle: node.data.props.subtitle as string,
    bgColor: node.data.props.bgColor as string,
    bgImage: node.data.props.bgImage as string,
    ctaText: node.data.props.ctaText as string,
    ctaHref: node.data.props.ctaHref as string,
    textColor: node.data.props.textColor as string,
  }))

  const fileRef = useRef<HTMLInputElement>(null)

  async function handleBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch('/api/upload/branding', { method: 'POST', body: form })
      const json = await res.json()
      if (json.url) setProp((p: HeroBlockProps) => { p.bgImage = json.url })
    } catch {
      // silent
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Nadpis</label>
        <input
          type="text"
          value={title ?? ''}
          onChange={(e) => setProp((p: HeroBlockProps) => { p.title = e.target.value })}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Podnadpis</label>
        <textarea
          value={subtitle ?? ''}
          onChange={(e) => setProp((p: HeroBlockProps) => { p.subtitle = e.target.value })}
          rows={2}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Text tlačidla (nepovinné)</label>
        <input
          type="text"
          value={ctaText ?? ''}
          onChange={(e) => setProp((p: HeroBlockProps) => { p.ctaText = e.target.value })}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      {ctaText && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Odkaz tlačidla</label>
          <input
            type="text"
            value={ctaHref ?? ''}
            onChange={(e) => setProp((p: HeroBlockProps) => { p.ctaHref = e.target.value })}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Farba pozadia</label>
          <input
            type="color"
            value={bgColor ?? '#1e293b'}
            onChange={(e) => setProp((p: HeroBlockProps) => { p.bgColor = e.target.value })}
            className="h-8 w-full rounded cursor-pointer border border-slate-300"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Farba textu</label>
          <input
            type="color"
            value={textColor ?? '#ffffff'}
            onChange={(e) => setProp((p: HeroBlockProps) => { p.textColor = e.target.value })}
            className="h-8 w-full rounded cursor-pointer border border-slate-300"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Obrázok pozadia (URL)</label>
        <input
          type="text"
          value={bgImage ?? ''}
          onChange={(e) => setProp((p: HeroBlockProps) => { p.bgImage = e.target.value })}
          placeholder="https://..."
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700"
        >
          <Upload className="h-4 w-4" />
          Nahrať obrázok
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
      </div>
    </div>
  )
}

HeroBlock.craft = {
  displayName: 'Hero sekcia',
  props: {
    title: 'Nadpis sekcie',
    subtitle: '',
    bgColor: '#1e293b',
    bgImage: '',
    ctaText: '',
    ctaHref: '#',
    textColor: '#ffffff',
  } satisfies HeroBlockProps,
  related: {
    settings: HeroBlockSettings,
  },
}
