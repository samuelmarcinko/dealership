'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle } from 'lucide-react'

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    // Phase 1: simulate submission (no email sending yet)
    await new Promise((r) => setTimeout(r, 800))
    setSubmitted(true)
    setLoading(false)
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Meno a priezvisko</Label>
          <Input id="name" name="name" placeholder="Ján Novák" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefón</Label>
          <Input id="phone" name="phone" type="tel" placeholder="+421 900 000 000" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="jan.novak@email.sk" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Predmet</Label>
        <Input id="subject" name="subject" placeholder="Mám záujem o vozidlo..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Správa</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Napíšte nám vašu správu..."
          rows={5}
          required
        />
      </div>

      <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" size="lg" disabled={loading}>
        {loading ? 'Odosielam...' : 'Odoslať správu'}
      </Button>
    </form>
  )
}
