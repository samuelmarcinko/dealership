'use client'

import React from 'react'
import Link from 'next/link'
import {
  ExternalLink, RefreshCw, Calendar, Gauge, Fuel, Settings, Zap, Activity,
  Palette, DoorOpen, Users, Hash, ShieldCheck, Thermometer, Car, Check,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  fuelTypeLabel, transmissionLabel, bodyTypeLabel, formatMileage, formatPrice,
} from '@/lib/utils'
import type { Vehicle, VehicleImage } from '@prisma/client'

type ImportedVehicle = Vehicle & { images: VehicleImage[] }

interface ExtraParams {
  consumptionUrban?: string
  consumptionRural?: string
  consumptionCombined?: string
  co2?: string
  tireSize?: string
  maxSpeed?: string
  acceleration?: string
  additionalInfo?: string[]
  airConditioning?: string
  parkingSensors?: string
  heatedSeats?: string
  electricWindows?: string
  airbags?: string
  xenon?: string
  radio?: string
}

interface Props {
  vehicle: ImportedVehicle
}

export default function ImportedVehicleView({ vehicle }: Props) {
  const extra = (vehicle.extraParams ?? {}) as ExtraParams
  const importedAt = vehicle.importedAt ? new Date(vehicle.importedAt).toLocaleString('sk-SK') : '—'

  const specs = [
    { icon: Calendar, label: 'Rok výroby', value: String(vehicle.year) },
    { icon: Gauge, label: 'Najazdené', value: formatMileage(vehicle.mileage) },
    { icon: Fuel, label: 'Palivo', value: fuelTypeLabel(vehicle.fuelType) },
    { icon: Settings, label: 'Prevodovka', value: transmissionLabel(vehicle.transmission) },
    ...(vehicle.power ? [{ icon: Zap, label: 'Výkon', value: `${vehicle.power} kW` }] : []),
    ...(vehicle.engineCapacity ? [{ icon: Activity, label: 'Objem motora', value: `${vehicle.engineCapacity} cm³` }] : []),
    ...(vehicle.color ? [{ icon: Palette, label: 'Farba', value: vehicle.color }] : []),
    ...(vehicle.bodyType ? [{ icon: Car, label: 'Karoséria', value: bodyTypeLabel(vehicle.bodyType) }] : []),
    ...(vehicle.doors ? [{ icon: DoorOpen, label: 'Počet dverí', value: String(vehicle.doors) }] : []),
    ...(vehicle.seats ? [{ icon: Users, label: 'Počet miest', value: String(vehicle.seats) }] : []),
    ...(vehicle.vin ? [{ icon: Hash, label: 'VIN', value: vehicle.vin }] : []),
    ...((vehicle as { driveType?: string }).driveType ? [{ icon: Car, label: 'Pohon', value: (vehicle as { driveType?: string }).driveType! }] : []),
    ...((vehicle as { emissionStandard?: string }).emissionStandard ? [{ icon: ShieldCheck, label: 'Emisná norma', value: (vehicle as { emissionStandard?: string }).emissionStandard! }] : []),
    ...(extra.consumptionCombined ? [{ icon: Fuel, label: 'Spotreba (komb.)', value: `${extra.consumptionCombined} l/100km` }] : []),
    ...(extra.co2 ? [{ icon: Thermometer, label: 'Emisie CO₂', value: `${extra.co2} g/km` }] : []),
    ...(extra.tireSize ? [{ icon: Activity, label: 'Rozmery pneumatík', value: extra.tireSize }] : []),
    ...(extra.maxSpeed ? [{ icon: Gauge, label: 'Max. rýchlosť', value: `${extra.maxSpeed} km/h` }] : []),
    ...(extra.acceleration ? [{ icon: Zap, label: 'Zrýchlenie 0–100', value: `${extra.acceleration} s` }] : []),
  ]

  const features = vehicle.features ?? []

  return (
    <div className="space-y-6">
      {/* Import banner */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <RefreshCw className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-900">Importované vozidlo — len na čítanie</p>
          <p className="text-sm text-amber-700 mt-0.5">
            Údaje sú automaticky synchronizované z externého feedu. Pre zmenu údajov upravte inzerát priamo na portáli.
          </p>
          <p className="text-xs text-amber-600 mt-1.5">Posledná synchronizácia: {importedAt}</p>
        </div>
        {(vehicle as { externalUrl?: string }).externalUrl && (
          <Link
            href={(vehicle as { externalUrl?: string }).externalUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-sm font-medium rounded-lg transition-colors shrink-0"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Zobraziť na portáli
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Základné info + specs */}
        <div className="space-y-6">
          {/* Základné info */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Základné informácie</h2>
            <div className="space-y-0">
              {[
                { label: 'Názov', value: vehicle.title },
                { label: 'Značka', value: vehicle.make },
                { label: 'Model', value: vehicle.model },
                ...(vehicle.variant ? [{ label: 'Variant', value: vehicle.variant }] : []),
                { label: 'Cena', value: formatPrice(vehicle.price) },
                {
                  label: 'Status', value: (
                    <Badge variant={vehicle.status === 'AVAILABLE' ? 'success' : vehicle.status === 'RESERVED' ? 'warning' : 'error'}>
                      {vehicle.status === 'AVAILABLE' ? 'Dostupné' : vehicle.status === 'RESERVED' ? 'Rezervované' : 'Predané'}
                    </Badge>
                  )
                },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-500">{row.label}</span>
                  {typeof row.value === 'string'
                    ? <span className="text-sm font-medium text-slate-900">{row.value}</span>
                    : row.value}
                </div>
              ))}
            </div>
          </div>

          {/* Technické parametre */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Technické parametre</h2>
            <div className="space-y-0">
              {specs.map((spec, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <spec.icon className="h-4 w-4 text-slate-400" />
                    {spec.label}
                  </div>
                  <span className="text-sm font-medium text-slate-900">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Spotreba detail */}
          {(extra.consumptionUrban || extra.consumptionRural || extra.consumptionCombined) && (
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Spotreba paliva</h2>
              <div className="grid grid-cols-3 gap-3 text-center">
                {extra.consumptionUrban && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">V meste</p>
                    <p className="text-base font-bold text-slate-900">{extra.consumptionUrban}</p>
                    <p className="text-xs text-slate-400">l/100km</p>
                  </div>
                )}
                {extra.consumptionRural && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Mimo mesta</p>
                    <p className="text-base font-bold text-slate-900">{extra.consumptionRural}</p>
                    <p className="text-xs text-slate-400">l/100km</p>
                  </div>
                )}
                {extra.consumptionCombined && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Kombinovaná</p>
                    <p className="text-base font-bold text-slate-900">{extra.consumptionCombined}</p>
                    <p className="text-xs text-slate-400">l/100km</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Fotky + výbava */}
        <div className="space-y-6">
          {/* Fotky */}
          {vehicle.images.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <h2 className="text-base font-semibold text-slate-900 mb-4">
                Fotografie <span className="text-slate-400 font-normal text-sm">({vehicle.images.length})</span>
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {vehicle.images.slice(0, 9).map((img, i) => (
                  <div key={img.id} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={`${vehicle.title} — foto ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {i === 0 && (
                      <span className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                        Hlavná
                      </span>
                    )}
                  </div>
                ))}
                {vehicle.images.length > 9 && (
                  <div className="aspect-[4/3] rounded-lg bg-slate-100 flex items-center justify-center">
                    <span className="text-slate-500 text-sm font-medium">+{vehicle.images.length - 9}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Doplňujúce info badges */}
          {extra.additionalInfo && extra.additionalInfo.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <h2 className="text-base font-semibold text-slate-900 mb-3">Doplňujúce informácie</h2>
              <div className="flex flex-wrap gap-2">
                {extra.additionalInfo.map((info, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                    <Check className="h-3 w-3" />
                    {info}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Popis */}
          {vehicle.description && (
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <h2 className="text-base font-semibold text-slate-900 mb-3">Popis</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{vehicle.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Výbava */}
      {features.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">
            Výbava <span className="text-slate-400 font-normal text-sm">({features.length} položiek)</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start gap-2 min-w-0">
                <Check className="h-3.5 w-3.5 text-orange-500 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-600 leading-snug">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
