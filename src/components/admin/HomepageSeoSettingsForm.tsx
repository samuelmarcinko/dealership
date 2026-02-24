'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { Save } from 'lucide-react'

interface Props {
  settings: Record<string, string>
}

export default function HomepageSeoSettingsForm({ settings }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [seoTitle, setSeoTitle] = useState(settings['homepage_seo_title'] ?? '')
  const [seoDescription, setSeoDescription] = useState(settings['homepage_seo_description'] ?? '')
  const [ogImage, setOgImage] = useState(settings['homepage_seo_og_image'] ?? '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: [
            { key: 'homepage_seo_title', value: seoTitle },
            { key: 'homepage_seo_description', value: seoDescription },
            { key: 'homepage_seo_og_image', value: ogImage },
          ],
        }),
      })
      if (!res.ok) {
        const json = await res.json()
        toast('error', json.error ?? 'Nastala chyba')
        return
      }
      toast('success', 'SEO nastavenia domovskej stránky uložené')
    } catch {
      toast('error', 'Nastala chyba')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="hp_seo_title">
          SEO nadpis
          <span className="text-slate-400 font-normal text-xs ml-1">(title tag pre Google)</span>
        </Label>
        <Input
          id="hp_seo_title"
          value={seoTitle}
          onChange={(e) => setSeoTitle(e.target.value)}
          placeholder="Napr. Autobazar Bratislava — Kvalitné ojazdené vozidlá"
          maxLength={200}
        />
        <p className="text-xs text-slate-400">{seoTitle.length}/200 znakov. Ideálne 50–60 znakov.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="hp_seo_description">
          Meta popis
          <span className="text-slate-400 font-normal text-xs ml-1">(pre vyhľadávače a sociálne siete)</span>
        </Label>
        <textarea
          id="hp_seo_description"
          value={seoDescription}
          onChange={(e) => setSeoDescription(e.target.value)}
          placeholder="Krátky popis vašej stránky pre Google a sociálne siete (160 znakov)…"
          maxLength={500}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
        />
        <p className="text-xs text-slate-400">{seoDescription.length}/500 znakov. Ideálne 120–160 znakov.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="hp_og_image">
          OG obrázok (URL)
          <span className="text-slate-400 font-normal text-xs ml-1">(náhľad pri zdieľaní na sociálnych sieťach)</span>
        </Label>
        <Input
          id="hp_og_image"
          value={ogImage}
          onChange={(e) => setOgImage(e.target.value)}
          placeholder="https://…/og-image.jpg (odporúčaná veľkosť 1200×630 px)"
        />
        <p className="text-xs text-slate-400">Odporúčaná veľkosť: 1200 × 630 px, formát JPG alebo PNG.</p>
      </div>

      <Button
        type="submit"
        className="bg-orange-500 hover:bg-orange-600 text-white"
        disabled={loading}
      >
        <Save className="h-4 w-4 mr-2" />
        {loading ? 'Ukladám…' : 'Uložiť SEO nastavenia'}
      </Button>
    </form>
  )
}
