import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, GitCompareArrows, ExternalLink, Plus, X } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import {
  formatPrice,
  formatMileage,
  fuelTypeLabel,
  transmissionLabel,
  bodyTypeLabel,
  vehicleStatusLabel,
} from '@/lib/utils'

export const metadata: Metadata = { title: 'Porovnanie vozidiel' }

async function getVehicles(ids: string[]) {
  const rows = await prisma.vehicle.findMany({
    where: { id: { in: ids } },
    include: { images: { where: { isPrimary: true }, take: 1 } },
  })
  // preserve URL order
  return ids.map(id => rows.find(v => v.id === id)).filter(Boolean) as typeof rows
}

function hasDiff(values: (string | number | null | undefined)[]): boolean {
  const filled = values.filter(v => v !== null && v !== undefined && v !== '').map(String)
  if (filled.length <= 1) return false
  return new Set(filled).size > 1
}

function removeOneUrl(ids: string[], removeId: string): string {
  const rest = ids.filter(id => id !== removeId)
  if (rest.length < 2) return '/vehicles'
  return `/compare?ids=${rest.join(',')}`
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHead({ label, colCount }: { label: string; colCount: number }) {
  return (
    <tr className="bg-slate-50 border-y border-slate-100">
      <td
        colSpan={colCount + 1}
        className="px-6 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest"
      >
        {label}
      </td>
    </tr>
  )
}

interface RowProps {
  label: string
  values: (string | null | undefined)[]
}

function DataRow({ label, values }: RowProps) {
  const diff = hasDiff(values)
  return (
    <tr className={`border-b border-slate-100 last:border-0 transition-colors ${diff ? 'bg-orange-50/50' : 'hover:bg-slate-50/40'}`}>
      <td className="px-6 py-3.5 text-sm text-slate-500 font-medium border-r border-slate-100 align-middle whitespace-nowrap">
        {label}
      </td>
      {values.map((val, i) => (
        <td
          key={i}
          className={`px-6 py-3.5 text-sm text-center border-r border-slate-100 last:border-r-0 align-middle ${
            diff ? 'font-semibold text-slate-900' : 'text-slate-600'
          }`}
        >
          {val != null && val !== ''
            ? val
            : <span className="text-slate-300">—</span>
          }
        </td>
      ))}
    </tr>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>
}) {
  const { ids: idsParam } = await searchParams
  const ids = (idsParam ?? '').split(',').filter(Boolean).slice(0, 3)

  // Empty state
  if (ids.length < 2) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <GitCompareArrows className="h-8 w-8 text-slate-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Žiadne vozidlá na porovnanie</h1>
          <p className="text-slate-500 text-sm mb-6">
            Kliknite na tlačidlo <strong>Porovnať</strong> pri aspoň 2 vozidlách a potom sa sem vráťte.
          </p>
          <Link
            href="/vehicles"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="h-4 w-4" />
            Prejsť na ponuku vozidiel
          </Link>
        </div>
      </div>
    )
  }

  const vehicles = await getVehicles(ids)

  if (vehicles.length < 2) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Niektoré vozidlá neboli nájdené.</p>
          <Link href="/vehicles" className="text-orange-600 hover:underline text-sm">Späť na ponuku</Link>
        </div>
      </div>
    )
  }

  const colCount = vehicles.length
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyV = (v: unknown) => v as any

  // Row data
  const basicRows: RowProps[] = [
    { label: 'Rok výroby',      values: vehicles.map(v => String(v.year)) },
    { label: 'Najazdené',        values: vehicles.map(v => formatMileage(v.mileage)) },
    { label: 'Inzerovaná cena', values: vehicles.map(v => formatPrice(v.price)) },
    { label: 'Zľavnená cena',   values: vehicles.map(v => v.salePrice ? formatPrice(v.salePrice) : null) },
    { label: 'Palivo',           values: vehicles.map(v => fuelTypeLabel(v.fuelType)) },
    { label: 'Prevodovka',       values: vehicles.map(v => transmissionLabel(v.transmission)) },
    { label: 'Karoséria',        values: vehicles.map(v => v.bodyType ? bodyTypeLabel(v.bodyType) : null) },
    { label: 'Stav',             values: vehicles.map(v => vehicleStatusLabel(v.status)) },
  ]

  const techRows: RowProps[] = [
    { label: 'Výkon',         values: vehicles.map(v => v.power ? `${v.power} kW` : null) },
    { label: 'Objem motora',  values: vehicles.map(v => v.engineCapacity ? `${v.engineCapacity} cm³` : null) },
    { label: 'Farba',         values: vehicles.map(v => v.color) },
    { label: 'Počet dverí',   values: vehicles.map(v => v.doors ? String(v.doors) : null) },
    { label: 'Počet miest',   values: vehicles.map(v => v.seats ? String(v.seats) : null) },
    { label: 'VIN',           values: vehicles.map(v => v.vin) },
  ]

  const equipRows: RowProps[] = [
    { label: 'Bezpečnosť',   values: vehicles.map(v => `${anyV(v).safetyFeatures?.length ?? 0} položiek`) },
    { label: 'Komfort',      values: vehicles.map(v => `${anyV(v).comfortFeatures?.length ?? 0} položiek`) },
    { label: 'Multimédiá',   values: vehicles.map(v => `${anyV(v).multimediaFeatures?.length ?? 0} položiek`) },
    { label: 'Exteriér',     values: vehicles.map(v => `${anyV(v).exteriorFeatures?.length ?? 0} položiek`) },
    { label: 'Ďalšia výbava', values: vehicles.map(v => `${(anyV(v).otherFeatures?.length ?? 0) + (anyV(v).features?.length ?? 0)} položiek`) },
  ]
  if (vehicles.some(v => (anyV(v).evFeatures?.length ?? 0) > 0)) {
    equipRows.push({ label: 'EV / Hybrid', values: vehicles.map(v => `${anyV(v).evFeatures?.length ?? 0} položiek`) })
  }

  const tableMinWidth = 176 + colCount * 260

  return (
    <div className="bg-slate-50 min-h-screen pb-28">
      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <Link
          href="/vehicles"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Späť na ponuku
        </Link>

        <div className="flex items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <GitCompareArrows className="h-6 w-6 text-orange-500" />
            Porovnanie vozidiel
          </h1>
          {vehicles.length < 3 && (
            <Link
              href="/vehicles"
              className="hidden sm:flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Pridať vozidlo
            </Link>
          )}
        </div>

        {/* Legend */}
        <p className="text-xs text-slate-400 mb-5 flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-orange-100 border border-orange-200" />
          Zvýraznené riadky obsahujú rozdielne hodnoty
        </p>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table
              className="w-full border-collapse"
              style={{ minWidth: tableMinWidth, tableLayout: 'fixed' }}
            >
              <colgroup>
                <col style={{ width: '176px' }} />
                {vehicles.map((_, i) => <col key={i} />)}
              </colgroup>

              {/* Vehicle header cards */}
              <thead>
                <tr className="border-b-2 border-slate-100">
                  {/* Empty corner */}
                  <th className="border-r border-slate-100 bg-slate-50/60 p-5 align-bottom">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Vlastnosť
                    </span>
                  </th>

                  {vehicles.map(veh => {
                    const img = veh.images[0]?.url ?? null
                    const href = `/vehicles/${veh.slug ?? veh.id}`
                    const hasSale = veh.salePrice != null && Number(veh.salePrice) > 0
                    const statusVariant =
                      veh.status === 'AVAILABLE' ? 'success' :
                      veh.status === 'RESERVED' ? 'warning' : 'error'

                    return (
                      <th
                        key={veh.id}
                        className="border-r border-slate-100 last:border-r-0 align-top font-normal p-5"
                      >
                        {/* Remove */}
                        <div className="flex justify-end mb-3">
                          <Link
                            href={removeOneUrl(ids, veh.id)}
                            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                            Odstrániť
                          </Link>
                        </div>

                        {/* Photo */}
                        <Link href={href} className="block group">
                          <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 mb-3">
                            {img ? (
                              <Image
                                src={img}
                                alt={veh.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 350px"
                                className="object-contain group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                    d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                    d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </Link>

                        {/* Badge + title */}
                        <Badge variant={statusVariant} className="mb-2">
                          {vehicleStatusLabel(veh.status)}
                        </Badge>
                        <Link href={href}>
                          <h2 className="font-semibold text-slate-900 text-sm leading-snug mb-1 hover:text-primary transition-colors">
                            {veh.title}
                          </h2>
                        </Link>
                        {veh.variant && (
                          <p className="text-xs text-slate-500 mb-2">{veh.variant}</p>
                        )}

                        {/* Price */}
                        {hasSale ? (
                          <div className="mb-3">
                            <p className="text-xl font-extrabold text-red-600 leading-tight">
                              {formatPrice(veh.salePrice!)}
                            </p>
                            <p className="text-xs text-slate-400 line-through">{formatPrice(veh.price)}</p>
                          </div>
                        ) : (
                          <p className="text-xl font-extrabold text-primary mb-3">
                            {formatPrice(veh.price)}
                          </p>
                        )}

                        {/* Detail link */}
                        <Link
                          href={href}
                          className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors"
                        >
                          Detail vozidla
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </th>
                    )
                  })}
                </tr>
              </thead>

              {/* Data rows */}
              <tbody>
                <SectionHead label="Základné informácie" colCount={colCount} />
                {basicRows.map(r => <DataRow key={r.label} {...r} />)}

                <SectionHead label="Technické parametre" colCount={colCount} />
                {techRows.map(r => <DataRow key={r.label} {...r} />)}

                <SectionHead label="Výbava (počet položiek)" colCount={colCount} />
                {equipRows.map(r => <DataRow key={r.label} {...r} />)}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
