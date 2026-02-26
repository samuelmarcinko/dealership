import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Fuel, Gauge, Settings, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatMileage, fuelTypeLabel, transmissionLabel, vehicleStatusLabel } from '@/lib/utils'
import type { PublicVehicle } from '@/types'
import CompareButton from '@/components/public/CompareButton'

interface VehicleCardProps {
  vehicle: PublicVehicle
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const statusVariant =
    vehicle.status === 'AVAILABLE' ? 'success' :
    vehicle.status === 'RESERVED' ? 'warning' : 'error'

  const href = `/vehicles/${vehicle.slug ?? vehicle.id}`

  const compareVehicle = {
    id: vehicle.id,
    title: vehicle.title,
    slug: vehicle.slug,
    imageUrl: vehicle.primaryImage?.url ?? null,
  }

  return (
    <Link href={href} className="group block">
      <article className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md hover:border-primary/30 transition-all duration-200 flex flex-col h-full">
        <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
          {vehicle.primaryImage ? (
            <Image
              src={vehicle.primaryImage.url}
              alt={vehicle.title}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-300">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2zM5 16v1m14-1v1M9 16V8m6 8V8m0 0l-3-3m3 3h-6" />
              </svg>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge variant={statusVariant}>{vehicleStatusLabel(vehicle.status)}</Badge>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-slate-900 text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
            {vehicle.title}
          </h3>
          {vehicle.variant && (
            <p className="text-sm text-slate-500 mb-3">{vehicle.variant}</p>
          )}

          <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-slate-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{vehicle.year}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-slate-400" />
              <span>{formatMileage(vehicle.mileage)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel className="h-3.5 w-3.5 text-slate-400" />
              <span>{fuelTypeLabel(vehicle.fuelType)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Settings className="h-3.5 w-3.5 text-slate-400" />
              <span>{transmissionLabel(vehicle.transmission)}</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 mt-auto flex items-end justify-between gap-2">
            <div className="min-w-0">
              {vehicle.salePrice ? (
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-2xl font-bold text-red-600">{formatPrice(vehicle.salePrice)}</span>
                    <span className="text-xs bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">
                      ZĽAVNENÁ CENA
                    </span>
                  </div>
                  <span className="text-sm line-through text-slate-400">{formatPrice(vehicle.price)}</span>
                </div>
              ) : (
                <div>
                  <span className="text-2xl font-bold text-primary">{formatPrice(vehicle.price)}</span>
                  <div className="h-5" />
                </div>
              )}
            </div>
            <CompareButton vehicle={compareVehicle} />
          </div>
        </div>
      </article>
    </Link>
  )
}
