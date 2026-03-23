'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { Save, Upload, X, Check } from 'lucide-react'

interface Props {
  settings: Record<string, string>
}

// ── Reusable option button group ──────────────────────────────────────────────
function OptionGroup<T extends string>({
  value, onChange, options,
}: {
  value: T
  onChange: (v: T) => void
  options: { key: T; label: string; desc?: string }[]
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={`relative px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors text-left ${
            value === o.key
              ? 'border-orange-500 bg-orange-50 text-orange-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
          }`}
        >
          {value === o.key && (
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-orange-500 rounded-full flex items-center justify-center">
              <Check className="h-2 w-2 text-white" />
            </span>
          )}
          <span className="block">{o.label}</span>
          {o.desc && <span className="block text-xs font-normal text-slate-400 mt-0.5">{o.desc}</span>}
        </button>
      ))}
    </div>
  )
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ value, onChange, label, desc }: {
  value: boolean
  onChange: (v: boolean) => void
  label: string
  desc?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${value ? 'bg-orange-500' : 'bg-slate-200'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t pt-5 space-y-4">
      <h3 className="font-medium text-slate-900">{title}</h3>
      {children}
    </div>
  )
}

export default function HeroSettingsForm({ settings }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // Background
  const [bgImage, setBgImage] = useState(settings['hero_bg_image'] ?? '')
  const [bgUploading, setBgUploading] = useState(false)
  const [bgOpacity, setBgOpacity] = useState(Number(settings['hero_bg_opacity'] ?? 30))
  const [bgPattern, setBgPattern] = useState(settings['hero_bg_pattern'] ?? 'grid')

  // Layout
  const [heroHeight, setHeroHeight] = useState(settings['hero_height'] ?? 'large')
  const [heroHeightCustom, setHeroHeightCustom] = useState(settings['hero_height_custom'] ?? '600')
  const [heroAlign, setHeroAlign] = useState(settings['hero_align'] ?? 'left')

  // Effects
  const [heroEffect, setHeroEffect] = useState(settings['hero_effect'] ?? 'none')
  const [overlayGradient, setOverlayGradient] = useState(settings['hero_overlay_gradient'] === 'true')
  const [bottomShape, setBottomShape] = useState(settings['hero_bottom_shape'] ?? 'none')
  const [textAnimation, setTextAnimation] = useState(settings['hero_text_animation'] ?? 'fadeup')

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
      // Styling
      { key: 'hero_height', value: heroHeight },
      { key: 'hero_height_custom', value: heroHeightCustom },
      { key: 'hero_align', value: heroAlign },
      { key: 'hero_bg_opacity', value: String(bgOpacity) },
      { key: 'hero_bg_pattern', value: bgPattern },
      { key: 'hero_overlay_gradient', value: overlayGradient ? 'true' : 'false' },
      { key: 'hero_bottom_shape', value: bottomShape },
      { key: 'hero_text_animation', value: textAnimation },
      { key: 'hero_effect', value: heroEffect },
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

      {/* ── Background image ── */}
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
        <p className="text-xs text-slate-500">JPG/PNG/WebP, max 5 MB. Odporúčané: 1920×600 px.</p>
      </div>

      {/* ── Styling ── */}
      <SettingSection title="Štýlovanie">

        {/* Height */}
        <div className="space-y-2">
          <Label>Výška sekcie</Label>
          <OptionGroup
            value={heroHeight as 'compact' | 'medium' | 'large' | 'fullscreen' | 'custom'}
            onChange={setHeroHeight}
            options={[
              { key: 'compact',    label: 'Kompaktná',      desc: '~280 px' },
              { key: 'medium',     label: 'Stredná',        desc: '~380 px' },
              { key: 'large',      label: 'Veľká',          desc: '~520 px' },
              { key: 'fullscreen', label: 'Celá obrazovka', desc: '100 vh' },
              { key: 'custom',     label: 'Vlastná',        desc: 'zadaj px' },
            ]}
          />
          {heroHeight === 'custom' && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                min={200}
                max={1400}
                step={10}
                value={heroHeightCustom}
                onChange={(e) => setHeroHeightCustom(e.target.value)}
                className="w-28 h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <span className="text-sm text-slate-500">px</span>
            </div>
          )}
        </div>

        {/* Align */}
        <div className="space-y-2">
          <Label>Zarovnanie obsahu</Label>
          <OptionGroup
            value={heroAlign as 'left' | 'center'}
            onChange={setHeroAlign}
            options={[
              { key: 'left',   label: 'Vľavo',   desc: 'Text zarovnaný doľava' },
              { key: 'center', label: 'Na stred', desc: 'Text a tlačidlá vycentrované' },
            ]}
          />
        </div>

        {/* BG pattern (only when no image) */}
        {!bgImage && (
          <div className="space-y-2">
            <Label>Vzor pozadia (bez obrázka)</Label>
            <OptionGroup
              value={bgPattern as 'grid' | 'dots' | 'diagonal' | 'none'}
              onChange={setBgPattern}
              options={[
                { key: 'grid',     label: 'Mriežka'   },
                { key: 'dots',     label: 'Bodky'     },
                { key: 'diagonal', label: 'Šrafovanie' },
                { key: 'none',     label: 'Žiadny'    },
              ]}
            />
          </div>
        )}

        {/* BG opacity (only when image) */}
        {bgImage && (
          <div className="space-y-2">
            <Label>Opacity obrázka pozadia</Label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={90}
                step={5}
                value={bgOpacity}
                onChange={(e) => setBgOpacity(Number(e.target.value))}
                className="flex-1 accent-orange-500"
              />
              <span className="w-14 text-sm font-medium text-slate-700 text-right tabular-nums">
                {bgOpacity === 0 ? 'Vypnuté' : `${bgOpacity}%`}
              </span>
            </div>
            <p className="text-xs text-slate-400">0 = obrázok neviditeľný (čisto tmavé pozadie). Nižšia hodnota = tmavší obrázok.</p>
          </div>
        )}

        {/* Overlay gradient toggle */}
        <Toggle
          value={overlayGradient}
          onChange={setOverlayGradient}
          label="Gradient overlay"
          desc="Tmavý prechod zdola nahor — zlepšuje čitateľnosť textu nad obrázkom"
        />

      </SettingSection>

      {/* ── Vizuálne efekty ── */}
      <SettingSection title="Vizuálny efekt">
        <OptionGroup
          value={heroEffect as 'none' | 'kenburns' | 'parallax' | 'particles' | 'shimmer' | 'pulseglow'}
          onChange={setHeroEffect}
          options={[
            { key: 'none',      label: 'Žiadny',      desc: 'Statické pozadie' },
            { key: 'kenburns',  label: 'Ken Burns',   desc: 'Pomalý zoom + posun obrázka' },
            { key: 'parallax',  label: 'Paralax',     desc: 'Pohyb pozadia pri scrolle' },
            { key: 'particles', label: 'Particles',   desc: 'Animované plávajúce bodky' },
            { key: 'shimmer',   label: 'Shimmer',     desc: 'Lesklý efekt svetelného prechodu' },
            { key: 'pulseglow', label: 'Pulse Glow',  desc: 'Pulzujúca žiara v primárnej farbe' },
          ]}
        />
        {(heroEffect === 'kenburns' || heroEffect === 'parallax') && !bgImage && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Ken Burns a Paralax vyžadujú nahratý obrázok pozadia.
          </p>
        )}
        {heroEffect === 'parallax' && (
          <p className="text-xs text-slate-400">Paralax efekt nemusí fungovať na mobilných zariadeniach (iOS obmedzenie).</p>
        )}
      </SettingSection>

      {/* ── Tvar spodku ── */}
      <SettingSection title="Tvar spodného okraja">
        <OptionGroup
          value={bottomShape as 'none' | 'wave' | 'diagonal' | 'arc'}
          onChange={setBottomShape}
          options={[
            { key: 'none',     label: 'Rovný',    desc: 'Štandardný okraj' },
            { key: 'wave',     label: 'Vlna',     desc: 'Plynulá vlna' },
            { key: 'diagonal', label: 'Šikmý rez', desc: 'Uhlopriečny prerez' },
            { key: 'arc',      label: 'Oblúk',    desc: 'Zaoblený spodok' },
          ]}
        />
        <p className="text-xs text-slate-400">Dekoratívny tvar na spodnom okraji hero sekcie.</p>
      </SettingSection>

      {/* ── Animácia textu ── */}
      <SettingSection title="Animácia textu">
        <OptionGroup
          value={textAnimation as 'fadeup' | 'slideup' | 'zoom' | 'fade'}
          onChange={setTextAnimation}
          options={[
            { key: 'fadeup',  label: 'Fade + posun',  desc: 'Jemné vyletenie zdola (predvolené)' },
            { key: 'slideup', label: 'Slide up',       desc: 'Výrazný posun zdola nahor' },
            { key: 'zoom',    label: 'Zoom in',        desc: 'Priblíženie z diaľky' },
            { key: 'fade',    label: 'Fade',           desc: 'Jednoduché zobrazenie' },
          ]}
        />
      </SettingSection>

      {/* ── Texts ── */}
      <SettingSection title="Texty hero sekcie">
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
      </SettingSection>

      {/* ── Buttons ── */}
      <SettingSection title="Tlačidlá">
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
      </SettingSection>

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
