'use client'

import React from 'react'
import { useEditor, Element } from '@craftjs/core'
import {
  LayoutIcon, Type, Image, MousePointer, Star, Minus,
  Columns, CaseSensitive, Maximize2, AlertCircle, CreditCard,
  MessageSquare, Play, List, Hash,
} from 'lucide-react'
import { Section } from './blocks/Section'
import { ColumnCanvas } from './blocks/ColumnCanvas'
import { TextBlock } from './blocks/TextBlock'
import { ImageBlock } from './blocks/ImageBlock'
import { ButtonBlock } from './blocks/ButtonBlock'
import { HeroBlock } from './blocks/HeroBlock'
import { IconBox } from './blocks/IconBox'
import { Divider } from './blocks/Divider'
import { Heading } from './blocks/Heading'
import { Spacer } from './blocks/Spacer'
import { Alert } from './blocks/Alert'
import { Card } from './blocks/Card'
import { Testimonial } from './blocks/Testimonial'
import { Video } from './blocks/Video'
import { IconList } from './blocks/IconList'
import { NumberHighlight } from './blocks/NumberHighlight'

interface BlockEntry {
  label: string
  icon: React.ReactNode
  category: string
  create: () => React.ReactElement
}

const BLOCKS: BlockEntry[] = [
  // Layout
  {
    label: 'Sekcia',
    icon: <Columns className="h-5 w-5" />,
    category: 'Rozloženie',
    create: () => <Element is={Section} columns={1} gap="md" padding="md" bgColor="" />,
  },
  {
    label: 'Medzera',
    icon: <Maximize2 className="h-5 w-5" />,
    category: 'Rozloženie',
    create: () => <Spacer height={40} />,
  },
  // Typography
  {
    label: 'Nadpis',
    icon: <CaseSensitive className="h-5 w-5" />,
    category: 'Text',
    create: () => <Heading text="Nový nadpis" tag="h2" fontSize="text-3xl" fontWeight="font-bold" align="left" />,
  },
  {
    label: 'Text',
    icon: <Type className="h-5 w-5" />,
    category: 'Text',
    create: () => <TextBlock content="<p>Váš text…</p>" />,
  },
  // Media
  {
    label: 'Obrázok',
    icon: <Image className="h-5 w-5" />,
    category: 'Médiá',
    create: () => <ImageBlock src="" alt="" objectFit="cover" height={300} />,
  },
  {
    label: 'Video',
    icon: <Play className="h-5 w-5" />,
    category: 'Médiá',
    create: () => <Video url="" aspectRatio="16/9" />,
  },
  // Interactive
  {
    label: 'Tlačidlo',
    icon: <MousePointer className="h-5 w-5" />,
    category: 'Interaktívne',
    create: () => <ButtonBlock text="Kliknite sem" href="#" variant="primary" size="md" align="left" />,
  },
  // Content blocks
  {
    label: 'Hero',
    icon: <LayoutIcon className="h-5 w-5" />,
    category: 'Obsah',
    create: () => <HeroBlock title="Nadpis sekcie" subtitle="" bgColor="#1e293b" bgImage="" ctaText="" ctaHref="#" textColor="#ffffff" />,
  },
  {
    label: 'Karta',
    icon: <CreditCard className="h-5 w-5" />,
    category: 'Obsah',
    create: () => <Card mode="icon" icon="Star" title="Nadpis karty" text="Popis funkcie alebo služby." align="center" />,
  },
  {
    label: 'Icon Box',
    icon: <Star className="h-5 w-5" />,
    category: 'Obsah',
    create: () => <IconBox icon="Star" title="Názov" description="Popis funkcie alebo služby." align="center" />,
  },
  {
    label: 'Recenzia',
    icon: <MessageSquare className="h-5 w-5" />,
    category: 'Obsah',
    create: () => <Testimonial quote="Skvelá skúsenosť!" authorName="Ján Novák" rating={5} style="card" />,
  },
  {
    label: 'Číslo',
    icon: <Hash className="h-5 w-5" />,
    category: 'Obsah',
    create: () => <NumberHighlight number="500+" label="spokojných zákazníkov" color="#f97316" align="center" />,
  },
  {
    label: 'Zoznam',
    icon: <List className="h-5 w-5" />,
    category: 'Obsah',
    create: () => <IconList items={[{ icon: 'Check', text: 'Prvá výhoda' }, { icon: 'Check', text: 'Druhá výhoda' }]} />,
  },
  // Misc
  {
    label: 'Oznámenie',
    icon: <AlertCircle className="h-5 w-5" />,
    category: 'Ostatné',
    create: () => <Alert type="info" title="Nadpis" message="Text oznámenia…" showIcon />,
  },
  {
    label: 'Divider',
    icon: <Minus className="h-5 w-5" />,
    category: 'Ostatné',
    create: () => <Divider spacing="md" color="#e2e8f0" />,
  },
]

const CATEGORIES = ['Rozloženie', 'Text', 'Médiá', 'Interaktívne', 'Obsah', 'Ostatné']

export function BlocksPanel() {
  const { connectors } = useEditor()

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col overflow-hidden flex-shrink-0">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bloky</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {CATEGORIES.map((cat) => {
          const catBlocks = BLOCKS.filter((b) => b.category === cat)
          if (!catBlocks.length) return null
          return (
            <div key={cat}>
              <p className="px-3 pt-3 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {cat}
              </p>
              <div className="px-2 pb-2 grid grid-cols-2 gap-1.5">
                {catBlocks.map(({ label, icon, create }) => (
                  <div
                    key={label}
                    ref={(ref) => {
                      if (ref) connectors.create(ref, create())
                    }}
                    className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-lg border border-slate-200 bg-white hover:border-orange-400 hover:bg-orange-50 cursor-grab select-none transition-colors"
                  >
                    <span className="text-slate-500">{icon}</span>
                    <span className="text-xs font-medium text-slate-700 text-center leading-tight">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        <div className="m-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <p className="text-xs text-slate-400 leading-relaxed">
            Presuňte bloky do canvasu. Kliknite na blok pre úpravu nastavení.
          </p>
        </div>
      </div>
    </aside>
  )
}

export { ColumnCanvas }
