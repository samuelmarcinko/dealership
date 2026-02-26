import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Fuel, Gauge, Settings, Calendar, Zap, Palette, DoorOpen, Users, Activity, Hash, ShieldCheck, Armchair, MonitorPlay, Car, Wrench, Check } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import VehicleGallery from '@/components/public/VehicleGallery'
import VehicleCard from '@/components/public/VehicleCard'
import InquiryModal from '@/components/public/InquiryModal'
import VehicleViewTracker from '@/components/public/VehicleViewTracker'
import CompareButton from '@/components/public/CompareButton'
import {
  formatPrice,
  formatMileage,
  fuelTypeLabel,
  transmissionLabel,
  bodyTypeLabel,
  vehicleStatusLabel,
} from '@/lib/utils'
import type { PublicVehicle } from '@/types'

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

interface FeatureSectionProps {
  icon: LucideIcon
  title: string
  items: string[]
  isFirst?: boolean
}

function FeatureSection({ icon: Icon, title, items, isFirst }: FeatureSectionProps) {
  if (items.length === 0) return null
  return (
    <div className={isFirst ? '' : 'pt-6 border-t border-slate-100'}>
      {/* Category header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 shrink-0">
          <Icon className="h-3.5 w-3.5 text-slate-500" />
        </div>
        <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
        <span className="ml-auto text-xs text-slate-400 tabular-nums">{items.length}</span>
      </div>

      {/* Items — responsive 2-col grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {items.map((feature, i) => (
          <div key={i} className="flex items-start gap-2 min-w-0">
            <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
            <span className="text-sm text-slate-600 leading-snug">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const vehicle = await getVehicle(id)

  if (!vehicle) notFound()

  // Related vehicles: same make, not sold, not this vehicle
  let relatedRaw = await prisma.vehicle.findMany({
    where: { make: vehicle.make, status: { not: 'SOLD' }, id: { not: vehicle.id } },
    include: { images: { where: { isPrimary: true }, take: 1 } },
    orderBy: { createdAt: 'desc' },
    take: 3,
  })

  // Fallback: if no same-make vehicles, take any 3 available vehicles
  if (relatedRaw.length === 0) {
    relatedRaw = await prisma.vehicle.findMany({
      where: { status: { not: 'SOLD' }, id: { not: vehicle.id } },
      include: { images: { where: { isPrimary: true }, take: 1 } },
      orderBy: { createdAt: 'desc' },
      take: 3,
    })
  }

  const relatedVehicles: PublicVehicle[] = relatedRaw.map((v) => ({
    id: v.id,
    slug: v.slug,
    title: v.title,
    make: v.make,
    model: v.model,
    variant: v.variant,
    year: v.year,
    price: v.price,
    salePrice: v.salePrice,
    mileage: v.mileage,
    fuelType: v.fuelType,
    transmission: v.transmission,
    bodyType: v.bodyType,
    status: v.status,
    primaryImage: v.images[0] ?? null,
  }))

  const statusVariant =
    vehicle.status === 'AVAILABLE' ? 'success' :
    vehicle.status === 'RESERVED' ? 'warning' : 'error'

  const specs = [
    { icon: Calendar, label: 'Rok výroby', value: String(vehicle.year) },
    { icon: Gauge, label: 'Najazdené', value: formatMileage(vehicle.mileage) },
    { icon: Fuel, label: 'Palivo', value: fuelTypeLabel(vehicle.fuelType) },
    { icon: Settings, label: 'Prevodovka', value: transmissionLabel(vehicle.transmission) },
    ...(vehicle.power ? [{ icon: Zap, label: 'Výkon', value: `${vehicle.power} kW` }] : []),
    ...(vehicle.engineCapacity ? [{ icon: Activity, label: 'Objem motora', value: `${vehicle.engineCapacity} cc` }] : []),
    ...(vehicle.color ? [{ icon: Palette, label: 'Farba', value: vehicle.color }] : []),
    ...(vehicle.bodyType ? [{ icon: DoorOpen, label: 'Karoséria', value: bodyTypeLabel(vehicle.bodyType) }] : []),
    ...(vehicle.doors ? [{ icon: DoorOpen, label: 'Počet dverí', value: String(vehicle.doors) }] : []),
    ...(vehicle.seats ? [{ icon: Users, label: 'Počet miest', value: String(vehicle.seats) }] : []),
    ...(vehicle.vin ? [{ icon: Hash, label: 'VIN', value: vehicle.vin }] : []),
  ]

  const hasSalePrice = vehicle.salePrice != null && Number(vehicle.salePrice) > 0

  const otherItems = [...(vehicle.otherFeatures ?? []), ...(vehicle.features ?? [])]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const v = vehicle as any
  const featureSections = [
    { icon: ShieldCheck, title: 'Bezpečnosť',   items: v.safetyFeatures ?? [] },
    { icon: Armchair,    title: 'Komfort',       items: v.comfortFeatures ?? [] },
    { icon: MonitorPlay, title: 'Multimédiá',    items: v.multimediaFeatures ?? [] },
    { icon: Car,         title: 'Exteriér',      items: v.exteriorFeatures ?? [] },
    { icon: Wrench,      title: 'Ďalšia výbava', items: otherItems },
    { icon: Zap,         title: 'EV / Hybrid',   items: v.evFeatures ?? [] },
  ].filter(s => s.items.length > 0)

  const hasFeatures = featureSections.length > 0

  // How many rows the left column (col 1-2) occupies on desktop:
  //   row 1: gallery (always)
  //   row 2: description (if present)
  //   row 3: features   (if present)
  // The info card in col 3 must span exactly these rows so sticky works correctly.
  // (lg:row-span-full doesn't work on implicit grids — the explicit gridRow inline style is required)
  const infoCardRowSpan = 1 + (vehicle.description ? 1 : 0) + (hasFeatures ? 1 : 0)

  return (
    <div className="bg-slate-50 min-h-screen">
      <VehicleViewTracker id={vehicle.id} />
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/vehicles"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Späť na ponuku
        </Link>

        {/*
          Mobile order (flex-col): gallery → info card → description → features
          Desktop order (3-col grid):
            col 1-2 row 1: gallery
            col 3  rows 1+: info card (sticky)
            col 1-2 row 2: description
            col 1-2 row 3: features
        */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">

          {/* 1. Gallery — first on mobile, col 1-2 row 1 on desktop */}
          <div className="lg:col-span-2">
            <VehicleGallery images={vehicle.images} title={vehicle.title} />
          </div>

          {/* 2. Info card — second on mobile, col 3 spanning all rows on desktop */}
          {/* gridRow inline style: explicit span required — lg:row-span-full fails on implicit grids */}
          <div
            className="lg:col-start-3"
            style={{ gridRow: `1 / span ${infoCardRowSpan}` }}
          >
            <div className="bg-white rounded-xl border border-slate-100 p-6 lg:sticky lg:top-20">
              <Badge variant={statusVariant}>{vehicleStatusLabel(vehicle.status)}</Badge>
              <h1 className="text-2xl font-bold text-slate-900 mt-2 mb-1">{vehicle.title}</h1>
              {vehicle.variant && (
                <p className="text-slate-500 text-sm mb-3">{vehicle.variant}</p>
              )}

              {/* Price — with or without discount */}
              {hasSalePrice ? (
                <div className="mb-6">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-4xl font-extrabold text-red-600">
                      {formatPrice(vehicle.salePrice!)}
                    </p>
                    <span className="inline-flex items-center bg-red-100 text-red-700 text-sm font-bold px-2.5 py-1 rounded-lg">
                      ZĽAVNENÁ CENA
                    </span>
                  </div>
                  <p className="text-slate-400 line-through text-lg mt-1">
                    {formatPrice(vehicle.price)}
                  </p>
                </div>
              ) : (
                <p className="text-4xl font-extrabold text-primary mb-6">
                  {formatPrice(vehicle.price)}
                </p>
              )}

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
                <div className="mb-3">
                  <InquiryModal vehicleTitle={vehicle.title} />
                </div>
              )}
              <CompareButton
                vehicle={{
                  id: vehicle.id,
                  title: vehicle.title,
                  slug: vehicle.slug,
                  imageUrl: vehicle.images[0]?.url ?? null,
                }}
                variant="detail"
              />
            </div>
          </div>

          {/* 3. Description — third on mobile, col 1-2 row 2 on desktop */}
          {vehicle.description && (
            <div className="lg:col-span-2 lg:col-start-1 bg-white rounded-xl border border-slate-100 p-6">
              <h2 className="font-semibold text-slate-900 text-lg mb-3">Popis vozidla</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {vehicle.description}
              </p>
            </div>
          )}

          {/* 4. Feature sections — fourth on mobile, col 1-2 row 3 on desktop */}
          {hasFeatures && (
            <div className="lg:col-span-2 lg:col-start-1 bg-white rounded-xl border border-slate-100 p-6">
              <h2 className="font-semibold text-slate-900 text-lg mb-5">Výbava</h2>
              {featureSections.map((s, i) => (
                <FeatureSection
                  key={s.title}
                  icon={s.icon}
                  title={s.title}
                  items={s.items}
                  isFirst={i === 0}
                />
              ))}
            </div>
          )}

          {/* 5. Related vehicles — full width */}
          {relatedVehicles.length > 0 && (
            <div className="lg:col-span-3">
              <h2 className="font-semibold text-slate-900 text-lg mb-4">Podobné vozidlá</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedVehicles.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
