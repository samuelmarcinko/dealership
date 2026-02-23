import React from 'react'
import type { VideoProps } from '../types'

function getEmbedUrl(url: string): string | null {
  if (!url) return null
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  // Already an embed URL
  if (url.includes('/embed/')) return url
  return null
}

const aspectMap: Record<string, string> = {
  '16/9': 'aspect-video',
  '4/3':  'aspect-[4/3]',
  '1/1':  'aspect-square',
}

export function VideoPublic({ url = '', aspectRatio = '16/9', caption = '', showCaption = false }: VideoProps) {
  const embedUrl = getEmbedUrl(url)

  if (!embedUrl) {
    return null
  }

  return (
    <figure className="w-full">
      <div className={`w-full ${aspectMap[aspectRatio] ?? 'aspect-video'} overflow-hidden rounded-lg`}>
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={caption || 'Video'}
        />
      </div>
      {showCaption && caption && (
        <figcaption className="text-center text-sm text-slate-500 mt-2">{caption}</figcaption>
      )}
    </figure>
  )
}
