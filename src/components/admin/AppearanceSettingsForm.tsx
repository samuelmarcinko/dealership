'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { Save, Check, Sun, Moon } from 'lucide-react'

const FONT_PRESETS = [
  { key: 'default', label: 'Geist', sample: 'system-ui, sans-serif' },
  { key: 'inter', label: 'Inter', sample: '"Inter", sans-serif' },
  { key: 'montserrat', label: 'Montserrat', sample: '"Montserrat", sans-serif' },
  { key: 'poppins', label: 'Poppins', sample: '"Poppins", sans-serif' },
  { key: 'raleway', label: 'Raleway', sample: '"Raleway", sans-serif' },
  { key: 'playfair', label: 'Playfair', sample: '"Playfair Display", serif' },
]

const NAVBAR_STYLES = [
  {
    key: 'dark',
    label: 'Tmavý',
    desc: 'Tmavé pozadie, biele texty',
    preview: 'bg-slate-900 text-white',
  },
  {
    key: 'light',
    label: 'Svetlý',
    desc: 'Biele pozadie, tmavé texty',
    preview: 'bg-white text-slate-900 border border-slate-200',
  },
  {
    key: 'colored',
    label: 'Farebný',
    desc: 'Primárna farba, biele texty',
    preview: 'bg-primary text-white',
  },
]

interface Props {
  settings: Record<string, string>
}

export default function AppearanceSettingsForm({ settings }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fontPreset, setFontPreset] = useState(settings['font_preset'] ?? 'default')
  const [navbarStyle, setNavbarStyle] = useState(settings['navbar_style'] ?? 'dark')
  const [primaryColor, setPrimaryColor] = useState(settings['primary_color'] ?? '#f97316')
  const [customCss, setCustomCss] = useState(settings['custom_css'] ?? '')
  const [defaultTheme, setDefaultTheme] = useState(settings['default_theme'] ?? 'light')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: [
            { key: 'font_preset', value: fontPreset },
            { key: 'navbar_style', value: navbarStyle },
            { key: 'primary_color', value: primaryColor },
            { key: 'custom_css', value: customCss },
            { key: 'default_theme', value: defaultTheme },
          ],
        }),
      })
      if (!res.ok) {
        const json = await res.json()
        toast('error', json.error ?? 'Nastala chyba')
        return
      }
      toast('success', 'Vzhľad uložený')
    } catch {
      toast('error', 'Nastala chyba')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Colors and CSS */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-slate-900">Farby a CSS</p>
        <div className="space-y-2">
          <Label htmlFor="primary_color">Primárna farba</Label>
          <div className="flex items-center gap-3">
            <input
              id="primary_color"
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-10 w-16 cursor-pointer rounded border border-slate-300 p-0.5"
            />
            <span className="text-xs text-slate-500">Farba tlačidiel a akcentov na verejnom webe</span>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="custom_css">Custom CSS</Label>
          <Textarea
            id="custom_css"
            value={customCss}
            onChange={(e) => setCustomCss(e.target.value)}
            rows={4}
            placeholder=".navbar { background: #1a1a2e; }&#10;.footer { background: #0d0d1a; }"
            className="font-mono text-sm"
          />
          <p className="text-xs text-slate-500">CSS sa aplikuje na verejný web. Používajte opatrne.</p>
        </div>
      </div>

      {/* Font */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-900">Font webu</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {FONT_PRESETS.map((fp) => (
            <button
              key={fp.key}
              type="button"
              onClick={() => setFontPreset(fp.key)}
              className={`relative p-3 rounded-lg border-2 text-left transition-colors ${
                fontPreset === fp.key
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {fontPreset === fp.key && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              <span
                className="block text-lg font-semibold text-slate-800 mb-0.5"
                style={{ fontFamily: fp.sample }}
              >
                Aa
              </span>
              <span className="block text-xs text-slate-500">{fp.label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400">Font sa aplikuje na celý verejný web.</p>
      </div>

      {/* Navbar style */}
      <div className="space-y-3 border-t pt-5">
        <p className="text-sm font-medium text-slate-900">Štýl navigácie</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {NAVBAR_STYLES.map((ns) => (
            <button
              key={ns.key}
              type="button"
              onClick={() => setNavbarStyle(ns.key)}
              className={`relative rounded-lg border-2 overflow-hidden text-left transition-colors ${
                navbarStyle === ns.key
                  ? 'border-orange-500'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Preview bar */}
              <div className={`${ns.preview} px-3 py-2 text-xs font-medium flex items-center gap-2`}>
                <span>Logo</span>
                <span className="opacity-70">Domov</span>
                <span className="opacity-70">Vozidlá</span>
              </div>
              <div className="p-3 bg-white">
                {navbarStyle === ns.key && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                <p className="text-sm font-medium text-slate-800">{ns.label}</p>
                <p className="text-xs text-slate-500">{ns.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Default theme */}
      <div className="space-y-3 border-t pt-5">
        <p className="text-sm font-medium text-slate-900">Predvolený režim webu</p>
        <p className="text-xs text-slate-500">Nastavenie platí pre nových návštevníkov. Ak si visitor zmení režim sám, bude sa pamätať jeho voľba.</p>
        <div className="flex gap-3">
          {([
            { key: 'light', label: 'Svetlý', Icon: Sun },
            { key: 'dark',  label: 'Tmavý',  Icon: Moon },
          ] as const).map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setDefaultTheme(key)}
              className={`relative flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                defaultTheme === key
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {defaultTheme === key && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-orange-500 rounded-full flex items-center justify-center">
                  <Check className="h-2 w-2 text-white" />
                </span>
              )}
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        className="bg-orange-500 hover:bg-orange-600 text-white"
        disabled={loading}
      >
        <Save className="h-4 w-4 mr-2" />
        {loading ? 'Ukladám…' : 'Uložiť vzhľad'}
      </Button>
    </form>
  )
}
