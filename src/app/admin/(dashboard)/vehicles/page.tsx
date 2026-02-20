import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, FileInput, UserPen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { prisma } from '@/lib/prisma'
import DeleteVehicleButton from '@/components/admin/DeleteVehicleButton'
import { formatPrice, formatMileage, vehicleStatusLabel, fuelTypeLabel } from '@/lib/utils'

export const metadata: Metadata = { title: 'Ponuka vozidiel' }

export default async function AdminVehiclesPage() {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: { in: ['AVAILABLE', 'RESERVED'] } },
    orderBy: { createdAt: 'desc' },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ponuka vozidiel</h1>
          <p className="text-slate-500 text-sm mt-1">{vehicles.length} vozidiel v aktuálnej ponuke</p>
        </div>
        <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
          <Link href="/admin/vehicles/new">
            <Plus className="h-4 w-4 mr-2" />
            Pridať vozidlo
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Aktuálna ponuka</CardTitle>
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
                    Žiadne vozidlá v ponuke
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
                        <p className="font-medium text-slate-900 text-sm">{vehicle.title}</p>
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
