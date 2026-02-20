'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { Trash2 } from 'lucide-react'

interface Props {
  id: string
  name: string
}

export default function DeleteCustomerButton({ id, name }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleDelete() {
    if (!confirm(`Naozaj vymazať zákazníka „${name}"?\nTáto akcia sa nedá vrátiť.`)) return
    setLoading(true)
    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json()
        toast('error', json.error ?? 'Nastala chyba')
        return
      }
      toast('success', 'Zákazník vymazaný')
      router.refresh()
    } catch {
      toast('error', 'Nastala chyba')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
