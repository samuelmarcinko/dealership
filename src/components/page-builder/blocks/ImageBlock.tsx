'use client'

import React, { useRef } from 'react'
import { useNode } from '@craftjs/core'
import { ImageIcon, Upload } from 'lucide-react'
import type { ImageBlockProps } from '../types'

export function ImageBlock({ src = '', alt = '', objectFit = 'cover', height = 300 }: ImageBlockProps) {
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      className="w-full cursor-grab overflow-hidden rounded-lg"
      style={{ height }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="w-full h-full" style={{ objectFit }} />
      ) : (
        <div className="w-full h-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg">
          <div className="text-center text-slate-400">
            <ImageIcon className="h-10 w-10 mx-auto mb-2" />
            <p className="text-sm">Vyberte obrázok v nastaveniach</p>
          </div>
        </div>
      )}
    </div>
  )
}

function ImageBlockSettings() {
  const {
    src,
    alt,
    objectFit,
    height,
    actions: { setProp },
  } = useNode((node) => ({
    src: node.data.props.src as string,
    alt: node.data.props.alt as string,
    objectFit: node.data.props.objectFit as string,
    height: node.data.props.height as number,
  }))

  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch('/api/upload/branding', { method: 'POST', body: form })
      const json = await res.json()
      if (json.url) {
        setProp((p: ImageBlockProps) => { p.src = json.url })
      }
    } catch {
      // upload failed silently
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">URL obrázka</label>
        <input
          type="text"
          value={src ?? ''}
          onChange={(e) => setProp((p: ImageBlockProps) => { p.src = e.target.value })}
          placeholder="https://..."
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 mt-1"
        >
          <Upload className="h-4 w-4" />
          Nahrať obrázok
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Popis (alt)</label>
        <input
          type="text"
          value={alt ?? ''}
          onChange={(e) => setProp((p: ImageBlockProps) => { p.alt = e.target.value })}
          placeholder="Popis obrázka"
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Výška (px)</label>
        <input
          type="number"
          value={height ?? 300}
          onChange={(e) => setProp((p: ImageBlockProps) => { p.height = parseInt(e.target.value) || 300 })}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          min={50}
          max={1200}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Zobrazenie</label>
        <select
          value={objectFit ?? 'cover'}
          onChange={(e) => setProp((p: ImageBlockProps) => { p.objectFit = e.target.value as ImageBlockProps['objectFit'] })}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="cover">Cover (výrez)</option>
          <option value="contain">Contain (celý obrázok)</option>
        </select>
      </div>
    </div>
  )
}

ImageBlock.craft = {
  displayName: 'Obrázok',
  props: {
    src: '',
    alt: '',
    objectFit: 'cover',
    height: 300,
  } satisfies ImageBlockProps,
  related: {
    settings: ImageBlockSettings,
  },
}
