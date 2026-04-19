'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, ZoomIn, Play } from 'lucide-react'
import type { VehicleImage } from '@prisma/client'

interface VideoItem {
  id: string
  url: string
  title?: string | null
}

interface Props {
  images: VehicleImage[]
  videos?: VideoItem[]
  title: string
}

type MediaItem =
  | { kind: 'image'; index: number; url: string }
  | { kind: 'video'; index: number; url: string; embedUrl: string; thumbUrl: string | null }

function getYoutubeThumbnail(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null
}

function getVideoEmbedUrl(url: string): string | null {
  const ym = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  if (ym) return `https://www.youtube.com/embed/${ym[1]}?autoplay=1`
  const vm = url.match(/vimeo\.com\/(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1`
  return null
}

export default function VehicleGallery({ images, videos = [], title }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Build unified media list: primary image first, then videos, then remaining images
  const validVideos = videos
    .map((v, i) => {
      const embedUrl = getVideoEmbedUrl(v.url)
      if (!embedUrl) return null
      return { kind: 'video' as const, index: i, url: v.url, embedUrl, thumbUrl: getYoutubeThumbnail(v.url) }
    })
    .filter(Boolean) as MediaItem[]

  const media: MediaItem[] = [
    ...(images.length > 0 ? [{ kind: 'image' as const, index: 0, url: images[0].url }] : []),
    ...validVideos,
    ...images.slice(1).map((img, i) => ({ kind: 'image' as const, index: i + 1, url: img.url })),
  ]

  const total = media.length

  const prev = () => setActiveIndex((i) => (i === 0 ? total - 1 : i - 1))
  const next = () => setActiveIndex((i) => (i === total - 1 ? 0 : i + 1))

  const prevLightbox = useCallback(() => setLightboxIndex((i) => (i === 0 ? total - 1 : i - 1)), [total])
  const nextLightbox = useCallback(() => setLightboxIndex((i) => (i === total - 1 ? 0 : i + 1)), [total])

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  useEffect(() => {
    if (!lightboxOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowLeft') prevLightbox()
      if (e.key === 'ArrowRight') nextLightbox()
    }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [lightboxOpen, prevLightbox, nextLightbox])

  if (total === 0) {
    return (
      <div className="aspect-[16/9] bg-slate-200 rounded-xl flex items-center justify-center">
        <span className="text-slate-400 text-sm">Žiadne fotografie</span>
      </div>
    )
  }

  const activeItem = media[activeIndex]

  return (
    <div className="space-y-3">
      {/* Main media */}
      <div
        className="relative aspect-[16/9] bg-slate-900 rounded-xl overflow-hidden cursor-pointer group"
        onClick={() => openLightbox(activeIndex)}
      >
        {activeItem.kind === 'image' ? (
          <>
            <Image
              src={activeItem.url}
              alt={`${title} – foto ${activeIndex + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 66vw"
              priority
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-80 transition-opacity drop-shadow" />
            </div>
          </>
        ) : (
          <>
            {activeItem.thumbUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activeItem.thumbUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-800" />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                <Play className="h-7 w-7 text-slate-900 ml-1" fill="currentColor" />
              </div>
            </div>
          </>
        )}
        {total > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded">
              {activeIndex + 1} / {total}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {total > 1 && (() => {
        const MAX = 7
        const hasMore = total > MAX
        const visible = hasMore ? media.slice(0, MAX) : media

        return (
          <div
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${visible.length}, minmax(0, 1fr))` }}
          >
            {visible.map((item, i) => {
              const isOverlaySlot = hasMore && i === MAX - 1
              const isActive = i === activeIndex

              return (
                <button
                  key={i}
                  onClick={() => {
                    setActiveIndex(i)
                    if (isOverlaySlot) openLightbox(i)
                  }}
                  className={[
                    'relative aspect-[4/3] rounded-lg overflow-hidden transition-all duration-150 bg-slate-900',
                    isActive
                      ? 'ring-2 ring-primary ring-offset-1 opacity-100'
                      : 'opacity-60 hover:opacity-90',
                  ].join(' ')}
                >
                  {item.kind === 'image' ? (
                    <Image
                      src={item.url}
                      alt={`Foto ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 13vw, 9vw"
                    />
                  ) : (
                    <>
                      {item.thumbUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.thumbUrl} alt={`Video ${i + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-800" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="h-4 w-4 text-white drop-shadow" fill="currentColor" />
                      </div>
                    </>
                  )}
                  {isOverlaySlot && (
                    <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                      <span className="text-white font-bold text-sm sm:text-base leading-none">
                        +{total - MAX + 1}
                      </span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )
      })()}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black flex flex-col !mt-0"
          style={{ margin: 0 }}
          onClick={() => setLightboxOpen(false)}
        >
          {/* Top bar */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-white/70 text-sm select-none">
              {lightboxIndex + 1} / {total}
            </span>
            <button
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Media area */}
          <div className="flex-1 flex items-center justify-center relative min-h-0 px-12 sm:px-16">
            <div
              className="relative w-full h-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              {media[lightboxIndex]?.kind === 'image' ? (
                <Image
                  src={media[lightboxIndex].url}
                  alt={`${title} – foto ${lightboxIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  quality={90}
                />
              ) : media[lightboxIndex]?.kind === 'video' ? (
                <iframe
                  src={(media[lightboxIndex] as { embedUrl: string }).embedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay; fullscreen"
                />
              ) : null}
            </div>

            {total > 1 && (
              <>
                <button
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
                  onClick={(e) => { e.stopPropagation(); prevLightbox() }}
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
                <button
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
                  onClick={(e) => { e.stopPropagation(); nextLightbox() }}
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {total > 1 && (
            <div
              className="shrink-0 py-3 px-4 flex gap-2 overflow-x-auto justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {media.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  className={`relative shrink-0 w-14 h-10 sm:w-16 sm:h-11 rounded overflow-hidden border-2 transition-all bg-slate-800 ${
                    i === lightboxIndex ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  {item.kind === 'image' ? (
                    <Image src={item.url} alt={`thumb ${i + 1}`} fill className="object-cover" sizes="64px" />
                  ) : (
                    <>
                      {item.thumbUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.thumbUrl} alt="" className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="h-3 w-3 text-white" fill="currentColor" />
                      </div>
                    </>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
