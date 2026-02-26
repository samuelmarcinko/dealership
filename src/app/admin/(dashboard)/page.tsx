import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Car, Users, CheckCircle, Clock, XCircle, ArrowRight, Plus, Gauge, Fuel, CalendarDays, Eye, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { formatPrice, formatMileage, fuelTypeLabel, vehicleStatusLabel } from '@/lib/utils'

export const metadata: Metadata = { title: 'Dashboard' }

async function getStats() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [totalVehicles, available, reserved, sold, totalUsers, recentVehicles, topViewsRaw, totalViews, sourceBreakdown] = await Promise.all([
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
    prisma.vehicleView.groupBy({
      by: ['vehicleId'],
      _count: { id: true },
      where: { viewedAt: { gte: thirtyDaysAgo } },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
    prisma.vehicleView.count({ where: { viewedAt: { gte: thirtyDaysAgo } } }),
    prisma.vehicleView.groupBy({
      by: ['source'],
      _count: { id: true },
      where: { viewedAt: { gte: thirtyDaysAgo } },
      orderBy: { _count: { id: 'desc' } },
    }),
  ])

  // Fetch vehicle details for top viewed
  const topVehicleIds = topViewsRaw.map((r) => r.vehicleId)
  const topVehicleDetails = topVehicleIds.length > 0
    ? await prisma.vehicle.findMany({
        where: { id: { in: topVehicleIds } },
        select: { id: true, title: true, make: true, slug: true, images: { where: { isPrimary: true }, take: 1 } },
      })
    : []

  const topVehicles = topViewsRaw.map((r) => ({
    vehicleId: r.vehicleId,
    count: r._count.id,
    vehicle: topVehicleDetails.find((v) => v.id === r.vehicleId) ?? null,
  }))

  return { totalVehicles, available, reserved, sold, totalUsers, recentVehicles, topVehicles, totalViews, sourceBreakdown }
}

const sourceLabel: Record<string, string> = {
  direct: 'Priame',
  google: 'Google',
  facebook: 'Facebook',
  instagram: 'Instagram',
  internal: 'Interné',
  other: 'Ostatné',
}

const sourceBadgeClass: Record<string, string> = {
  direct: 'bg-slate-100 text-slate-700',
  google: 'bg-blue-100 text-blue-700',
  facebook: 'bg-indigo-100 text-indigo-700',
  instagram: 'bg-pink-100 text-pink-700',
  internal: 'bg-orange-100 text-orange-700',
  other: 'bg-gray-100 text-gray-700',
}

export default async function DashboardPage() {
  const { totalVehicles, available, reserved, sold, totalUsers, recentVehicles, topVehicles, totalViews, sourceBreakdown } = await getStats()

  const statCards = [
    { label: 'Celkom vozidiel', value: totalVehicles, icon: Car, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Dostupné', value: available, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Rezervované', value: reserved, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Predané', value: sold, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Používatelia', value: totalUsers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  const maxViews = topVehicles[0]?.count ?? 1

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

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Source breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              Zdroje návštevnosti
            </CardTitle>
            <p className="text-xs text-slate-500">Posledných 30 dní · {totalViews} zobrazení</p>
          </CardHeader>
          <CardContent>
            {totalViews === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">Zatiaľ žiadne dáta</p>
            ) : (
              <div className="space-y-2">
                {sourceBreakdown.map((s) => (
                  <div key={s.source} className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sourceBadgeClass[s.source] ?? 'bg-gray-100 text-gray-700'}`}>
                      {sourceLabel[s.source] ?? s.source}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">{s._count.id}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top 10 viewed */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4 text-orange-500" />
              Najpopulárnejšie vozidlá
            </CardTitle>
            <p className="text-xs text-slate-500">Posledných 30 dní</p>
          </CardHeader>
          <CardContent className="p-0">
            {topVehicles.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Zatiaľ žiadne dáta</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {topVehicles.map(({ vehicleId, count, vehicle }) => {
                  const thumb = vehicle?.images[0]?.url ?? null
                  const title = vehicle?.title ?? vehicleId
                  const href = vehicle ? `/admin/vehicles/${vehicleId}` : null
                  const barWidth = Math.round((count / maxViews) * 100)

                  const inner = (
                    <div className="flex items-center gap-3 w-full min-w-0 px-6 py-3">
                      <div className="shrink-0 w-12 h-9 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                        {thumb ? (
                          <Image src={thumb} alt={title} width={48} height={36} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="h-4 w-4 text-slate-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{title}</p>
                        <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-400 rounded-full"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-1 text-slate-600 text-sm font-semibold">
                        <Eye className="h-3.5 w-3.5 text-slate-400" />
                        {count}
                      </div>
                    </div>
                  )

                  return href ? (
                    <Link key={vehicleId} href={href} className="flex hover:bg-slate-50 transition-colors">
                      {inner}
                    </Link>
                  ) : (
                    <div key={vehicleId} className="flex">
                      {inner}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
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
