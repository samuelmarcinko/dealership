'use client'

import React from 'react'
import { useNode } from '@craftjs/core'
import { PlayCircle } from 'lucide-react'
import { SettingsSection, Field, TextInput, SelectInput, ToggleInput } from '../SettingsUI'
import type { VideoProps } from '../types'

function getEmbedUrl(url: string): string | null {
  if (!url) return null
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  if (url.includes('/embed/')) return url
  return null
}

const aspectMap: Record<string, string> = {
  '16/9': 'aspect-video', '4/3': 'aspect-[4/3]', '1/1': 'aspect-square',
}

export function Video({ url = '', aspectRatio = '16/9', caption = '', showCaption = false }: VideoProps) {
  const { connectors: { connect, drag } } = useNode()
  const embedUrl = getEmbedUrl(url)

  return (
    <figure ref={(ref) => { if (ref) connect(drag(ref)) }} className="w-full cursor-grab">
      <div className={`w-full ${aspectMap[aspectRatio] ?? 'aspect-video'} overflow-hidden rounded-lg bg-slate-100 flex items-center justify-center`}>
        {embedUrl ? (
          <iframe src={embedUrl} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={caption || 'Video'} />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <PlayCircle className="h-12 w-12" />
            <p className="text-sm">Vložte YouTube alebo Vimeo URL v nastaveniach</p>
          </div>
        )}
      </div>
      {showCaption && caption && (
        <figcaption className="text-center text-sm text-slate-500 mt-2">{caption}</figcaption>
      )}
    </figure>
  )
}

function VideoSettings() {
  const { actions: { setProp }, ...props } = useNode((node) => ({
    url: node.data.props.url as string,
    aspectRatio: node.data.props.aspectRatio as string,
    caption: node.data.props.caption as string,
    showCaption: node.data.props.showCaption as boolean,
  }))

  return (
    <div>
      <SettingsSection title="Video">
        <Field label="YouTube / Vimeo URL">
          <TextInput
            value={props.url ?? ''}
            onChange={(v) => setProp((p: VideoProps) => { p.url = v })}
            placeholder="https://www.youtube.com/watch?v=…"
          />
          <p className="text-xs text-slate-400 mt-1">Podporované: YouTube, Vimeo</p>
        </Field>
        <Field label="Pomer strán">
          <SelectInput value={props.aspectRatio ?? '16/9'} onChange={(v) => setProp((p: VideoProps) => { p.aspectRatio = v as VideoProps['aspectRatio'] })}>
            <option value="16/9">16:9 (štandard)</option>
            <option value="4/3">4:3 (starší formát)</option>
            <option value="1/1">1:1 (štvorcový)</option>
          </SelectInput>
        </Field>
      </SettingsSection>

      <SettingsSection title="Popis" defaultOpen={false}>
        <ToggleInput value={props.showCaption ?? false} onChange={(v) => setProp((p: VideoProps) => { p.showCaption = v })} label="Zobraziť popis pod videom" />
        {props.showCaption && (
          <Field label="Popis">
            <TextInput value={props.caption ?? ''} onChange={(v) => setProp((p: VideoProps) => { p.caption = v })} placeholder="Popis videa…" />
          </Field>
        )}
      </SettingsSection>
    </div>
  )
}

Video.craft = {
  displayName: 'Video',
  props: { url: '', aspectRatio: '16/9', caption: '', showCaption: false } satisfies VideoProps,
  related: { settings: VideoSettings },
}
