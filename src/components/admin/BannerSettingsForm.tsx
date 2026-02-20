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

export default function BannerSettingsForm({ settings }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [enabled, setEnabled] = useState(settings['banner_enabled'] === 'true')
  const [text, setText] = useState(settings['banner_text'] ?? '')
  const [url, setUrl] = useState(settings['banner_url'] ?? '')
  const [bgColor, setBgColor] = useState(settings['banner_bg_color'] ?? 'bg-primary')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: [
            { key: 'banner_enabled', value: enabled ? 'true' : 'false' },
            { key: 'banner_text', value: text },
            { key: 'banner_url', value: url },
            { key: 'banner_bg_color', value: bgColor },
          ],
        }),
      })
      if (!res.ok) {
        const json = await res.json()
        toast('error', json.error ?? 'Nastala chyba')
        return
      }
      toast('success', 'Banner uložený')
    } catch {
      toast('error', 'Nastala chyba')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            enabled ? 'bg-orange-500' : 'bg-slate-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <Label className="cursor-pointer select-none" onClick={() => setEnabled(!enabled)}>
          {enabled ? 'Banner zapnutý' : 'Banner vypnutý'}
        </Label>
      </div>

      <div className={`space-y-4 transition-opacity ${!enabled ? 'opacity-50' : ''}`}>
        <div className="space-y-2">
          <Label htmlFor="banner_text">Text bannera</Label>
          <Input
            id="banner_text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="🔥 Špeciálna akcia — zľava 10 % na všetky vozidlá tento víkend!"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="banner_url">Odkaz (voliteľný)</Label>
          <Input
            id="banner_url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
          />
          <p className="text-xs text-slate-400">Ak je vyplnené, text bannera bude klikateľný.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="banner_bg_color">CSS trieda pozadia</Label>
          <Input
            id="banner_bg_color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            placeholder="bg-primary"
          />
          <p className="text-xs text-slate-400">
            Napr. <code>bg-primary</code>, <code>bg-slate-900</code>, <code>bg-green-600</code>.
          </p>
        </div>
      </div>

      <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white" disabled={loading}>
        <Save className="h-4 w-4 mr-2" />
        {loading ? 'Ukladám…' : 'Uložiť banner'}
      </Button>
    </form>
  )
}
