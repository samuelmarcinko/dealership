import React from 'react'
import type { HeroBlockProps } from '../types'

export function HeroBlockPublic({
  title = 'Nadpis sekcie',
  subtitle = '',
  bgColor = '#1e293b',
  bgImage = '',
  ctaText = '',
  ctaHref = '#',
  textColor = '#ffffff',
}: HeroBlockProps) {
  const backgroundStyle: React.CSSProperties = bgImage
    ? { background: `url(${bgImage}) center/cover no-repeat, ${bgColor}`, color: textColor }
    : { backgroundColor: bgColor, color: textColor }

  return (
    <section className="py-20" style={backgroundStyle}>
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
        {subtitle && (
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">{subtitle}</p>
        )}
        {ctaText && (
          <a
            href={ctaHref}
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-md font-medium transition-colors"
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  )
}
