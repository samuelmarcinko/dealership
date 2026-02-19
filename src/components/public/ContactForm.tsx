'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name') as string,
      email: fd.get('email') as string,
      phone: fd.get('phone') as string || undefined,
      subject: fd.get('subject') as string || undefined,
      message: fd.get('message') as string,
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Nastala chyba. Skúste znova.')
        return
      }

      setSubmitted(true)
    } catch {
      setError('Nastala chyba. Skúste znova.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Správa odoslaná!</h3>
        <p className="text-slate-500">
          Ďakujeme za správu. Ozveme sa vám čo najskôr.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Meno a priezvisko *</Label>
          <Input id="name" name="name" placeholder="Ján Novák" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefón</Label>
          <Input id="phone" name="phone" type="tel" placeholder="+421 900 000 000" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" name="email" type="email" placeholder="jan.novak@email.sk" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Predmet</Label>
        <Input id="subject" name="subject" placeholder="Mám záujem o vozidlo..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Správa *</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Napíšte nám vašu správu..."
          rows={5}
          required
          minLength={5}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        size="lg"
        disabled={loading}
      >
        {loading ? 'Odosielam…' : 'Odoslať správu'}
      </Button>
    </form>
  )
}
