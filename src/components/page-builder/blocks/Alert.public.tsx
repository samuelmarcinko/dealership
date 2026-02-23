import React from 'react'
import type { AlertProps } from '../types'

const config = {
  info:    { bg: 'bg-blue-50',   border: 'border-blue-300',   text: 'text-blue-800',   icon: 'ℹ' },
  success: { bg: 'bg-green-50',  border: 'border-green-300',  text: 'text-green-800',  icon: '✓' },
  warning: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-800', icon: '⚠' },
  error:   { bg: 'bg-red-50',    border: 'border-red-300',    text: 'text-red-800',    icon: '✕' },
}

export function AlertPublic({ type = 'info', title = '', message = '', showIcon = true }: AlertProps) {
  const c = config[type] ?? config.info
  return (
    <div className={`flex gap-3 p-4 rounded-lg border ${c.bg} ${c.border}`}>
      {showIcon && (
        <span className={`flex-shrink-0 text-lg font-bold ${c.text}`}>{c.icon}</span>
      )}
      <div>
        {title && <p className={`font-semibold mb-0.5 ${c.text}`}>{title}</p>}
        {message && <p className={`text-sm ${c.text} opacity-90`}>{message}</p>}
      </div>
    </div>
  )
}
