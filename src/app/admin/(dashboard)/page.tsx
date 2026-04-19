import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Car, Users, CheckCircle, Clock, XCircle, ArrowRight, Plus, Gauge, Fuel, CalendarDays, Eye, TrendingUp, Handshake, Banknote, Tag, Star, BarChart2, ShoppingCart } from 'lucide-react'
import SalesChart from '@/components/admin/SalesChart'
import type { MonthSalesData } from '@/components/admin/SalesChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { formatPrice, formatMileage, fuelTypeLabel, vehicleStatusLabel } from '@/lib/utils'

export const metadata: Metadata = { title: 'Dashboard' }

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Máj', 'Jún', 'Júl', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
const MONTH_FULL = ['Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún', 'Júl', 'August', 'September', 'Október', 'November', 'December']

async function getSalesStats() {
  const now = new Date()
  const year = now.getFullYear()
  const monthIdx = now.getMonth() // 0-indexed
  const monthStart = new Date(year, monthIdx, 1)
  const monthEnd = new Date(year, monthIdx + 1, 0, 23, 59, 59, 999)
  const yearStart = new Date(year, 0, 1)

  const [thisMonthVehicles, yearSoldVehicles, thisMonthAdded] = await Promise.all([
    prisma.vehicle.findMany({
      where: { soldAt: { gte: monthStart, lte: monthEnd } },
      select: { soldPrice: true, price: true, isConsignment: true, commissionAmount: true },
    }),
    prisma.vehicle.findMany({
      where: { soldAt: { gte: yearStart } },
      select: { soldAt: true, soldPrice: true, price: true, isConsignment: true, commissionAmount: true },
    }),
    prisma.vehicle.count({ where: { createdAt: { gte: monthStart, lte: monthEnd } } }),
  ])

  const thisMonthSold = thisMonthVehicles.length
  const thisMonthRevenue = thisMonthVehicles.reduce((s, v) => s + Number(v.soldPrice ?? v.price ?? 0), 0)
  const thisMonthAvgPrice = thisMonthSold > 0 ? thisMonthRevenue / thisMonthSold : 0
  const thisMonthConsignmentSold = thisMonthVehicles.filter(v => v.isConsignment).length
  const thisMonthConsignmentRevenue = thisMonthVehicles.filter(v => v.isConsignment).reduce((s, v) => s + Number(v.commissionAmount ?? 0), 0)

  const monthlyData: MonthSalesData[] = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    name: MONTH_SHORT[i],
    fullName: MONTH_FULL[i],
    sold: 0,
    revenue: 0,
    consignmentSold: 0,
    consignmentRevenue: 0,
  }))

  for (const v of yearSoldVehicles) {
    if (!v.soldAt) continue
    const m = v.soldAt.getMonth()
    monthlyData[m].sold++
    monthlyData[m].revenue += Number(v.soldPrice ?? v.price ?? 0)
    if (v.isConsignment) {
      monthlyData[m].consignmentSold++
      monthlyData[m].consignmentRevenue += Number(v.commissionAmount ?? 0)
    }
  }

  const yearTotalSold = monthlyData.reduce((s, m) => s + m.sold, 0)
  const yearTotalRevenue = monthlyData.reduce((s, m) => s + m.revenue, 0)
  const yearConsignmentRevenue = monthlyData.reduce((s, m) => s + m.consignmentRevenue, 0)
  const bestMonth = monthlyData.reduce((best, m) => m.sold > best.sold ? m : best, monthlyData[0])
  const activeMonthsCount = monthlyData.slice(0, monthIdx + 1).filter(m => m.sold > 0).length
  const avgSoldPerMonth = activeMonthsCount > 0 ? yearTotalSold / activeMonthsCount : 0
  const prevMonthData = monthIdx > 0 ? monthlyData[monthIdx - 1] : null

  return {
    thisMonthSold,
    thisMonthRevenue,
    thisMonthAvgPrice,
    thisMonthConsignmentSold,
    thisMonthConsignmentRevenue,
    thisMonthAdded,
    monthlyData,
    yearTotalSold,
    yearTotalRevenue,
    yearConsignmentRevenue,
    bestMonth,
    activeMonthsCount,
    avgSoldPerMonth,
    prevMonthData,
    currentMonth: monthIdx + 1,
    currentMonthName: MONTH_FULL[monthIdx],
    year,
  }
}

