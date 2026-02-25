import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Car, Users, CheckCircle, Clock, XCircle, ArrowRight, Plus, Gauge, Fuel, CalendarDays } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { formatPrice, formatMileage, fuelTypeLabel, vehicleStatusLabel } from '@/lib/utils'

export const metadata: Metadata = { title: 'Dashboard' }

async function getStats() {
  const [totalVehicles, available, reserved, sold, totalUsers, recentVehicles] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
    prisma.vehicle.count({ where: { status: 'RESERVED' } }),
    prisma.vehicle.count({ where: { status: 'SOLD' } }),
    prisma.user.count(),
    prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { images: { where: { isPrimary: true }, take: 1 } },
    }),
  ])

  return { totalVehicles, available, reserved, sold, totalUsers, recentVehicles }
}

export default async function DashboardPage() {
  const { totalVehicles, available, reserved, sold, totalUsers, recentVehicles } = await getStats()

  const statCards = [
    { label: 'Celkom vozidiel', value: totalVehicles, icon: Car, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Dostupné', value: available, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Rezervované', value: reserved, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Predané', value: sold, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Používatelia', value: totalUsers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Prehľad vašej dealership platformy</p>
        </div>
        <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
          <Link href="/admin/vehicles/new">
            <Plus className="h-4 w-4 mr-2" />
            Pridať vozidlo
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-5">
              <div className={`inline-flex p-2 rounded-lg ${card.bg} mb-3`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900">{card.value}</div>
              <div className="text-slate-500 text-sm mt-0.5">{card.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent vehicles */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base font-semibold">Posledné vozidlá</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/vehicles" className="flex items-center gap-1 text-sm text-orange-600">
              Zobraziť všetky
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {recentVehicles.length === 0 ? (
              <p className="px-6 py-8 text-slate-400 text-sm text-center">
                Zatiaľ žiadne vozidlá. <Link href="/admin/vehicles/new" className="text-orange-600 hover:underline">Pridajte prvé.</Link>
              </p>
            ) : (
              recentVehicles.map((v) => {
                const statusVariant =
                  v.status === 'AVAILABLE' ? 'success' :
                  v.status === 'RESERVED' ? 'warning' : 'error'
                const thumb = v.images[0]?.url ?? null
                const dateAdded = new Intl.DateTimeFormat('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(v.createdAt))

                const inner = (
                  <div className="flex items-center gap-3 w-full min-w-0">
                    {/* Thumbnail */}
                    <div className="shrink-0 w-14 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                      {thumb ? (
                        <Image src={thumb} alt={v.title} width={56} height={40} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="h-4 w-4 text-slate-300" />
                        </div>
                      )}
                    </div>

                    {/* Title + make/year */}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 text-sm truncate">{v.title}</p>
                      <p className="text-slate-400 text-xs">{v.year} · {v.make}</p>
                    </div>

                    {/* Mileage */}
                    <div className="hidden md:flex items-center gap-1 text-slate-500 text-xs shrink-0">
                      <Gauge className="h-3.5 w-3.5 text-slate-400" />
                      {formatMileage(v.mileage)}
                    </div>

                    {/* Fuel */}
                    <div className="hidden lg:flex items-center gap-1 text-slate-500 text-xs shrink-0 w-16">
                      <Fuel className="h-3.5 w-3.5 text-slate-400" />
                      {fuelTypeLabel(v.fuelType)}
                    </div>

                    {/* Date added */}
                    <div className="hidden lg:flex items-center gap-1 text-slate-400 text-xs shrink-0 w-24">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {dateAdded}
                    </div>

                    {/* Status + price */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={statusVariant}>{vehicleStatusLabel(v.status)}</Badge>
                      <span className="font-semibold text-slate-900 text-sm w-24 text-right">{formatPrice(v.price)}</span>
                    </div>
                  </div>
                )

                if (v.status === 'SOLD') {
                  return (
                    <div key={v.id} className="flex items-center px-6 py-3 opacity-60 cursor-default">
                      {inner}
                    </div>
                  )
                }
                return (
                  <Link
                    key={v.id}
                    href={`/admin/vehicles/${v.id}`}
                    className="flex items-center px-6 py-3 hover:bg-slate-50 transition-colors"
                  >
                    {inner}
                  </Link>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
