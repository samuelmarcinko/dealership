import React from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice, fuelTypeLabel } from '@/lib/utils'
import { customerDisplayName } from '@/lib/customer'
import { TrendingUp, Car, Euro, Calendar, User, Building2 } from 'lucide-react'
import RestoreVehicleButton from '@/components/admin/RestoreVehicleButton'

export const metadata: Metadata = { title: 'Predané vozidlá' }

export default async function SoldVehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ make?: string; from?: string; to?: string }>
}) {
  const sp = await searchParams
  const makeFilter = sp.make?.trim() || undefined
  const fromFilter = sp.from ? new Date(sp.from) : undefined
  const toFilter = sp.to ? new Date(sp.to + 'T23:59:59') : undefined

  const [vehicles, makes] = await Promise.all([
    prisma.vehicle.findMany({
      where: {
        status: 'SOLD',
        ...(makeFilter && { make: { equals: makeFilter, mode: 'insensitive' } }),
        ...(fromFilter || toFilter
          ? { soldAt: { ...(fromFilter && { gte: fromFilter }), ...(toFilter && { lte: toFilter }) } }
          : {}),
      },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        buyer: true,
      },
      orderBy: { soldAt: 'desc' },
    }),
    prisma.vehicle.findMany({
      where: { status: 'SOLD' },
      select: { make: true },
      distinct: ['make'],
      orderBy: { make: 'asc' },
    }),
  ])

  const totalRevenue = vehicles.reduce((s, v) => s + Number(v.soldPrice ?? v.price), 0)
  const avgPrice = vehicles.length > 0 ? totalRevenue / vehicles.length : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Predané vozidlá</h1>
        <p className="text-slate-500 text-sm mt-1">História predaných vozidiel</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Predaných vozidiel', value: vehicles.length.toString(), icon: Car, color: 'text-slate-600 bg-slate-100' },
          { label: 'Tržby celkom', value: formatPrice(totalRevenue), icon: Euro, color: 'text-green-600 bg-green-50' },
          { label: 'Priemerná cena', value: avgPrice > 0 ? formatPrice(avgPrice) : '—', icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
          { label: 'Tento mesiac', value: vehicles.filter((v) => {
              const now = new Date()
              const d = v.soldAt ? new Date(v.soldAt) : null
              return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
            }).length.toString(), icon: Calendar, color: 'text-orange-600 bg-orange-50' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900 leading-tight">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <form className="flex flex-wrap gap-x-6 gap-y-3 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">Značka</label>
              <select
                name="make"
                defaultValue={makeFilter ?? ''}
                className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">Všetky značky</option>
                {makes.map((m) => (
                  <option key={m.make} value={m.make}>{m.make}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">Od dátumu</label>
              <input
                type="date"
                name="from"
                defaultValue={sp.from ?? ''}
                className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">Do dátumu</label>
              <input
                type="date"
                name="to"
                defaultValue={sp.to ?? ''}
                className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <button
              type="submit"
              className="h-9 px-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-md transition-colors"
            >
              Filtrovať
            </button>
            {(makeFilter || fromFilter || toFilter) && (
              <Link
                href="/admin/sold"
                className="h-9 px-4 border border-slate-300 hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-md transition-colors flex items-center"
              >
                Zrušiť filter
              </Link>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {vehicles.length} predaných vozidiel
            {(makeFilter || fromFilter || toFilter) && <span className="text-slate-400 font-normal ml-2">(filtrované)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {vehicles.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Car className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Žiadne predané vozidlá{makeFilter ? ` so značkou ${makeFilter}` : ''}.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wide">
                    <th className="text-left px-6 py-3 font-medium">Vozidlo</th>
                    <th className="text-left px-4 py-3 font-medium">Palivo / Rok</th>
                    <th className="text-left px-4 py-3 font-medium">Inzerovaná cena</th>
                    <th className="text-left px-4 py-3 font-medium">Predajná cena</th>
                    <th className="text-left px-4 py-3 font-medium">Dátum predaja</th>
                    <th className="text-left px-4 py-3 font-medium">Predané — zákazník</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {vehicles.map((v) => {
                    const discount = v.soldPrice
                      ? Number(v.price) - Number(v.soldPrice)
                      : 0
                    return (
                      <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-14 h-10 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                              {v.images[0] ? (
                                <Image src={v.images[0].url} alt={v.title} fill className="object-cover" sizes="56px" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <Car className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{v.title}</p>
                              {v.variant && <p className="text-xs text-slate-400">{v.variant}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          <p>{fuelTypeLabel(v.fuelType)}</p>
                          <p className="text-xs text-slate-400">{v.year}</p>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{formatPrice(v.price)}</td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-900">{v.soldPrice ? formatPrice(v.soldPrice) : '—'}</p>
                          {discount > 0 && (
                            <p className="text-xs text-red-500">-{formatPrice(discount)}</p>
                          )}
                          {discount < 0 && (
                            <p className="text-xs text-green-500">+{formatPrice(Math.abs(discount))}</p>
                          )}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {v.soldAt
                            ? new Date(v.soldAt).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' })
                            : '—'}
                        </td>
                        <td className="px-4 py-4">
                          {v.buyer ? (
                            <Link href={`/admin/customers/${v.buyer.id}`} className="flex items-center gap-2 hover:text-orange-600 transition-colors group">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                v.buyer.type === 'COMPANY' ? 'bg-purple-100' : 'bg-blue-100'
                              }`}>
                                {v.buyer.type === 'COMPANY'
                                  ? <Building2 className="h-3.5 w-3.5 text-purple-600" />
                                  : <User className="h-3.5 w-3.5 text-blue-600" />
                                }
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 text-sm group-hover:text-orange-600">{customerDisplayName(v.buyer)}</p>
                                <Badge className={`text-xs border-0 ${v.buyer.type === 'COMPANY' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {v.buyer.type === 'COMPANY' ? 'Firma' : 'Osoba'}
                                </Badge>
                              </div>
                            </Link>
                          ) : (
                            <span className="text-slate-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <RestoreVehicleButton vehicleId={v.id} vehicleTitle={v.title} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
