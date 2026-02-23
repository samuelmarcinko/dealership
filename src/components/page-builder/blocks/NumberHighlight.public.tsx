import React from 'react'
import type { NumberHighlightProps } from '../types'

const alignMap: Record<string, string> = { left: 'text-left', center: 'text-center', right: 'text-right' }

export function NumberHighlightPublic({
  number = '500+',
  label = 'spokojných zákazníkov',
  prefix = '',
  suffix = '',
  color = '#f97316',
  align = 'center',
  numberSize = 'text-5xl',
}: NumberHighlightProps) {
  return (
    <div className={`py-4 ${alignMap[align] ?? 'text-center'}`}>
      <div className={`${numberSize ?? 'text-5xl'} font-extrabold leading-none`} style={{ color: color || '#f97316' }}>
        {prefix}{number}{suffix}
      </div>
      {label && <p className="text-slate-600 mt-2 text-base">{label}</p>}
    </div>
  )
}
