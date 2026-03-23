import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Handshake, Save } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import VehicleForm from '@/components/admin/VehicleForm'
import SellVehicleButton from '@/components/admin/SellVehicleButton'
import PrintLabelButton from '@/components/admin/PrintLabelButton'

export const metadata: Metadata = { title: 'Upraviť vozidlo' }

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [vehicle, topMakesRaw, equipmentItems] = await Promise.all([
    prisma.vehicle.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        buyer: true,
        consignor: true,
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

        <div className="flex items-center gap-2">
          <PrintLabelButton vehicleId={vehicle.id} />
          <Button
            type="submit"
            form="vehicle-form"
            className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
          >
            <Save className="h-4 w-4" />
            Uložiť zmeny
          </Button>
          {vehicle.status !== 'SOLD' && (
            <SellVehicleButton
              vehicleId={vehicle.id}
              vehicleTitle={vehicle.title}
              listedPrice={Number(vehicle.price)}
              salePrice={vehicle.salePrice != null ? Number(vehicle.salePrice) : null}
              isConsignment={vehicle.isConsignment}
              vehicleCommissionRate={vehicle.commissionRate != null ? Number(vehicle.commissionRate) : null}
            />
          )}
          {vehicle.status === 'SOLD' && vehicle.buyer && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">
              ✓ Predané — {vehicle.buyer.companyName ?? `${vehicle.buyer.firstName ?? ''} ${vehicle.buyer.lastName ?? ''}`.trim()}
            </span>
          )}
        </div>
      </div>

      {/* Consignor infobox */}
      {vehicle.isConsignment && vehicle.consignor && (
        <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-xl text-sm">
          <Handshake className="h-4 w-4 text-purple-600 shrink-0" />
          <span className="font-medium text-purple-800">Komisný predaj</span>
          <span className="text-purple-600">·</span>
          <Link
            href={`/admin/customers/${vehicle.consignor.id}`}
            className="text-purple-700 hover:underline font-medium"
          >
            {vehicle.consignor.companyName ?? `${vehicle.consignor.firstName ?? ''} ${vehicle.consignor.lastName ?? ''}`.trim()}
          </Link>
          {vehicle.commissionRate != null && (
            <span className="ml-auto text-purple-700 font-medium">{Number(vehicle.commissionRate)} %</span>
          )}
        </div>
      )}

      <VehicleForm vehicle={vehicle} topMakes={topMakes} equipmentItems={equipmentItems} />
    </div>
  )
}
