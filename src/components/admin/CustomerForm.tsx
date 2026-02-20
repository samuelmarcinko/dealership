'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { Save, Loader2, User, Building2 } from 'lucide-react'

interface CustomerData {
  id?: string
  type: 'PERSON' | 'COMPANY'
  firstName?: string | null
  lastName?: string | null
  companyName?: string | null
  ico?: string | null
  dic?: string | null
  icDph?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  note?: string | null
}

interface Props {
  initialData?: CustomerData
}

export default function CustomerForm({ initialData }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<'PERSON' | 'COMPANY'>(initialData?.type ?? 'PERSON')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)

    const payload: Record<string, string> = { type }
    for (const [key, val] of fd.entries()) {
      payload[key] = val as string
    }

    try {
      const url = initialData?.id ? `/api/customers/${initialData.id}` : '/api/customers'
      const method = initialData?.id ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) {
        toast('error', json.error ?? 'Nastala chyba')
        return
      }
      toast('success', initialData?.id ? 'Zákazník uložený' : 'Zákazník vytvorený')
      router.push('/admin/customers')
      router.refresh()
    } catch {
      toast('error', 'Nastala chyba')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type toggle */}
      <div className="space-y-2">
        <Label>Typ zákazníka</Label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setType('PERSON')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
              type === 'PERSON'
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <User className="h-4 w-4" />
            Fyzická osoba
          </button>
          <button
            type="button"
            onClick={() => setType('COMPANY')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
              type === 'COMPANY'
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <Building2 className="h-4 w-4" />
            Firma / Živnostník
          </button>
        </div>
      </div>

      {/* Person fields */}
      {type === 'PERSON' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Meno</Label>
            <Input
              id="firstName"
              name="firstName"
              defaultValue={initialData?.firstName ?? ''}
              placeholder="Ján"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Priezvisko</Label>
            <Input
              id="lastName"
              name="lastName"
              defaultValue={initialData?.lastName ?? ''}
              placeholder="Novák"
            />
          </div>
        </div>
      )}

      {/* Company fields */}
      {type === 'COMPANY' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Názov firmy</Label>
            <Input
              id="companyName"
              name="companyName"
              defaultValue={initialData?.companyName ?? ''}
              placeholder="Novák Transport s.r.o."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ico">IČO</Label>
              <Input
                id="ico"
                name="ico"
                defaultValue={initialData?.ico ?? ''}
                placeholder="12345678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dic">DIČ</Label>
              <Input
                id="dic"
                name="dic"
                defaultValue={initialData?.dic ?? ''}
                placeholder="2023456789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icDph">IČ DPH</Label>
              <Input
                id="icDph"
                name="icDph"
                defaultValue={initialData?.icDph ?? ''}
                placeholder="SK2023456789"
              />
            </div>
          </div>
        </div>
      )}

      {/* Common contact fields */}
      <div className="border-t pt-5 space-y-4">
        <p className="text-sm font-medium text-slate-700">Kontaktné údaje</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefón</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={initialData?.phone ?? ''}
              placeholder="+421 900 000 000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={initialData?.email ?? ''}
              placeholder="jan.novak@email.sk"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Adresa</Label>
          <Textarea
            id="address"
            name="address"
            rows={2}
            defaultValue={initialData?.address ?? ''}
            placeholder="Hlavná 1, 010 01 Žilina"
          />
        </div>
      </div>

      {/* Note */}
      <div className="space-y-2">
        <Label htmlFor="note">Interná poznámka</Label>
        <Textarea
          id="note"
          name="note"
          rows={3}
          defaultValue={initialData?.note ?? ''}
          placeholder="Poznámky o zákazníkovi (interné, nevidí zákazník)…"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white"
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {loading ? 'Ukladám…' : initialData?.id ? 'Uložiť zmeny' : 'Vytvoriť zákazníka'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Zrušiť
        </Button>
      </div>
    </form>
  )
}
