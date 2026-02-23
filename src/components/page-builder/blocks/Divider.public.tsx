import React from 'react'
import type { DividerProps } from '../types'

const spacingMap: Record<string, string> = { sm: 'py-4', md: 'py-8', lg: 'py-16' }

export function DividerPublic({ spacing = 'md', color = '#e2e8f0' }: DividerProps) {
  return (
    <div className={spacingMap[spacing] ?? 'py-8'}>
      <hr style={{ borderColor: color }} className="border-t" />
    </div>
  )
}
