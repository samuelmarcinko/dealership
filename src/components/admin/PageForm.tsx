'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import RichTextEditor from '@/components/admin/RichTextEditor'
import { Save, Loader2 } from 'lucide-react'
import { slugify } from '@/lib/utils'

interface PageData {
  id?: string
  slug: string
  title: string
  content: string
  isPublished: boolean
  showInNav: boolean
  navOrder: number
}

interface Props {
  initialData?: PageData
}

export default function PageForm({ initialData }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false)
  const [showInNav, setShowInNav] = useState(initialData?.showInNav ?? false)
  const [navOrder, setNavOrder] = useState(initialData?.navOrder ?? 0)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialData?.id)

  // Auto-generate slug from title (only when creating new)
  useEffect(() => {
    if (!slugManuallyEdited && title) {
      setSlug(slugify(title))
    }
  }, [title, slugManuallyEdited])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const payload = { slug, title, content, isPublished, showInNav, navOrder }

    try {
      let res: Response
      if (initialData?.id) {
        res = await fetch(`/api/pages/${initialData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const json = await res.json()
      if (!res.ok) {
        toast('error', json.error ?? 'Nastala chyba')
        return
      }

      toast('success', initialData?.id ? 'Stránka uložená' : 'Stránka vytvorená')
      router.push('/admin/pages')
      router.refresh()
    } catch {
      toast('error', 'Nastala chyba')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {/* Content */}
      <div className="space-y-2">
        <Label>Obsah stránky</Label>
        <RichTextEditor value={content} onChange={setContent} />
      </div>

      {/* Options */}
      <div className="border rounded-lg p-4 space-y-4">
        <p className="text-sm font-medium text-slate-900">Možnosti</p>

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
          <div className="space-y-2">
            <Label htmlFor="navOrder">Poradie v navigácii</Label>
            <Input
              id="navOrder"
              type="number"
              value={navOrder}
              onChange={(e) => setNavOrder(parseInt(e.target.value) || 0)}
              className="w-24"
              min={0}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {loading ? 'Ukladám…' : initialData?.id ? 'Uložiť zmeny' : 'Vytvoriť stránku'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/pages')}
          disabled={loading}
        >
          Zrušiť
        </Button>
      </div>
    </form>
  )
}
