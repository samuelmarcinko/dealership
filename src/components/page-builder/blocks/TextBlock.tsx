'use client'

import React from 'react'
import { useNode } from '@craftjs/core'
import RichTextEditor from '@/components/admin/RichTextEditor'
import type { TextBlockProps } from '../types'

export function TextBlock({ content = '<p>Váš text…</p>' }: TextBlockProps) {
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      className="w-full cursor-grab prose prose-slate max-w-none p-2"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

function TextBlockSettings() {
  const {
    id,
    content,
    actions: { setProp },
  } = useNode((node) => ({
    content: node.data.props.content as string,
  }))

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Obsah</label>
      <RichTextEditor
        key={id}
        value={content ?? ''}
        onChange={(html) => setProp((p: TextBlockProps) => { p.content = html })}
      />
    </div>
  )
}

TextBlock.craft = {
  displayName: 'Text',
  props: {
    content: '<p>Váš text…</p>',
  } satisfies TextBlockProps,
  related: {
    settings: TextBlockSettings,
  },
}
