'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Car, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const data = new FormData(e.currentTarget)
    const body = {
      email: data.get('email') as string,
      password: data.get('password') as string,
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Nesprávne prihlasovacie údaje')
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setError('Nastala chyba. Skúste znova.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-500 rounded-2xl mb-4">
            <Car className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Auto<span className="text-orange-400">Bazar</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Administrácia</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Prihlásiť sa</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@dealership.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Heslo</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white mt-2"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Prihlasovanie...' : 'Prihlásiť sa'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
