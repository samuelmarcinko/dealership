'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { Save } from 'lucide-react'

interface Props {
  settings: Record<string, string>
}

export default function ContactSettingsForm({ settings }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)

    const updates = [
      { key: 'contact_hero_title', value: fd.get('contact_hero_title') as string },
      { key: 'contact_hero_subtitle', value: fd.get('contact_hero_subtitle') as string },
      { key: 'contact_hours', value: fd.get('contact_hours') as string },
      { key: 'contact_map_url', value: fd.get('contact_map_url') as string },
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
      toast('success', 'Stránka „Kontakt" uložená')
    } catch {
      toast('error', 'Nastala chyba')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="contact_hero_title">Nadpis hero sekcie</Label>
        <Input
          id="contact_hero_title"
          name="contact_hero_title"
          defaultValue={settings['contact_hero_title'] ?? ''}
          placeholder="Kontakt"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact_hero_subtitle">Podnadpis hero sekcie</Label>
        <Textarea
          id="contact_hero_subtitle"
          name="contact_hero_subtitle"
          rows={2}
          defaultValue={settings['contact_hero_subtitle'] ?? ''}
          placeholder="Máte otázku? Sme tu pre vás."
        />
      </div>
      <div className="space-y-2 border-t pt-5">
        <Label htmlFor="contact_hours">Otváracie hodiny</Label>
        <Textarea
          id="contact_hours"
          name="contact_hours"
          rows={3}
          defaultValue={settings['contact_hours'] ?? ''}
          placeholder="Po–Pia: 9:00–17:00&#10;So: 9:00–13:00"
        />
        <p className="text-xs text-slate-400">Každý riadok = nový riadok textu.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact_map_url">Google Maps embed URL</Label>
        <Input
          id="contact_map_url"
          name="contact_map_url"
          type="url"
          defaultValue={settings['contact_map_url'] ?? ''}
          placeholder="https://www.google.com/maps/embed?pb=..."
        />
        <p className="text-xs text-slate-400">
          Z Google Maps: Zdieľať → Vložiť mapu → skopírovať URL zo src="..." atribútu.
        </p>
      </div>

      <Button
        type="submit"
        className="bg-orange-500 hover:bg-orange-600 text-white"
        disabled={loading}
      >
        <Save className="h-4 w-4 mr-2" />
        {loading ? 'Ukladám…' : 'Uložiť'}
      </Button>
    </form>
  )
}
