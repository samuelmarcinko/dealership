'use client'

import React from 'react'
import { useNode } from '@craftjs/core'
import { SettingsSection, Field, RangeInput } from '../SettingsUI'
import type { SpacerProps } from '../types'

export function Spacer({ height = 40 }: SpacerProps) {
  const { connectors: { connect, drag } } = useNode()

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      className="w-full cursor-grab flex items-center justify-center border border-dashed border-slate-300 rounded bg-slate-50/50 select-none"
      style={{ height: `${height}px` }}
    >
      <span className="text-xs text-slate-400">{height}px medzera</span>
    </div>
  )
}

function SpacerSettings() {
  const { height, actions: { setProp } } = useNode((node) => ({
    height: node.data.props.height as number,
  }))

  return (
    <SettingsSection title="Výška">
      <Field label="Výška medzery">
        <RangeInput
          value={height ?? 40}
          onChange={(v) => setProp((p: SpacerProps) => { p.height = v })}
          min={8}
          max={400}
          step={4}
        />
      </Field>
    </SettingsSection>
  )
}

Spacer.craft = {
  displayName: 'Medzera',
  props: { height: 40 } satisfies SpacerProps,
  related: { settings: SpacerSettings },
}
