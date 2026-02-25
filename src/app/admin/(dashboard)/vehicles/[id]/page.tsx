import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import VehicleForm from '@/components/admin/VehicleForm'
import SellVehicleButton from '@/components/admin/SellVehicleButton'

export const metadata: Metadata = { title: 'Upraviť vozidlo' }

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [vehicle, topMakesRaw, equipmentItems] = await Promise.all([
    prisma.vehicle.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        buyer: true,
      },
    }),
    prisma.vehicle.groupBy({
      by: ['make'],
      _count: { make: true },
      orderBy: { _count: { make: 'desc' } },
      take: 8,
    }),
    prisma.equipmentItem.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { subcategory: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    }),
  ])
  const topMakes = topMakesRaw.map((m) => m.make)

  if (!vehicle) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin/vehicles" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-orange-600 mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Späť na ponuku
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Upraviť vozidlo</h1>
          <p className="text-slate-500 text-sm mt-1">{vehicle.title}</p>
        </div>

        {vehicle.status !== 'SOLD' && (
          <SellVehicleButton
            vehicleId={vehicle.id}
            vehicleTitle={vehicle.title}
            listedPrice={Number(vehicle.price)}
          />
        )}

        {vehicle.status === 'SOLD' && vehicle.buyer && (
          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">
              ✓ Predané — {vehicle.buyer.companyName ?? `${vehicle.buyer.firstName ?? ''} ${vehicle.buyer.lastName ?? ''}`.trim()}
            </span>
          </div>
        )}
      </div>

      <VehicleForm vehicle={vehicle} topMakes={topMakes} equipmentItems={equipmentItems} />
    </div>
  )
}
