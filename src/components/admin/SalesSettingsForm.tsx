'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { CONSIGNMENT_ENABLED_KEY } from '@/lib/features'
import { Save, Info } from 'lucide-react'

interface Props {
  settings: Record<string, string>
}

export default function SalesSettingsForm({ settings }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [enabled, setEnabled] = useState(settings[CONSIGNMENT_ENABLED_KEY] !== 'false')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: [{ key: CONSIGNMENT_ENABLED_KEY, value: enabled ? 'true' : 'false' }],
        }),
      })
      if (!res.ok) {
        const json = await res.json()
        toast('error', json.error ?? 'Nastala chyba')
        return
      }
      toast('success', 'Nastavenie uložené')
      // Prepínač mení navigáciu aj formuláre naprieč adminom
      window.location.reload()
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
          {enabled ? 'Komisný predaj zapnutý' : 'Komisný predaj vypnutý'}
        </Label>
      </div>

      <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
        <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
        <div className="text-sm text-slate-600 space-y-2">
          {enabled ? (
            <>
              <p>
                Ponuka vozidiel je rozdelená na vlastné vozidlá a vozidlá prijaté do komisie.
                V admine pribúda sekcia <strong>Komisný predaj</strong> s komitentmi a províziami.
              </p>
              <p>
                Ak si delenie nechcete komplikovať, vypnite to — všetky vozidlá budú
                v jednej spoločnej ponuke.
              </p>
            </>
          ) : (
            <>
              <p>
                Všetky vozidlá sú v jednej ponuke. Sekcia <strong>Komisný predaj</strong> je
                skrytá, pri vozidle sa nenastavuje komitent ani provízia.
              </p>
              <p>
                Existujúce komisné vozidlá sa nezmazali — zostávajú v ponuke a po opätovnom
                zapnutí sa znova zobrazia aj s komitentmi.
              </p>
            </>
          )}
        </div>
      </div>

      <Button type="submit" disabled={loading} className="gap-2">
        <Save className="h-4 w-4" />
        {loading ? 'Ukladám…' : 'Uložiť'}
      </Button>
    </form>
  )
}
