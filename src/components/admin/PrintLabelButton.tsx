'use client'

import { Tag } from 'lucide-react'

export default function PrintLabelButton({ vehicleId }: { vehicleId: string }) {
  return (
    <button
      onClick={() => window.open(`/admin/vehicles/${vehicleId}/label`, '_blank')}
      className="inline-flex items-center gap-2 px-3 py-2 border border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-800 text-sm font-medium rounded-lg bg-white transition-colors"
    >
      <Tag className="h-4 w-4" />
      Štítok
    </button>
  )
}
