'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import type { User } from '@prisma/client'

interface Props {
  user?: User
}

export default function UserForm({ user }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState(user?.role ?? 'ADMIN')

  const isEdit = !!user

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const data = new FormData(e.currentTarget)
    const body: Record<string, string> = {
      name: data.get('name') as string,
      email: data.get('email') as string,
      role,
    }
    const password = data.get('password') as string
    if (password) body.password = password

    try {
      const res = await fetch(isEdit ? `/api/users/${user.id}` : '/api/users', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const json = await res.json()
        toast('error', json.error ?? 'Nastala chyba')
        return
      }

      toast('success', isEdit ? 'Používateľ aktualizovaný' : 'Používateľ vytvorený')
      router.push('/admin/users')
      router.refresh()
    } catch {
      toast('error', 'Nastala chyba')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="name">Meno a priezvisko</Label>
        <Input
          id="name"
          name="name"
          defaultValue={user?.name}
          required
          placeholder="Ján Novák"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={user?.email}
          required
          placeholder="admin@dealership.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          {isEdit ? 'Nové heslo (nechajte prázdne pre zachovanie)' : 'Heslo'}
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required={!isEdit}
          placeholder="••••••••"
          minLength={6}
        />
      </div>

      <div className="space-y-2">
        <Label>Rola</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="EDITOR">Editor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white"
          disabled={loading}
        >
          {loading ? 'Ukladám...' : isEdit ? 'Aktualizovať' : 'Vytvoriť používateľa'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Zrušiť
        </Button>
      </div>
    </form>
  )
}
