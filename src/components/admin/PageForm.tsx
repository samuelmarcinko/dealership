'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { Save, Loader2, ChevronDown, ChevronUp, PanelRight } from 'lucide-react'
import { slugify } from '@/lib/utils'
import type { PageData } from '@/components/page-builder/types'

// Dynamic import — SSR disabled (Craft.js requires browser APIs)
const PageBuilder = dynamic(
  () =>
    import('@/components/page-builder/Editor').then((m) => ({
      default: m.PageBuilder,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Načítavam editor…</p>
        </div>
      </div>
    ),
  }
)

interface Props {
  initialData?: Partial<PageData>
}

export default function PageForm({ initialData }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [metaSaving, setMetaSaving] = useState(false)
  const [metaOpen, setMetaOpen] = useState(!initialData?.id)

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false)
  const [showInNav, setShowInNav] = useState(initialData?.showInNav ?? false)
  const [navOrder, setNavOrder] = useState(initialData?.navOrder ?? 0)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialData?.id)

  useEffect(() => {
    if (!slugManuallyEdited && title) {
      setSlug(slugify(title))
    }
  }, [title, slugManuallyEdited])

  async function saveMeta() {
    if (!initialData?.id) return
    setMetaSaving(true)
    try {
      const res = await fetch(`/api/pages/${initialData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, title, isPublished, showInNav, navOrder }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast('error', json.error ?? 'Nastala chyba')
        return
      }
      toast('success', 'Metadata uložené')
      router.refresh()
    } catch {
      toast('error', 'Nastala chyba')
    } finally {
      setMetaSaving(false)
    }
  }

  // For new pages, we still need to create the page first, then redirect to the edit page
  // The PageBuilder handles save for existing pages
  async function createPage() {
    setMetaSaving(true)
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          title,
          content: '',
          isPublished,
          showInNav,
          navOrder,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast('error', json.error ?? 'Nastala chyba')
        return
      }
      toast('success', 'Stránka vytvorená')
      // API returns { data: page } — hard redirect avoids router.push + refresh race condition
      window.location.assign(`/admin/pages/${json.data?.id}`)
    } catch {
      toast('error', 'Nastala chyba')
    } finally {
      setMetaSaving(false)
    }
  }

  const pageData: PageData = {
    id: initialData?.id,
    slug,
    title,
    content: initialData?.content ?? '',
    isPublished,
    showInNav,
    navOrder,
  }

  // -------------------------------------------------------------------------
  // New page: show just the meta form, create page on submit, then redirect
  // -------------------------------------------------------------------------
  if (!initialData?.id) {
    return (
      <form
        onSubmit={(e) => { e.preventDefault(); createPage() }}
        className="space-y-6"
      >
        <MetaFields
          title={title}
          setTitle={setTitle}
          slug={slug}
          setSlug={setSlug}
          setSlugManuallyEdited={setSlugManuallyEdited}
          isPublished={isPublished}
          setIsPublished={setIsPublished}
          showInNav={showInNav}
          setShowInNav={setShowInNav}
          navOrder={navOrder}
          setNavOrder={setNavOrder}
        />
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white"
            disabled={metaSaving}
          >
            {metaSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {metaSaving ? 'Vytváram…' : 'Vytvoriť stránku'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/pages')}
            disabled={metaSaving}
          >
            Zrušiť
          </Button>
        </div>
      </form>
    )
  }

  // -------------------------------------------------------------------------
  // Existing page: collapsible meta bar + full-height page builder
  // -------------------------------------------------------------------------
  return (
    <div className="flex flex-col h-full">
      {/* Collapsible metadata bar */}
      <div className="bg-white border-b border-slate-200 flex-shrink-0">
        <button
          type="button"
          onClick={() => setMetaOpen((o) => !o)}
          className="w-full flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <PanelRight className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">
              Metadata stránky
              {title && <span className="text-slate-400 font-normal ml-2">— {title}</span>}
            </span>
          </div>
          {metaOpen ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </button>

        {metaOpen && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 space-y-4">
            <MetaFields
              title={title}
              setTitle={setTitle}
              slug={slug}
              setSlug={setSlug}
              setSlugManuallyEdited={setSlugManuallyEdited}
              isPublished={isPublished}
              setIsPublished={setIsPublished}
              showInNav={showInNav}
              setShowInNav={setShowInNav}
              navOrder={navOrder}
              setNavOrder={setNavOrder}
            />
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={saveMeta}
                disabled={metaSaving}
              >
                {metaSaving ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                )}
                Uložiť metadata
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => router.push('/admin/pages')}
              >
                Späť na zoznam
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Page builder — fills remaining height */}
      <div className="flex-1 overflow-hidden">
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center bg-slate-100 h-full">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          }
        >
          <PageBuilder initialData={pageData} />
        </Suspense>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Shared meta fields
// ---------------------------------------------------------------------------
interface MetaFieldsProps {
  title: string
  setTitle: (v: string) => void
  slug: string
  setSlug: (v: string) => void
  setSlugManuallyEdited: (v: boolean) => void
  isPublished: boolean
  setIsPublished: (v: boolean) => void
  showInNav: boolean
  setShowInNav: (v: boolean) => void
  navOrder: number
  setNavOrder: (v: number) => void
}

function MetaFields({
  title,
  setTitle,
  slug,
  setSlug,
  setSlugManuallyEdited,
  isPublished,
  setIsPublished,
  showInNav,
  setShowInNav,
  navOrder,
  setNavOrder,
}: MetaFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="title">Názov stránky</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Financovanie"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL)</Label>
          <div className="flex items-center">
            <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-300 rounded-l-md text-sm text-slate-500">
              /
            </span>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value)
                setSlugManuallyEdited(true)
              }}
              placeholder="financovanie"
              required
              className="rounded-l-none"
            />
          </div>
          <p className="text-xs text-slate-400">Iba malé písmená, číslice a pomlčky.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={isPublished}
            onClick={() => setIsPublished(!isPublished)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isPublished ? 'bg-orange-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                isPublished ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-sm text-slate-700">Zverejniť stránku</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={showInNav}
            onClick={() => setShowInNav(!showInNav)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showInNav ? 'bg-orange-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                showInNav ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-sm text-slate-700">Zobraziť v navigácii</span>
        </div>

        {showInNav && (
          <div className="flex items-center gap-2">
            <Label htmlFor="navOrder" className="text-sm">
              Poradie:
            </Label>
            <Input
              id="navOrder"
              type="number"
              value={navOrder}
              onChange={(e) => setNavOrder(parseInt(e.target.value) || 0)}
              className="w-20"
              min={0}
            />
          </div>
        )}
      </div>
    </div>
  )
}
