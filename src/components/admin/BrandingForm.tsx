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

export default function BrandingForm({ settings }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [logoUrl, setLogoUrl] = useState(settings['logo_url'] ?? '')
  const [logoUrlLight, setLogoUrlLight] = useState(settings['logo_url_light'] ?? '')
  const [logoWidth, setLogoWidth] = useState(Number(settings['logo_width'] ?? 120))
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoLightUploading, setLogoLightUploading] = useState(false)

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload/branding', { method: 'POST', body: fd })
      const json = await res.json()
      if (res.ok) setLogoUrl(json.url)
      else toast('error', json.error ?? 'Chyba nahrávania')
    } catch {
      toast('error', 'Chyba nahrávania')
    } finally {
      setLogoUploading(false)
      e.target.value = ''
    }
  }

  async function handleLogoLightUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoLightUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload/branding', { method: 'POST', body: fd })
      const json = await res.json()
      if (res.ok) setLogoUrlLight(json.url)
      else toast('error', json.error ?? 'Chyba nahrávania')
    } catch {
      toast('error', 'Chyba nahrávania')
    } finally {
      setLogoLightUploading(false)
      e.target.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const updates = [
      { key: 'business_name', value: fd.get('business_name') as string },
      { key: 'logo_url', value: logoUrl },
      { key: 'logo_url_light', value: logoUrlLight },
      { key: 'logo_width', value: String(logoWidth) },
      { key: 'contact_phone', value: fd.get('contact_phone') as string },
      { key: 'contact_email', value: fd.get('contact_email') as string },
      { key: 'contact_address', value: fd.get('contact_address') as string },
      { key: 'social_facebook', value: fd.get('social_facebook') as string },
      { key: 'social_instagram', value: fd.get('social_instagram') as string },
      { key: 'footer_tagline', value: fd.get('footer_tagline') as string },
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

      toast('success', 'Nastavenia uložené')
    } catch {
      toast('error', 'Nastala chyba')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="business_name">Názov firmy</Label>
        <Input
          id="business_name"
          name="business_name"
          defaultValue={settings['business_name'] ?? ''}
          placeholder="Demo Bazar s.r.o."
        />
        <p className="text-xs text-slate-500">Zobrazí sa v navigácii, päte a emailoch.</p>
      </div>

      <div className="space-y-2">
        <Label>Logo</Label>
        <div className="flex items-center gap-3 flex-wrap">
          {logoUrl && (
            <div className="relative h-12 w-32 rounded border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center p-1">
              <Image src={logoUrl} alt="Logo" fill className="object-contain p-1" sizes="128px" />
              <button
                type="button"
                onClick={() => setLogoUrl('')}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-3 py-2 rounded-md transition-colors">
            <Upload className="h-4 w-4" />
            {logoUploading ? 'Nahrávam…' : logoUrl ? 'Zmeniť logo' : 'Nahrať logo'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleLogoUpload}
              disabled={logoUploading}
            />
          </label>
        </div>
        <p className="text-xs text-slate-500">JPG, PNG, WebP alebo SVG. Prázdne = predvolená ikona.</p>
      </div>

      <div className="space-y-2">
        <Label>Logo pre tmavý režim <span className="text-slate-400 font-normal">(voliteľné)</span></Label>
        <div className="flex items-center gap-3 flex-wrap">
          {logoUrlLight && (
            <div className="relative h-12 w-32 rounded border border-slate-200 bg-slate-800 overflow-hidden flex items-center justify-center p-1">
              <Image src={logoUrlLight} alt="Logo (dark mode)" fill className="object-contain p-1" sizes="128px" />
              <button
                type="button"
                onClick={() => setLogoUrlLight('')}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-3 py-2 rounded-md transition-colors">
            <Upload className="h-4 w-4" />
            {logoLightUploading ? 'Nahrávam…' : logoUrlLight ? 'Zmeniť light logo' : 'Nahrať light logo'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleLogoLightUpload}
              disabled={logoLightUploading}
            />
          </label>
        </div>
        <p className="text-xs text-slate-500">Zobrazí sa v navigácii pri zapnutom tmavom režime. Zvyčajne svetlá/biela verzia loga.</p>
      </div>

      {logoUrl && (
        <div className="space-y-2">
          <Label>Šírka loga</Label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={60}
              max={300}
              step={4}
              value={logoWidth}
              onChange={(e) => setLogoWidth(Number(e.target.value))}
              className="flex-1 accent-orange-500"
            />
            <span className="w-14 text-sm font-medium text-slate-700 text-right tabular-nums">{logoWidth} px</span>
          </div>
          <div className="rounded border border-slate-200 bg-slate-50 px-4 py-3 flex items-center">
            <div className="relative h-10 overflow-hidden" style={{ width: logoWidth }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt="Logo náhľad" className="h-full w-full object-contain object-left" />
            </div>
          </div>
          <p className="text-xs text-slate-500">Šírka loga v navigácii. Výška je fixná (40 px), logo sa škáluje proporcionálne.</p>
        </div>
      )}

      <div className="border-t pt-5">
        <h3 className="font-medium text-slate-900 mb-4">Kontaktné informácie</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contact_phone">Telefón</Label>
            <Input
              id="contact_phone"
              name="contact_phone"
              type="tel"
              defaultValue={settings['contact_phone'] ?? ''}
              placeholder="+421 900 000 000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_email">Email</Label>
            <Input
              id="contact_email"
              name="contact_email"
              type="email"
              defaultValue={settings['contact_email'] ?? ''}
              placeholder="info@autobazar.sk"
            />
          </div>
        </div>
        <div className="space-y-2 mt-4">
          <Label htmlFor="contact_address">Adresa</Label>
          <Textarea
            id="contact_address"
            name="contact_address"
            rows={2}
            defaultValue={settings['contact_address'] ?? ''}
            placeholder="Hlavná 1&#10;010 01 Žilina"
          />
        </div>
      </div>

      <div className="border-t pt-5">
        <h3 className="font-medium text-slate-900 mb-4">Sociálne siete</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="social_facebook">Facebook URL</Label>
            <Input
              id="social_facebook"
              name="social_facebook"
              type="url"
              defaultValue={settings['social_facebook'] ?? ''}
              placeholder="https://facebook.com/autobazar"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="social_instagram">Instagram URL</Label>
            <Input
              id="social_instagram"
              name="social_instagram"
              type="url"
              defaultValue={settings['social_instagram'] ?? ''}
              placeholder="https://instagram.com/autobazar"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-5">
        <h3 className="font-medium text-slate-900 mb-4">Päta stránky</h3>
        <div className="space-y-2">
          <Label htmlFor="footer_tagline">Tagline v päte</Label>
          <Textarea
            id="footer_tagline"
            name="footer_tagline"
            rows={2}
            defaultValue={settings['footer_tagline'] ?? ''}
            placeholder="Váš spoľahlivý partner pri kúpe ojazdených vozidiel. Férové ceny, overené vozidlá, profesionálny prístup."
          />
          <p className="text-xs text-slate-500">Krátky text zobrazený v päte pod názvom firmy.</p>
        </div>
      </div>

      <Button
        type="submit"
        className="bg-orange-500 hover:bg-orange-600 text-white"
        disabled={loading}
      >
        <Save className="h-4 w-4 mr-2" />
        {loading ? 'Ukladám…' : 'Uložiť nastavenia'}
      </Button>
    </form>
  )
}
