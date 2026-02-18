import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import VehicleForm from '@/components/admin/VehicleForm'

export const metadata: Metadata = { title: 'Upraviť vozidlo' }

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: 'asc' } } },
  })

  if (!vehicle) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/vehicles" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-orange-600 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Späť na zoznam
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Upraviť vozidlo</h1>
        <p className="text-slate-500 text-sm mt-1">{vehicle.title}</p>
      </div>
      <VehicleForm vehicle={vehicle} />
    </div>
  )
}
