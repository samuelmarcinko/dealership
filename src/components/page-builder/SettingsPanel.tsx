'use client'

import React from 'react'
import { useEditor } from '@craftjs/core'
import { Trash2 } from 'lucide-react'

export function SettingsPanel() {
  const { actions, selected, settings } = useEditor((state, query) => {
    const selectedId = [...state.events.selected][0]
    if (!selectedId) return { selected: null, settings: null }
    const node = state.nodes[selectedId]
    if (!node) return { selected: null, settings: null }
    return {
      selected: {
        id: selectedId,
        name: node.data.displayName ?? node.data.name,
        isDeletable: query.node(selectedId).isDeletable(),
      },
      settings: node.related?.settings ?? null,
    }
  })

  return (
    <aside className="w-72 bg-white border-l border-slate-200 flex flex-col overflow-hidden flex-shrink-0">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {selected ? `Nastavenia: ${selected.name}` : 'Nastavenia bloku'}
        </h2>
        {selected?.isDeletable && (
          <button
            type="button"
            title="Vymazať blok (Del)"
            onClick={() => actions.delete(selected.id)}
            className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {settings && selected ? (
          React.createElement(settings)
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 gap-2 py-12">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500">Vyberte blok</p>
            <p className="text-xs">Kliknite na blok v canvase pre zobrazenie nastavení</p>
          </div>
        )}
      </div>
    </aside>
  )
}
