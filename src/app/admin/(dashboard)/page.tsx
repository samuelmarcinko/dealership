import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Car, Users, CheckCircle, Clock, XCircle, ArrowRight, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { formatPrice, vehicleStatusLabel } from '@/lib/utils'

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
                return (
                  <Link
                    key={v.id}
                    href={`/admin/vehicles/${v.id}`}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{v.title}</p>
                      <p className="text-slate-400 text-xs">{v.year} · {v.make}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusVariant}>{vehicleStatusLabel(v.status)}</Badge>
                      <span className="font-semibold text-slate-900 text-sm">{formatPrice(v.price)}</span>
                    </div>
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
