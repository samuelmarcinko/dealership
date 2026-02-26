'use client'

import React, { useState } from 'react'
import { ImageIcon, X } from 'lucide-react'
import MediaPickerModal from './MediaPickerModal'

interface Props {
  value: string
  onChange: (url: string) => void
}

export default function MediaPickerInput({ value, onChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div className="flex items-center gap-3 p-2 rounded-md border border-input bg-background min-h-[52px]">
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="OG obrázok"
              className="w-16 h-10 object-cover rounded border border-slate-200 flex-shrink-0"
            />
            <span className="flex-1 text-sm text-slate-600 truncate" title={value}>
              {value}
            </span>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="text-xs text-slate-500 hover:text-slate-700 font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors flex-shrink-0"
            >
              Zmeniť
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
              title="Odstrániť"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
              <ImageIcon className="h-5 w-5 text-slate-400" />
            </div>
            <span className="flex-1 text-sm text-slate-400">Žiadny obrázok</span>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="text-xs font-medium text-orange-600 hover:text-orange-700 px-3 py-1.5 rounded border border-orange-200 hover:bg-orange-50 transition-colors flex-shrink-0"
            >
              Vybrať obrázok
            </button>
          </>
        )}
      </div>

      <MediaPickerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={onChange}
      />
    </>
  )
}
