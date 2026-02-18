import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import VehicleForm from '@/components/admin/VehicleForm'

export const metadata: Metadata = { title: 'Nové vozidlo' }

export default function NewVehiclePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/vehicles" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-orange-600 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Späť na zoznam
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Pridať vozidlo</h1>
      </div>
      <VehicleForm />
    </div>
  )
}
