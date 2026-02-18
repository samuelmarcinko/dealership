'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { Save } from 'lucide-react'

interface Props {
  xmlFeedUrl: string
  syncInterval: string
}

export default function ImportSettingsForm({ xmlFeedUrl, syncInterval }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [interval, setInterval] = useState(syncInterval)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const data = new FormData(e.currentTarget)
    const updates = [
      { key: 'xml_feed_url', value: data.get('xmlFeedUrl') as string },
      { key: 'sync_interval_minutes', value: interval },
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
        <Label htmlFor="xmlFeedUrl">URL adresa XML feedu</Label>
        <Input
          id="xmlFeedUrl"
          name="xmlFeedUrl"
          type="url"
          defaultValue={xmlFeedUrl}
          placeholder="https://www.autobazar.eu/export/feed.xml?dealer=12345"
        />
        <p className="text-xs text-slate-500">
          URL XML feedu z autobazar.eu alebo iného kompatibilného zdroja.
          Nechajte prázdne ak nechcete importovať.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Interval synchronizácie</Label>
        <Select value={interval} onValueChange={setInterval}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15">Každých 15 minút</SelectItem>
            <SelectItem value="30">Každých 30 minút</SelectItem>
            <SelectItem value="60">Každú hodinu</SelectItem>
            <SelectItem value="120">Každé 2 hodiny</SelectItem>
            <SelectItem value="360">Každých 6 hodín</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-slate-500">
          Fáza 2: Automatický sync bude implementovaný ako background worker.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white"
          disabled={loading}
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Ukladám...' : 'Uložiť nastavenia'}
        </Button>
      </div>
    </form>
  )
}
