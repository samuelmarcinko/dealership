'use client'

import React from 'react'
import { useEditor, Element } from '@craftjs/core'
import {
  LayoutIcon,
  Type,
  Image,
  MousePointer,
  Star,
  Minus,
  Columns,
} from 'lucide-react'
import { Section } from './blocks/Section'
import { ColumnCanvas } from './blocks/ColumnCanvas'
import { TextBlock } from './blocks/TextBlock'
import { ImageBlock } from './blocks/ImageBlock'
import { ButtonBlock } from './blocks/ButtonBlock'
import { HeroBlock } from './blocks/HeroBlock'
import { IconBox } from './blocks/IconBox'
import { Divider } from './blocks/Divider'

interface BlockEntry {
  label: string
  icon: React.ReactNode
  create: () => React.ReactElement
}

export function BlocksPanel() {
  const { connectors } = useEditor()

  const blocks: BlockEntry[] = [
    {
      label: 'Sekcia',
      icon: <Columns className="h-5 w-5" />,
      // Section is NOT a canvas itself — ColumnCanvas children inside it are the drop targets
      create: () => (
        <Element is={Section} columns={1} gap="md" padding="md" bgColor="" />
      ),
    },
    {
      label: 'Text',
      icon: <Type className="h-5 w-5" />,
      create: () => <TextBlock content="<p>Váš text…</p>" />,
    },
    {
      label: 'Obrázok',
      icon: <Image className="h-5 w-5" />,
      create: () => <ImageBlock src="" alt="" objectFit="cover" height={300} />,
    },
    {
      label: 'Tlačidlo',
      icon: <MousePointer className="h-5 w-5" />,
      create: () => <ButtonBlock text="Kliknite sem" href="#" variant="primary" size="md" align="left" />,
    },
    {
      label: 'Hero',
      icon: <LayoutIcon className="h-5 w-5" />,
      create: () => (
        <HeroBlock
          title="Nadpis sekcie"
          subtitle=""
          bgColor="#1e293b"
          bgImage=""
          ctaText=""
          ctaHref="#"
          textColor="#ffffff"
        />
      ),
    },
    {
      label: 'Icon Box',
      icon: <Star className="h-5 w-5" />,
      create: () => (
        <IconBox
          icon="Star"
          title="Názov"
          description="Popis funkcie alebo služby."
          align="center"
        />
      ),
    },
    {
      label: 'Divider',
      icon: <Minus className="h-5 w-5" />,
      create: () => <Divider spacing="md" color="#e2e8f0" />,
    },
  ]

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col overflow-hidden flex-shrink-0">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bloky</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-2">
          {blocks.map(({ label, icon, create }) => (
            <div
              key={label}
              ref={(ref) => {
                if (ref) connectors.create(ref, create())
              }}
              className="flex flex-col items-center gap-2 p-3 rounded-lg border border-slate-200 bg-white hover:border-orange-400 hover:bg-orange-50 cursor-grab select-none transition-colors"
            >
              <span className="text-slate-500">{icon}</span>
              <span className="text-xs font-medium text-slate-700">{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500 leading-relaxed">
            Presuňte bloky do canvasu. Kliknite na blok v canvase pre úpravu nastavení.
          </p>
        </div>
      </div>
    </aside>
  )
}

// Re-export ColumnCanvas so it's available for resolver
export { ColumnCanvas }
