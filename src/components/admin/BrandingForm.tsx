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

export default function BrandingForm({ settings }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const updates = [
      { key: 'business_name', value: fd.get('business_name') as string },
      { key: 'logo_url', value: fd.get('logo_url') as string },
      { key: 'contact_phone', value: fd.get('contact_phone') as string },
      { key: 'contact_email', value: fd.get('contact_email') as string },
      { key: 'contact_address', value: fd.get('contact_address') as string },
      { key: 'social_facebook', value: fd.get('social_facebook') as string },
      { key: 'social_instagram', value: fd.get('social_instagram') as string },
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
        <Label htmlFor="logo_url">URL loga</Label>
        <Input
          id="logo_url"
          name="logo_url"
          type="url"
          defaultValue={settings['logo_url'] ?? ''}
          placeholder="https://example.com/logo.png"
        />
        <p className="text-xs text-slate-500">
          Externá URL loga (JPG/PNG/SVG). Odporúčané rozmery: 200×50 px. Nechajte prázdne pre predvolené logo.
        </p>
      </div>

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
