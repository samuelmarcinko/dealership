'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RotateCcw, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface Props {
  vehicleId: string
  vehicleTitle: string
}

export default function RestoreVehicleButton({ vehicleId, vehicleTitle }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  async function handleRestore() {
    if (!confirm(`Obnoviť vozidlo "${vehicleTitle}" späť do ponuky? Kupujúci bude odobratý.`)) return
    setLoading(true)
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/restore`, { method: 'POST' })
      if (!res.ok) {
        const json = await res.json()
        toast('error', json.error ?? 'Nastala chyba')
        return
      }
      toast('success', 'Vozidlo obnovené do ponuky')
      router.refresh()
    } catch {
      toast('error', 'Nastala chyba')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleRestore}
      disabled={loading}
      title="Obnoviť do ponuky"
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
    >
      {loading
        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
        : <RotateCcw className="h-3.5 w-3.5" />
      }
      Obnoviť
    </button>
  )
}
