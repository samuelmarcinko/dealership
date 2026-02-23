import React from 'react'
import type { ButtonBlockProps } from '../types'

const alignMap: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

const sizeMap: Record<string, string> = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-6 py-2 text-base',
  lg: 'px-8 py-3 text-lg',
}

const variantMap: Record<string, string> = {
  primary: 'bg-orange-500 hover:bg-orange-600 text-white',
  outline: 'border-2 border-orange-500 text-orange-500 hover:bg-orange-50',
}

export function ButtonBlockPublic({
  text = 'Kliknite sem',
  href = '#',
  variant = 'primary',
  size = 'md',
  align = 'left',
}: ButtonBlockProps) {
  return (
    <div className={alignMap[align] ?? 'text-left'}>
      <a
        href={href}
        className={`inline-block rounded-md font-medium transition-colors ${sizeMap[size] ?? sizeMap.md} ${variantMap[variant] ?? variantMap.primary}`}
      >
        {text}
      </a>
    </div>
  )
}
