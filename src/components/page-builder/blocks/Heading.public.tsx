import React from 'react'
import type { HeadingProps } from '../types'

const alignMap: Record<string, string> = { left: 'text-left', center: 'text-center', right: 'text-right' }

export function HeadingPublic({
  text = 'Nadpis',
  tag = 'h2',
  fontSize = 'text-3xl',
  fontWeight = 'font-bold',
  align = 'left',
  color = '',
  italic = false,
  uppercase = false,
  paddingTop = 0,
  paddingBottom = 0,
}: HeadingProps) {
  const Tag = (tag ?? 'h2') as React.ElementType
  const classes = [
    fontSize,
    fontWeight,
    alignMap[align] ?? 'text-left',
    italic ? 'italic' : '',
    uppercase ? 'uppercase tracking-wide' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag
      className={classes}
      style={{
        color: color || undefined,
        paddingTop: paddingTop ? `${paddingTop}px` : undefined,
        paddingBottom: paddingBottom ? `${paddingBottom}px` : undefined,
      }}
    >
      {text}
    </Tag>
  )
}
