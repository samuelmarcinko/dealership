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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)

    const updates = [
      { key: 'banner_enabled', value: enabled ? 'true' : 'false' },
      { key: 'banner_text', value: fd.get('banner_text') as string },
      { key: 'banner_url', value: fd.get('banner_url') as string },
      { key: 'banner_bg_color', value: fd.get('banner_bg_color') as string },
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
      toast('success', 'Banner uložený')
    } catch {
      toast('error', 'Nastala chyba')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Toggle */}
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
        <Label className="cursor-pointer" onClick={() => setEnabled(!enabled)}>
          {enabled ? 'Banner zapnutý' : 'Banner vypnutý'}
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="banner_text">Text bannera</Label>
        <Input
          id="banner_text"
          name="banner_text"
          defaultValue={settings['banner_text'] ?? ''}
          placeholder="🔥 Špeciálna akcia — zľava 10 % na všetky vozidlá tento víkend!"
          disabled={!enabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="banner_url">Odkaz (voliteľný)</Label>
        <Input
          id="banner_url"
          name="banner_url"
          type="url"
          defaultValue={settings['banner_url'] ?? ''}
          placeholder="https://..."
          disabled={!enabled}
        />
        <p className="text-xs text-slate-400">Ak je vyplnené, text bannera bude klikateľný.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="banner_bg_color">CSS trieda pozadia</Label>
        <Input
          id="banner_bg_color"
          name="banner_bg_color"
          defaultValue={settings['banner_bg_color'] ?? 'bg-primary'}
          placeholder="bg-primary"
          disabled={!enabled}
        />
        <p className="text-xs text-slate-400">
          Tailwind trieda, napr. <code>bg-primary</code>, <code>bg-slate-900</code>, <code>bg-green-600</code>.
        </p>
      </div>

      <Button
        type="submit"
        className="bg-orange-500 hover:bg-orange-600 text-white"
        disabled={loading}
      >
        <Save className="h-4 w-4 mr-2" />
        {loading ? 'Ukladám…' : 'Uložiť banner'}
      </Button>
    </form>
  )
}
