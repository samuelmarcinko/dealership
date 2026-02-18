'use client'

import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function DeleteUserButton({ userId }: { userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Naozaj chcete odstrániť tohto používateľa?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      } else {
        const json = await res.json()
        alert(json.error ?? 'Nepodarilo sa odstrániť používateľa')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
