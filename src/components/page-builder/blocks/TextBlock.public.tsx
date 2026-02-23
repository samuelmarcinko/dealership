import React from 'react'
import type { TextBlockProps } from '../types'

export function TextBlockPublic({ content = '' }: TextBlockProps) {
  return (
    <div
      className="prose prose-slate max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
