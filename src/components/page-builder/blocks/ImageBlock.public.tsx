import React from 'react'
import type { ImageBlockProps } from '../types'

export function ImageBlockPublic({ src = '', alt = '', objectFit = 'cover', height = 400 }: ImageBlockProps) {
  if (!src) return null
  return (
    <div className="w-full overflow-hidden rounded-lg" style={{ height }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full"
        style={{ objectFit }}
      />
    </div>
  )
}
