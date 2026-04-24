import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import VehicleCard from '@/components/public/VehicleCard'
import VehicleFilters from '@/components/public/VehicleFilters'
import type { PublicVehicle } from '@/types'
import { FuelType, TransmissionType, BodyType } from '@prisma/client'

export const metadata: Metadata = {
  title: 'Vozidlá',
  description: 'Prezrite si celú ponuku ojazdených vozidiel. Filtrujte podľa značky, ceny, roku výroby a ďalších parametrov.',
}

export const revalidate = 30

const PAGE_SIZE = 12

interface SearchParams {
  make?: string
  fuelType?: string
  transmission?: string
  bodyType?: string
  minPrice?: string
  maxPrice?: string
  minYear?: string
  maxYear?: string
  minMileage?: string
  maxMileage?: string
  page?: string
}

async function getVehicles(params: SearchParams) {
  const NON_SOLD = { status: { not: 'SOLD' as const } }
  const where: Record<string, unknown> = { ...NON_SOLD }

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
  if (params.bodyType) {
    const vals = params.bodyType.split(',').filter((b) => Object.values(BodyType).includes(b as BodyType)) as BodyType[]
    if (vals.length === 1) where.bodyType = vals[0]
    else if (vals.length > 1) where.bodyType = { in: vals }
  }

  const mileageFilter: Record<string, number> = {}
  if (params.minMileage) mileageFilter.gte = parseInt(params.minMileage)
  if (params.maxMileage) mileageFilter.lte = parseInt(params.maxMileage)
  if (Object.keys(mileageFilter).length) where.mileage = mileageFilter

  const priceFilter: Record<string, number> = {}
  if (params.minPrice) priceFilter.gte = parseFloat(params.minPrice)
  if (params.maxPrice) priceFilter.lte = parseFloat(params.maxPrice)
  if (Object.keys(priceFilter).length) where.price = priceFilter

  const yearFilter: Record<string, number> = {}
  if (params.minYear) yearFilter.gte = parseInt(params.minYear)
  if (params.maxYear) yearFilter.lte = parseInt(params.maxYear)
  if (Object.keys(yearFilter).length) where.year = yearFilter

  const page = Math.max(1, parseInt(params.page ?? '1'))
  const skip = (page - 1) * PAGE_SIZE

  const [raw, total, makesRaw, yearStats] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: { images: { where: { isPrimary: true }, take: 1 } },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.vehicle.count({ where }),
    prisma.vehicle.findMany({
      where: NON_SOLD,
      select: { make: true },
      distinct: ['make'],
      orderBy: { make: 'asc' },
    }),
    prisma.vehicle.aggregate({
      where: NON_SOLD,
      _min: { year: true },
      _max: { year: true, mileage: true },
    }),
  ])

  const vehicles: PublicVehicle[] = raw.map((v) => ({
    ...v,
    primaryImage: v.images[0] ?? null,
  }))

  const currentYear = new Date().getFullYear()
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return {
    vehicles,
    total,
    page,
    totalPages,
    makes: makesRaw.map((m) => m.make),
    yearDbMin: yearStats._min.year ?? 1990,
    yearDbMax: yearStats._max.year ?? currentYear,
    mileageDbMax: Math.ceil((yearStats._max.mileage ?? 300000) / 10000) * 10000,
  }
}

// ── Pagination component ───────────────────────────────────────────────────

function buildUrl(params: Record<string, string | undefined>, page: number): string {
  const p = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v && k !== 'page') p.set(k, v) })
  if (page > 1) p.set('page', String(page))
  const qs = p.toString()
  return qs ? `/vehicles?${qs}` : '/vehicles'
}

function Pagination({ page, totalPages, params }: {
  page: number
  totalPages: number
  params: Record<string, string | undefined>
}) {
  if (totalPages <= 1) return null

  // Build page numbers to show: always first, last, current ±1, with ellipsis
  const pages: (number | 'ellipsis')[] = []
  const delta = 1

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis')
    }
  }

  const btnBase = 'inline-flex items-center justify-center h-9 min-w-9 px-2 rounded-lg text-sm font-medium transition-colors'
  const btnActive = 'bg-primary text-white'
  const btnIdle = 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
  const btnDisabled = 'bg-white border border-slate-200 text-slate-300 cursor-not-allowed'

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      {page > 1 ? (
        <Link href={buildUrl(params, page - 1)} className={`${btnBase} ${btnIdle}`} scroll={true}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className={`${btnBase} ${btnDisabled}`}><ChevronLeft className="h-4 w-4" /></span>
      )}

      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e-${i}`} className="px-1 text-slate-400 text-sm select-none">…</span>
        ) : (
          <Link
            key={p}
            href={buildUrl(params, p)}
            className={`${btnBase} ${p === page ? btnActive : btnIdle}`}
            scroll={true}
          >
            {p}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link href={buildUrl(params, page + 1)} className={`${btnBase} ${btnIdle}`} scroll={true}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className={`${btnBase} ${btnDisabled}`}><ChevronRight className="h-4 w-4" /></span>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { vehicles, total, page, totalPages, makes, yearDbMin, yearDbMax, mileageDbMax } = await getVehicles(params)

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, total)

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Page header */}
      <div className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Ponuka vozidiel</h1>
          <p className="text-slate-400">
            {total === 0
              ? 'Žiadne vozidlá nenájdené'
              : <>Zobrazujem <span className="text-white font-semibold">{from}–{to}</span> z <span className="text-white font-semibold">{total}</span> vozidiel</>
            }
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:items-start">

          {/* Filters sidebar — sticky on desktop */}
          <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-6">
            <VehicleFilters
              makes={makes}
              currentParams={params as Record<string, string | undefined>}
              yearDbMin={yearDbMin}
              yearDbMax={yearDbMax}
              mileageDbMax={mileageDbMax}
            />
          </aside>

          {/* Vehicle grid + pagination */}
          <div className="flex-1 min-w-0">
            {vehicles.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-slate-500 text-lg">Pre vaše filtrovacie kritériá sme nenašli žiadne vozidlá v ponuke.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {vehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>

                <Pagination
                  page={page}
                  totalPages={totalPages}
                  params={params as Record<string, string | undefined>}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
