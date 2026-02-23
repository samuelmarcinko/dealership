'use client'

import React from 'react'
import { useEditor } from '@craftjs/core'
import { Undo2, Redo2, Eye, EyeOff, Save, Loader2 } from 'lucide-react'

interface BuilderToolbarProps {
  pageTitle: string
  onSave: () => Promise<void>
  saving: boolean
  previewMode: boolean
  onTogglePreview: () => void
}

export function BuilderToolbar({
  pageTitle,
  onSave,
  saving,
  previewMode,
  onTogglePreview,
}: BuilderToolbarProps) {
  const { actions, query, canUndo, canRedo } = useEditor((_, q) => ({
    canUndo: q.history.canUndo(),
    canRedo: q.history.canRedo(),
  }))

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3 flex-shrink-0 z-10">
      {/* Left: undo / redo */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => actions.history.undo()}
          disabled={!canUndo}
          title="Späť (Ctrl+Z)"
          className="p-2 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Undo2 className="h-4 w-4 text-slate-600" />
        </button>
        <button
          type="button"
          onClick={() => actions.history.redo()}
          disabled={!canRedo}
          title="Dopredu (Ctrl+Y)"
          className="p-2 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Redo2 className="h-4 w-4 text-slate-600" />
        </button>
      </div>

      <div className="w-px h-6 bg-slate-200" />

      {/* Center: page title */}
      <span className="text-sm font-medium text-slate-700 flex-1 truncate">{pageTitle}</span>

      {/* Right: preview + save */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onTogglePreview}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            previewMode
              ? 'bg-slate-900 text-white'
              : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          {previewMode ? (
            <>
              <EyeOff className="h-4 w-4" />
              Editovať
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Náhľad
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white transition-colors disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? 'Ukladám…' : 'Uložiť'}
        </button>
      </div>
    </header>
  )
}
