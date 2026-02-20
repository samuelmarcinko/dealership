'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import type { VehicleImage } from '@prisma/client'

interface Props {
  images: VehicleImage[]
  title: string
}

export default function VehicleGallery({ images, title }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const prev = () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  const next = () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1))

  const prevLightbox = useCallback(() => setLightboxIndex((i) => (i === 0 ? images.length - 1 : i - 1)), [images.length])
  const nextLightbox = useCallback(() => setLightboxIndex((i) => (i === images.length - 1 ? 0 : i + 1)), [images.length])

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

  if (images.length === 0) {
    return (
      <div className="aspect-[16/9] bg-slate-200 rounded-xl flex items-center justify-center">
        <span className="text-slate-400 text-sm">Žiadne fotografie</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className="relative aspect-[16/9] bg-slate-100 rounded-xl overflow-hidden cursor-zoom-in group"
        onClick={() => openLightbox(activeIndex)}
      >
        <Image
          src={images[activeIndex].url}
          alt={`${title} – foto ${activeIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-80 transition-opacity drop-shadow" />
        </div>
        {images.length > 1 && (
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
              {activeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`relative shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                i === activeIndex ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={img.url} alt={`Thumbnail ${i + 1}`} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox — rendered in a portal-like pattern, z-[200] above navbar */}
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
              {lightboxIndex + 1} / {images.length}
            </span>
            <button
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Image area — fills remaining space */}
          <div className="flex-1 flex items-center justify-center relative min-h-0 px-12 sm:px-16">
            <div
              className="relative w-full h-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[lightboxIndex].url}
                alt={`${title} – foto ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                quality={90}
              />
            </div>

            {images.length > 1 && (
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
          {images.length > 1 && (
            <div
              className="shrink-0 py-3 px-4 flex gap-2 overflow-x-auto justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setLightboxIndex(i)}
                  className={`relative shrink-0 w-14 h-10 sm:w-16 sm:h-11 rounded overflow-hidden border-2 transition-all ${
                    i === lightboxIndex ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  <Image src={img.url} alt={`thumb ${i + 1}`} fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
