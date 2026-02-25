'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface Props {
  vehicleTitle: string
}

export default function InquiryModal({ vehicleTitle }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const data = new FormData(e.currentTarget)
    const body = {
      name: data.get('name') as string,
      email: data.get('email') as string,
      phone: (data.get('phone') as string) || undefined,
      subject: vehicleTitle,
      message: data.get('message') as string,
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Nastala chyba pri odosielaní')
        return
      }

      setSuccess(true)
    } catch {
      setError('Nastala chyba pri odosielaní. Skúste to znova.')
    } finally {
      setLoading(false)
    }
  }

  function handleOpenChange(val: boolean) {
    setOpen(val)
    if (!val) {
      setSuccess(false)
      setError(null)
    }
  }

  return (
    <>
      <Button
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        size="lg"
        onClick={() => setOpen(true)}
      >
        Mám záujem
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mám záujem o vozidlo</DialogTitle>
            <DialogDescription className="line-clamp-2">{vehicleTitle}</DialogDescription>
          </DialogHeader>

          {success ? (
            <div className="py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-semibold text-slate-900">Ďakujeme za váš záujem!</p>
              <p className="text-slate-500 text-sm mt-1">Ozveme sa vám čo najskôr.</p>
              <Button className="mt-4" variant="outline" onClick={() => handleOpenChange(false)}>
                Zatvoriť
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="inq-name">Meno a priezvisko *</Label>
                  <Input id="inq-name" name="name" required placeholder="Ján Novák" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inq-phone">Telefón</Label>
                  <Input id="inq-phone" name="phone" type="tel" placeholder="+421 900 000 000" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inq-email">E-mail *</Label>
                <Input id="inq-email" name="email" type="email" required placeholder="jan@example.sk" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inq-message">Správa *</Label>
                <Textarea
                  id="inq-message"
                  name="message"
                  rows={4}
                  required
                  defaultValue={`Dobrý deň,\n\nzaujalo ma vaše vozidlo ${vehicleTitle}. `}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Odosielam...' : 'Odoslať správu'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
