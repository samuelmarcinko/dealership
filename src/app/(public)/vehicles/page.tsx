import React from 'react'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import VehicleCard from '@/components/public/VehicleCard'
import VehicleFilters from '@/components/public/VehicleFilters'
import type { PublicVehicle } from '@/types'
import { FuelType, TransmissionType } from '@prisma/client'

export const metadata: Metadata = {
  title: 'Vozidlá',
  description: 'Prezrite si celú ponuku ojazdených vozidiel. Filtrujte podľa značky, ceny, roku výroby a ďalších parametrov.',
}

export const revalidate = 30

interface SearchParams {
  make?: string        // comma-separated, e.g. "BMW,Audi"
  fuelType?: string    // comma-separated
  transmission?: string // comma-separated
  minPrice?: string
  maxPrice?: string
  minYear?: string
  maxYear?: string
}

async function getVehicles(params: SearchParams): Promise<{
  vehicles: PublicVehicle[]
  makes: string[]
  yearDbMin: number
  yearDbMax: number
}> {
  const NON_SOLD = { status: { not: 'SOLD' as const } }
  const where: Record<string, unknown> = { ...NON_SOLD }

  // Multiselect: comma-separated values
  if (params.make) {
    const vals = params.make.split(',').filter(Boolean)
    if (vals.length === 1) where.make = vals[0]
    else if (vals.length > 1) where.make = { in: vals }
  }
  if (params.fuelType) {
    const vals = params.fuelType.split(',').filter((f) => Object.values(FuelType).includes(f as FuelType)) as FuelType[]
    if (vals.length === 1) where.fuelType = vals[0]
    else if (vals.length > 1) where.fuelType = { in: vals }
  }
  if (params.transmission) {
    const vals = params.transmission.split(',').filter((t) => Object.values(TransmissionType).includes(t as TransmissionType)) as TransmissionType[]
    if (vals.length === 1) where.transmission = vals[0]
    else if (vals.length > 1) where.transmission = { in: vals }
  }

  const priceFilter: Record<string, number> = {}
  if (params.minPrice) priceFilter.gte = parseFloat(params.minPrice)
  if (params.maxPrice) priceFilter.lte = parseFloat(params.maxPrice)
  if (Object.keys(priceFilter).length) where.price = priceFilter

  const yearFilter: Record<string, number> = {}
  if (params.minYear) yearFilter.gte = parseInt(params.minYear)
  if (params.maxYear) yearFilter.lte = parseInt(params.maxYear)
  if (Object.keys(yearFilter).length) where.year = yearFilter

  const [raw, makesRaw, yearStats] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: { images: { where: { isPrimary: true }, take: 1 } },
    }),
    prisma.vehicle.findMany({
      where: NON_SOLD,
      select: { make: true },
      distinct: ['make'],
      orderBy: { make: 'asc' },
    }),
    prisma.vehicle.aggregate({
      where: NON_SOLD,
      _min: { year: true },
      _max: { year: true },
    }),
  ])

  const vehicles: PublicVehicle[] = raw.map((v) => ({
    ...v,
    primaryImage: v.images[0] ?? null,
  }))

  const currentYear = new Date().getFullYear()

  return {
    vehicles,
    makes: makesRaw.map((m) => m.make),
    yearDbMin: yearStats._min.year ?? 1990,
    yearDbMax: yearStats._max.year ?? currentYear,
  }
}

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { vehicles, makes, yearDbMin, yearDbMax } = await getVehicles(params)

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Page header */}
      <div className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Ponuka vozidiel</h1>
          <p className="text-slate-400">
            Nájdené: <span className="text-white font-semibold">{vehicles.length}</span> vozidiel
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <VehicleFilters
              makes={makes}
              currentParams={params as Record<string, string | undefined>}
              yearDbMin={yearDbMin}
              yearDbMax={yearDbMax}
            />
          </aside>

          {/* Vehicle grid */}
          <div className="flex-1">
            {vehicles.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-slate-500 text-lg">Žiadne vozidlá nevyhovujú vašim filtrám.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
