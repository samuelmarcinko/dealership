'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { Save, Upload, X } from 'lucide-react'

interface Props {
  settings: Record<string, string>
}

export default function HeroSettingsForm({ settings }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [bgImage, setBgImage] = useState(settings['hero_bg_image'] ?? '')
  const [bgUploading, setBgUploading] = useState(false)

  async function handleBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBgUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload/branding', { method: 'POST', body: fd })
      const json = await res.json()
      if (res.ok) setBgImage(json.url)
      else toast('error', json.error ?? 'Chyba nahrávania')
    } catch {
      toast('error', 'Chyba nahrávania')
    } finally {
      setBgUploading(false)
      e.target.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const updates = [
      { key: 'hero_bg_image', value: bgImage },
      { key: 'hero_badge', value: fd.get('hero_badge') as string },
      { key: 'hero_title', value: fd.get('hero_title') as string },
      { key: 'hero_title_accent', value: fd.get('hero_title_accent') as string },
      { key: 'hero_subtitle', value: fd.get('hero_subtitle') as string },
      { key: 'hero_btn1_text', value: fd.get('hero_btn1_text') as string },
      { key: 'hero_btn1_url', value: fd.get('hero_btn1_url') as string },
      { key: 'hero_btn2_text', value: fd.get('hero_btn2_text') as string },
      { key: 'hero_btn2_url', value: fd.get('hero_btn2_url') as string },
    ]

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: updates }),
      })

      if (!res.ok) {
        const json = await res.json()
        toast('error', json.error ?? 'Nastala chyba')
        return
      }

      toast('success', 'Hero sekcia uložená')
    } catch {
      toast('error', 'Nastala chyba')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Background image */}
      <div className="space-y-3">
        <Label>Obrázok pozadia</Label>
        {bgImage && (
          <div className="relative w-full aspect-[21/6] rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
            <Image src={bgImage} alt="Hero pozadie" fill className="object-cover" sizes="600px" />
            <button
              type="button"
              onClick={() => setBgImage('')}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-md transition-colors">
          <Upload className="h-4 w-4" />
          {bgUploading ? 'Nahrávam…' : bgImage ? 'Zmeniť obrázok' : 'Nahrať obrázok'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleBgUpload}
            disabled={bgUploading}
          />
        </label>
        <p className="text-xs text-slate-500">JPG/PNG/WebP, max 5 MB. Odporúčané rozmery: 1920×600 px.</p>
      </div>

      {/* Texts */}
      <div className="border-t pt-5 space-y-4">
        <h3 className="font-medium text-slate-900">Texty hero sekcie</h3>

        <div className="space-y-2">
          <Label htmlFor="hero_badge">Badge text (malý nápis nad nadpisom)</Label>
          <Input
            id="hero_badge"
            name="hero_badge"
            defaultValue={settings['hero_badge'] ?? 'Profesionálny autobazar'}
            placeholder="Profesionálny autobazar"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hero_title">Nadpis (1. riadok)</Label>
            <Input
              id="hero_title"
              name="hero_title"
              defaultValue={settings['hero_title'] ?? 'Nájdite vozidlo'}
              placeholder="Nájdite vozidlo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero_title_accent">Nadpis (2. riadok, zvýraznený)</Label>
            <Input
              id="hero_title_accent"
              name="hero_title_accent"
              defaultValue={settings['hero_title_accent'] ?? 'svojich snov'}
              placeholder="svojich snov"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hero_subtitle">Podnadpis</Label>
          <Textarea
            id="hero_subtitle"
            name="hero_subtitle"
            rows={2}
            defaultValue={settings['hero_subtitle'] ?? 'Ponúkame starostlivo vybrané ojazdené vozidlá za transparentné ceny. Každé auto prešlo technickou kontrolou a je pripravené na cestu.'}
            placeholder="Krátky popis..."
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="border-t pt-5 space-y-4">
        <h3 className="font-medium text-slate-900">Tlačidlá</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hero_btn1_text">Tlačidlo 1 — text</Label>
            <Input
              id="hero_btn1_text"
              name="hero_btn1_text"
              defaultValue={settings['hero_btn1_text'] ?? 'Prezerať vozidlá'}
              placeholder="Prezerať vozidlá"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero_btn1_url">Tlačidlo 1 — odkaz</Label>
            <Input
              id="hero_btn1_url"
              name="hero_btn1_url"
              defaultValue={settings['hero_btn1_url'] ?? '/vehicles'}
              placeholder="/vehicles"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hero_btn2_text">Tlačidlo 2 — text</Label>
            <Input
              id="hero_btn2_text"
              name="hero_btn2_text"
              defaultValue={settings['hero_btn2_text'] ?? 'Kontaktujte nás'}
              placeholder="Kontaktujte nás"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero_btn2_url">Tlačidlo 2 — odkaz</Label>
            <Input
              id="hero_btn2_url"
              name="hero_btn2_url"
              defaultValue={settings['hero_btn2_url'] ?? '/contact'}
              placeholder="/contact"
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="bg-orange-500 hover:bg-orange-600 text-white"
        disabled={loading}
      >
        <Save className="h-4 w-4 mr-2" />
        {loading ? 'Ukladám…' : 'Uložiť hero sekciu'}
      </Button>
    </form>
  )
}
