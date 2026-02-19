import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Fuel, Gauge, Settings, Calendar, Zap, Palette, DoorOpen, Users, Activity } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import VehicleGallery from '@/components/public/VehicleGallery'
import {
  formatPrice,
  formatMileage,
  fuelTypeLabel,
  transmissionLabel,
  bodyTypeLabel,
  vehicleStatusLabel,
} from '@/lib/utils'

async function getVehicle(idOrSlug: string) {
  return prisma.vehicle.findFirst({
    where: { OR: [{ slug: idOrSlug }, { id: idOrSlug }] },
    include: { images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] } },
  })
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const vehicle = await getVehicle(id)
  if (!vehicle) return {}
  return {
    title: vehicle.title,
    description: vehicle.description ?? undefined,
  }
}

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const vehicle = await getVehicle(id)

  if (!vehicle) notFound()

  const statusVariant =
    vehicle.status === 'AVAILABLE' ? 'success' :
    vehicle.status === 'RESERVED' ? 'warning' : 'error'

  const specs = [
    { icon: Calendar, label: 'Rok výroby', value: String(vehicle.year) },
    { icon: Gauge, label: 'Najazdené', value: formatMileage(vehicle.mileage) },
    { icon: Fuel, label: 'Palivo', value: fuelTypeLabel(vehicle.fuelType) },
    { icon: Settings, label: 'Prevodovka', value: transmissionLabel(vehicle.transmission) },
    ...(vehicle.power ? [{ icon: Zap, label: 'Výkon', value: `${vehicle.power} hp` }] : []),
    ...(vehicle.engineCapacity ? [{ icon: Activity, label: 'Objem motora', value: `${vehicle.engineCapacity} cc` }] : []),
    ...(vehicle.color ? [{ icon: Palette, label: 'Farba', value: vehicle.color }] : []),
    ...(vehicle.bodyType ? [{ icon: DoorOpen, label: 'Karoséria', value: bodyTypeLabel(vehicle.bodyType) }] : []),
    ...(vehicle.doors ? [{ icon: DoorOpen, label: 'Počet dverí', value: String(vehicle.doors) }] : []),
    ...(vehicle.seats ? [{ icon: Users, label: 'Počet miest', value: String(vehicle.seats) }] : []),
  ]

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/vehicles"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Späť na ponuku
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <VehicleGallery images={vehicle.images} title={vehicle.title} />

            {vehicle.description && (
              <div className="bg-white rounded-xl border border-slate-100 p-6">
                <h2 className="font-semibold text-slate-900 text-lg mb-3">Popis vozidla</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {vehicle.description}
                </p>
              </div>
            )}

            {vehicle.features.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-100 p-6">
                <h2 className="font-semibold text-slate-900 text-lg mb-3">Výbava</h2>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map((feature, i) => (
                    <span
                      key={i}
                      className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full border border-primary/20"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-100 p-6 sticky top-20">
              <Badge variant={statusVariant}>{vehicleStatusLabel(vehicle.status)}</Badge>
              <h1 className="text-2xl font-bold text-slate-900 mt-2 mb-1">{vehicle.title}</h1>
              {vehicle.variant && (
                <p className="text-slate-500 text-sm mb-4">{vehicle.variant}</p>
              )}
              <p className="text-4xl font-extrabold text-primary mb-6">
                {formatPrice(vehicle.price)}
              </p>

              <div className="grid grid-cols-1 gap-3 mb-6">
                {specs.map((spec) => (
                  <div key={spec.label} className="flex items-center justify-between py-2 border-b border-slate-50">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <spec.icon className="h-4 w-4 text-slate-400" />
                      {spec.label}
                    </div>
                    <span className="font-medium text-slate-900 text-sm">{spec.value}</span>
                  </div>
                ))}
              </div>

              {vehicle.status === 'AVAILABLE' && (
                <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mb-3" size="lg">
                  <Link href="/contact">Mám záujem</Link>
                </Button>
              )}
              <Button asChild variant="outline" className="w-full" size="lg">
                <Link href="/contact">Kontaktovať predajcu</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
