import React from 'react'
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

export function TestimonialPublic({
  quote = 'Skvelá skúsenosť! Veľmi odporúčam.',
  authorName = 'Ján Novák',
  authorTitle = '',
  authorImage = '',
  rating = 5,
  style = 'card',
  bgColor = '',
  textColor = '',
}: TestimonialProps) {
  if (style === 'minimal') {
    return (
      <div className="space-y-3" style={{ color: textColor || undefined }}>
        <Stars count={rating ?? 5} />
        <blockquote className="text-slate-700 italic text-base leading-relaxed">"{quote}"</blockquote>
        <div className="flex items-center gap-3">
          {authorImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={authorImage} alt={authorName} className="h-9 w-9 rounded-full object-cover" />
          )}
          <div>
            <p className="font-semibold text-slate-900 text-sm">{authorName}</p>
            {authorTitle && <p className="text-slate-500 text-xs">{authorTitle}</p>}
          </div>
        </div>
      </div>
    )
  }

  if (style === 'quote') {
    return (
      <div className="relative pl-8" style={{ color: textColor || undefined }}>
        <span className="absolute left-0 top-0 text-6xl text-orange-300 font-serif leading-none">"</span>
        <Stars count={rating ?? 5} />
        <blockquote className="text-slate-700 text-lg italic leading-relaxed my-3">"{quote}"</blockquote>
        <p className="font-semibold text-slate-900">{authorName}</p>
        {authorTitle && <p className="text-slate-500 text-sm">{authorTitle}</p>}
      </div>
    )
  }

  // card (default)
  return (
    <div
      className="rounded-xl border border-slate-200 p-6 space-y-4"
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
