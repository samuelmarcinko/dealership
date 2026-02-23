'use client'

import React from 'react'
import { useNode } from '@craftjs/core'

interface ColumnCanvasProps {
  children?: React.ReactNode
}

export function ColumnCanvas({ children }: ColumnCanvasProps) {
  const {
    connectors: { connect },
    isSelected,
  } = useNode((node) => ({ isSelected: node.events.selected }))

  return (
    <div
      ref={(ref) => { if (ref) connect(ref) }}
      className={`min-h-[80px] flex flex-col gap-2 rounded transition-all ${
        isSelected
          ? 'outline outline-2 outline-blue-400 outline-offset-1'
          : 'outline outline-1 outline-dashed outline-slate-300'
      }`}
    >
      {children}
      {!children && (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm py-4">
          Sem presuňte blok
        </div>
      )}
    </div>
  )
}

ColumnCanvas.craft = {
  displayName: 'Stĺpec',
  rules: {
    canMoveIn: () => true,
  },
}
