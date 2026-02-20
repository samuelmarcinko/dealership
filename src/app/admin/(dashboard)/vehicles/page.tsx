import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, FileInput, UserPen, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { prisma } from '@/lib/prisma'
import DeleteVehicleButton from '@/components/admin/DeleteVehicleButton'
import { formatPrice, formatMileage, vehicleStatusLabel, fuelTypeLabel } from '@/lib/utils'
import { FuelType, VehicleStatus } from '@prisma/client'

export const metadata: Metadata = { title: 'Ponuka vozidiel' }

const FUEL_OPTIONS = [
  { value: '', label: 'Všetky palivá' },
  { value: 'PETROL', label: 'Benzín' },
  { value: 'DIESEL', label: 'Nafta' },
  { value: 'ELECTRIC', label: 'Elektro' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'LPG', label: 'LPG' },
  { value: 'CNG', label: 'CNG' },
]

export default async function AdminVehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; fuelType?: string }>
}) {
  const sp = await searchParams
  const q = sp.q?.trim() || undefined
  const statusFilter = sp.status === 'AVAILABLE' || sp.status === 'RESERVED' ? sp.status : undefined
  const fuelFilter = sp.fuelType && Object.values(FuelType).includes(sp.fuelType as FuelType)
    ? sp.fuelType as FuelType
    : undefined

  const vehicles = await prisma.vehicle.findMany({
    where: {
      status: statusFilter ? statusFilter : { in: [VehicleStatus.AVAILABLE, VehicleStatus.RESERVED] },
      ...(q && {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { make: { contains: q, mode: 'insensitive' } },
          { model: { contains: q, mode: 'insensitive' } },
        ],
      }),
      ...(fuelFilter && { fuelType: fuelFilter }),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
    },
  })

  const hasFilter = !!(q || statusFilter || fuelFilter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ponuka vozidiel</h1>
          <p className="text-slate-500 text-sm mt-1">
            {hasFilter ? `${vehicles.length} nájdených` : `${vehicles.length} vozidiel v aktuálnej ponuke`}
          </p>
        </div>
        <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
          <Link href="/admin/vehicles/new">
            <Plus className="h-4 w-4 mr-2" />
            Pridať vozidlo
          </Link>
        </Button>
      </div>

      {/* Filter bar */}
      <form method="GET" className="flex flex-wrap gap-3 items-end bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex-1 min-w-48 space-y-1">
          <label className="text-xs font-medium text-slate-600">Hľadať</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              name="q"
              defaultValue={sp.q ?? ''}
              placeholder="Názov, značka, model..."
              className="w-full h-9 pl-9 pr-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Stav</label>
          <select
            name="status"
            defaultValue={sp.status ?? ''}
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="">Všetky stavy</option>
            <option value="AVAILABLE">Dostupné</option>
            <option value="RESERVED">Rezervované</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Palivo</label>
          <select
            name="fuelType"
            defaultValue={sp.fuelType ?? ''}
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            {FUEL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="h-9 px-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-md transition-colors"
        >
          Filtrovať
        </button>
        {hasFilter && (
          <Link
            href="/admin/vehicles"
            className="h-9 px-4 border border-slate-300 hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-md transition-colors flex items-center"
          >
            Zrušiť
          </Link>
        )}
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Aktuálna ponuka
            {hasFilter && <span className="text-slate-400 font-normal ml-2 text-sm">(filtrované)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Foto</TableHead>
                <TableHead>Vozidlo</TableHead>
                <TableHead>Rok</TableHead>
                <TableHead>Palivo</TableHead>
                <TableHead>Najazdené</TableHead>
                <TableHead>Cena</TableHead>
                <TableHead>Stav</TableHead>
                <TableHead>Zdroj</TableHead>
                <TableHead className="w-[100px]">Akcie</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-400">
                    {hasFilter ? 'Žiadne vozidlá nevyhovujú filtrám' : 'Žiadne vozidlá v ponuke'}
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((vehicle) => {
                  const statusVariant =
                    vehicle.status === 'AVAILABLE' ? 'success' : 'warning'
                  return (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        <div className="relative w-12 h-9 bg-slate-100 rounded overflow-hidden">
                          {vehicle.images[0] ? (
                            <Image
                              src={vehicle.images[0].url}
                              alt={vehicle.title}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/vehicles/${vehicle.id}`}
                          className="font-medium text-slate-900 text-sm hover:text-orange-600 transition-colors"
                        >
                          {vehicle.title}
                        </Link>
                        {vehicle.variant && <p className="text-xs text-slate-400">{vehicle.variant}</p>}
                      </TableCell>
                      <TableCell className="text-slate-600">{vehicle.year}</TableCell>
                      <TableCell className="text-slate-600">{fuelTypeLabel(vehicle.fuelType)}</TableCell>
                      <TableCell className="text-slate-600">{formatMileage(vehicle.mileage)}</TableCell>
                      <TableCell className="font-semibold text-slate-900">{formatPrice(vehicle.price)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant}>{vehicleStatusLabel(vehicle.status)}</Badge>
                      </TableCell>
                      <TableCell>
                        {vehicle.externalId ? (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <FileInput className="h-3.5 w-3.5" />XML
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <UserPen className="h-3.5 w-3.5" />Manuálne
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                            <Link href={`/admin/vehicles/${vehicle.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <DeleteVehicleButton vehicleId={vehicle.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