async function getStats() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [totalVehicles, available, reserved, sold, totalUsers, recentVehicles, topViewsRaw, totalViews, sourceBreakdown, consignmentActive, consignmentSold, consignmentRevenue] = await Promise.all([
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
    prisma.vehicle.count({ where: { isConsignment: true, status: { not: 'SOLD' } } }),
    prisma.vehicle.count({ where: { isConsignment: true, status: 'SOLD' } }),
    prisma.vehicle.aggregate({ where: { isConsignment: true, status: 'SOLD' }, _sum: { commissionAmount: true } }),
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

  return { totalVehicles, available, reserved, sold, totalUsers, recentVehicles, topVehicles, totalViews, sourceBreakdown, consignmentActive, consignmentSold, consignmentRevenue: Number(consignmentRevenue._sum.commissionAmount ?? 0) }
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
  const [stats, salesStats] = await Promise.all([getStats(), getSalesStats()])
  const { totalVehicles, available, reserved, sold, totalUsers, recentVehicles, topVehicles, totalViews, sourceBreakdown, consignmentActive, consignmentSold, consignmentRevenue } = stats
  const {
    thisMonthSold, thisMonthRevenue, thisMonthAvgPrice,
    thisMonthConsignmentSold, thisMonthConsignmentRevenue, thisMonthAdded,
    monthlyData, yearTotalSold, yearTotalRevenue, yearConsignmentRevenue,
    bestMonth, activeMonthsCount, avgSoldPerMonth, prevMonthData,
    currentMonth, currentMonthName, year,
  } = salesStats

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
          <Card key={card.label} className="hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 cursor-default">
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

      {/* ── Tento mesiac ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="h-4 w-4 text-orange-500" />
          <h2 className="font-semibold text-slate-800 text-base">
            Štatistiky — {currentMonthName} {year}
          </h2>
          {prevMonthData && prevMonthData.sold > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-1 ${
              thisMonthSold >= prevMonthData.sold
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-600'
            }`}>
              {thisMonthSold >= prevMonthData.sold ? '↑' : '↓'}
              {' '}{Math.abs(thisMonthSold - prevMonthData.sold)} vs. {prevMonthData.fullName}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            {
              label: 'Predané vozidlá',
              value: thisMonthSold,
              sub: thisMonthSold === 0 ? 'žiadne predaje' : `${thisMonthSold} ${thisMonthSold === 1 ? 'vozidlo' : 'vozidiel'}`,
              icon: ShoppingCart,
              color: 'text-orange-600',
              bg: 'bg-orange-50',
            },
            {
              label: 'Tržby',
              value: thisMonthRevenue > 0 ? new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(thisMonthRevenue) : '—',
              sub: 'celkový obrat',
              icon: Banknote,
              color: 'text-green-600',
              bg: 'bg-green-50',
            },
            {
              label: 'Priemerná cena',
              value: thisMonthAvgPrice > 0 ? new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(thisMonthAvgPrice) : '—',
              sub: 'za predané vozidlo',
              icon: Tag,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
            },
            {
              label: 'Komisné predaje',
              value: thisMonthConsignmentSold,
              sub: thisMonthConsignmentSold === 0 ? 'žiadne' : `z ${thisMonthSold} celkových`,
              icon: Handshake,
              color: 'text-purple-600',
              bg: 'bg-purple-50',
            },
            {
              label: 'Príjmy z komisií',
              value: thisMonthConsignmentRevenue > 0 ? new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(thisMonthConsignmentRevenue) : '—',
              sub: 'provízne odmeny',
              icon: TrendingUp,
              color: 'text-violet-600',
              bg: 'bg-violet-50',
            },
            {
              label: 'Nové vozidlá',
              value: thisMonthAdded,
              sub: 'pridaných do ponuky',
              icon: Plus,
              color: 'text-slate-600',
              bg: 'bg-slate-100',
            },
          ].map((card) => (
            <Card key={card.label} className="hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 cursor-default">
              <CardContent className="p-4">
                <div className={`inline-flex p-1.5 rounded-lg ${card.bg} mb-2`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
                <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
                <div className="text-slate-700 text-xs font-medium mt-0.5">{card.label}</div>
                <div className="text-slate-400 text-xs mt-0.5 truncate">{card.sub}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Ročný prehľad ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2 hover:shadow-md hover:border-slate-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-orange-500" />
              Predaje podľa mesiaca
            </CardTitle>
            <p className="text-xs text-slate-500">{year} · {yearTotalSold} predaných vozidiel celkom</p>
          </CardHeader>
          <CardContent>
            <SalesChart data={monthlyData} currentMonth={currentMonth} year={year} />
          </CardContent>
        </Card>

        {/* Yearly text stats */}
        <Card className="hover:shadow-md hover:border-slate-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Star className="h-4 w-4 text-orange-500" />
              Ročné štatistiky {year}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                {
                  label: 'Celkový predaj',
                  value: `${yearTotalSold} vozidiel`,
                  icon: ShoppingCart,
                  color: 'text-orange-500',
                },
                {
                  label: 'Celkové tržby',
                  value: new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(yearTotalRevenue),
                  icon: Banknote,
                  color: 'text-green-600',
                },
                {
                  label: 'Príjmy z komisií',
                  value: new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(yearConsignmentRevenue),
                  icon: Handshake,
                  color: 'text-purple-600',
                },
                {
                  label: 'Priem. predaje / mesiac',
                  value: activeMonthsCount > 0 ? `${avgSoldPerMonth.toFixed(1)} vozidiel` : '—',
                  icon: TrendingUp,
                  color: 'text-blue-500',
                },
                {
                  label: 'Aktívne mesiace',
                  value: `${activeMonthsCount} / ${currentMonth}`,
                  icon: CalendarDays,
                  color: 'text-slate-500',
                },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <row.icon className={`h-3.5 w-3.5 shrink-0 ${row.color}`} />
                    <span className="text-xs text-slate-500 truncate">{row.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800 shrink-0">{row.value}</span>
                </div>
              ))}
            </div>

            {bestMonth.sold > 0 && (
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs text-orange-600 font-semibold">
                  <Star className="h-3.5 w-3.5" />
                  Najlepší mesiac
                </div>
                <p className="text-base font-bold text-slate-900">{bestMonth.fullName}</p>
                <p className="text-sm text-slate-600">
                  {bestMonth.sold} {bestMonth.sold === 1 ? 'vozidlo' : 'vozidiel'}
                  {bestMonth.revenue > 0 && (
                    <span className="ml-2 font-semibold text-orange-600">
                      {new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(bestMonth.revenue)}
                    </span>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Consignment stats */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex p-2 rounded-lg bg-purple-50">
              <Handshake className="h-5 w-5 text-purple-600" />
            </div>
            <div className="font-semibold text-slate-900">Komisný predaj</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-slate-900">{consignmentActive}</div>
              <div className="text-slate-500 text-sm mt-0.5">Aktívne</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{consignmentSold}</div>
              <div className="text-slate-500 text-sm mt-0.5">Predané</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-700">
                {new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(consignmentRevenue)}
              </div>
              <div className="text-slate-500 text-sm mt-0.5">Príjmy z provízií</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="analytics">
        {/* Source breakdown */}
        <Card className="hover:shadow-md hover:border-slate-300">
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
        <Card className="lg:col-span-2 hover:shadow-md hover:border-slate-300">
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
                    <Link key={vehicleId} href={href} className="flex hover:bg-orange-50/40 hover:border-l-[3px] hover:border-l-orange-400 transition-all duration-150">
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
                    className="flex items-center px-6 py-3 hover:bg-orange-50/40 hover:border-l-[3px] hover:border-l-orange-400 transition-all duration-150"
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
