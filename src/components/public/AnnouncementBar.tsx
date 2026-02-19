'use client'

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface Props {
  text: string
  url?: string
  bgColor?: string
}

function hashText(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

export default function AnnouncementBar({ text, url, bgColor }: Props) {
  const [dismissed, setDismissed] = useState(true)

  const storageKey = `banner_v_${hashText(text)}`

  useEffect(() => {
    const val = localStorage.getItem(storageKey)
    if (val !== 'dismissed') setDismissed(false)
  }, [storageKey])

  function dismiss() {
    localStorage.setItem(storageKey, 'dismissed')
    setDismissed(true)
  }

  if (dismissed) return null

  const bg = bgColor ?? 'bg-primary'

  return (
    <div
      className={`${bg} text-white relative flex items-center justify-center px-10`}
      style={{ minHeight: 36 }}
    >
      <div className="text-sm font-medium text-center py-2">
        {url ? (
          <a href={url} className="underline underline-offset-2 hover:opacity-80 transition-opacity">
            {text}
          </a>
        ) : (
          <span>{text}</span>
        )}
      </div>
      <button
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
        aria-label="Zavrieť"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
