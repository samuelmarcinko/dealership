'use client'

import React, { useState, useCallback } from 'react'
import { Editor, Frame, Element, useEditor } from '@craftjs/core'
import { Section } from './blocks/Section'
import { ColumnCanvas } from './blocks/ColumnCanvas'
import { TextBlock } from './blocks/TextBlock'
import { ImageBlock } from './blocks/ImageBlock'
import { ButtonBlock } from './blocks/ButtonBlock'
import { HeroBlock } from './blocks/HeroBlock'
import { IconBox } from './blocks/IconBox'
import { Divider } from './blocks/Divider'
import { BlocksPanel } from './BlocksPanel'
import { SettingsPanel } from './SettingsPanel'
import { BuilderToolbar } from './BuilderToolbar'
import { isCraftJson, generateMigrationJson } from './types'
import type { PageData } from './types'
import { useToast } from '@/components/ui/toast'

// Root canvas container — wraps all top-level nodes
function RootContainer({ children }: { children?: React.ReactNode }) {
  return <div className="min-h-full w-full">{children}</div>
}
RootContainer.craft = { displayName: 'Root', isCanvas: true }

// ---------------------------------------------------------------------------
// Layout rendered inside <Editor> so it can use useEditor()
// ---------------------------------------------------------------------------
interface BuilderLayoutProps {
  pageData: PageData
  initialFrameData: string | undefined
}

function BuilderLayout({ pageData, initialFrameData }: BuilderLayoutProps) {
  const { toast } = useToast()
  const { actions, query } = useEditor()
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const handleTogglePreview = useCallback(() => {
    const next = !previewMode
    setPreviewMode(next)
    actions.setOptions((opts) => { opts.enabled = !next })
  }, [previewMode, actions])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const json = query.serialize()
      const res = await fetch(
        pageData.id ? `/api/pages/${pageData.id}` : '/api/pages',
        {
          method: pageData.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            pageData.id
              ? { content: json }
              : {
                  content: json,
                  slug: pageData.slug,
                  title: pageData.title,
                  isPublished: pageData.isPublished,
                  showInNav: pageData.showInNav,
                  navOrder: pageData.navOrder,
                }
          ),
        }
      )
      if (res.ok) {
        toast('success', 'Stránka uložená')
      } else {
        const body = await res.json()
        toast('error', body.error ?? 'Nastala chyba')
      }
    } catch {
      toast('error', 'Nastala chyba pri ukladaní')
    } finally {
      setSaving(false)
    }
  }, [query, pageData, toast])

  return (
    <div className="flex flex-col h-full">
      <BuilderToolbar
        pageTitle={pageData.title || 'Nová stránka'}
        onSave={handleSave}
        saving={saving}
        previewMode={previewMode}
        onTogglePreview={handleTogglePreview}
      />

      <div className="flex flex-1 overflow-hidden">
        {!previewMode && <BlocksPanel />}

        {/* Canvas area */}
        <main className="flex-1 bg-slate-100 overflow-y-auto">
          <div className="min-h-full py-8 px-4">
            <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
              <Frame data={initialFrameData}>
                <Element is={RootContainer} canvas>
                  <Section columns={1} gap="md" padding="md" bgColor="" />
                </Element>
              </Frame>
            </div>
          </div>
        </main>

        {!previewMode && <SettingsPanel />}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Legacy content migration banner
// ---------------------------------------------------------------------------
interface LegacyBannerProps {
  content: string
  onStartFresh: () => void
  onMigrate: () => void
}

function LegacyBanner({ content, onStartFresh, onMigrate }: LegacyBannerProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-8">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">Stará HTML stránka</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Táto stránka obsahuje obsah vo formáte HTML (starý editor). Vyberte, ako chcete pokračovať:
          </p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onMigrate}
            className="w-full flex flex-col items-start gap-1 p-4 rounded-lg border-2 border-orange-200 hover:border-orange-400 bg-orange-50 transition-colors text-left"
          >
            <span className="font-semibold text-slate-900">Zachovať ako Text Block</span>
            <span className="text-sm text-slate-600">
              Starý HTML obsah sa prenesie do textového bloku. Môžete ho ďalej upravovať.
            </span>
          </button>

          <button
            type="button"
            onClick={onStartFresh}
            className="w-full flex flex-col items-start gap-1 p-4 rounded-lg border-2 border-slate-200 hover:border-slate-400 transition-colors text-left"
          >
            <span className="font-semibold text-slate-900">Začať odznova</span>
            <span className="text-sm text-slate-600">
              Starý obsah sa zahodí a začnete s prázdnym canvasom.
            </span>
          </button>
        </div>

        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
          <p className="text-xs text-slate-500 font-medium mb-1">Existujúci obsah (náhľad):</p>
          <div
            className="text-xs text-slate-600 max-h-32 overflow-y-auto prose prose-xs max-w-none"
            dangerouslySetInnerHTML={{ __html: content.slice(0, 500) }}
          />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------
interface PageBuilderProps {
  initialData: PageData
}

export function PageBuilder({ initialData }: PageBuilderProps) {
  const hasLegacyContent =
    initialData.content.trim().length > 0 && !isCraftJson(initialData.content)

  const [frameData, setFrameData] = useState<string | undefined>(() =>
    isCraftJson(initialData.content) ? initialData.content : undefined
  )
  const [showLegacyBanner, setShowLegacyBanner] = useState(hasLegacyContent)

  if (showLegacyBanner) {
    return (
      <LegacyBanner
        content={initialData.content}
        onStartFresh={() => {
          setFrameData(undefined)
          setShowLegacyBanner(false)
        }}
        onMigrate={() => {
          setFrameData(generateMigrationJson(initialData.content))
          setShowLegacyBanner(false)
        }}
      />
    )
  }

  return (
    <Editor
      resolver={{
        RootContainer,
        Section,
        ColumnCanvas,
        TextBlock,
        ImageBlock,
        ButtonBlock,
        HeroBlock,
        IconBox,
        Divider,
      }}
    >
      <BuilderLayout pageData={initialData} initialFrameData={frameData} />
    </Editor>
  )
}
