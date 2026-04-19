import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  User, Building2, Phone, Mail, Car, Handshake, ExternalLink,
  Calendar, Gauge, Fuel, Tag, TrendingUp, Pencil, CheckCircle2, Clock,
} from 'lucide-react'
import { customerDisplayName } from '@/lib/customer'
import { formatPrice, vehicleStatusLabel, fuelTypeLabel, formatMileage } from '@/lib/utils'
import SellVehicleButton from '@/components/admin/SellVehicleButton'
import PrintLabelButton from '@/components/admin/PrintLabelButton'

export const metadata: Metadata = { title: 'Komisný predaj' }

export default async function ConsignorsPage() {
  const consignors = await prisma.customer.findMany({
    where: { consignedVehicles: { some: {} } },
    orderBy: { createdAt: 'desc' },
    include: {
      consignedVehicles: {
        orderBy: { createdAt: 'desc' },
        include: { images: { where: { isPrimary: true }, take: 1 } },
      },
    },
  })

  const totalVehicles = consignors.reduce((sum, c) => sum + c.consignedVehicles.length, 0)
  const activeVehicles = consignors.reduce(
    (sum, c) => sum + c.consignedVehicles.filter(v => v.status !== 'SOLD').length, 0
  )
  const soldVehicles = consignors.reduce(
    (sum, c) => sum + c.consignedVehicles.filter(v => v.status === 'SOLD').length, 0
  )
  const totalEarnings = consignors.reduce(
    (sum, c) => sum + c.consignedVehicles.reduce(
      (s, v) => s + (v.commissionAmount != null ? Number(v.commissionAmount) : 0), 0
    ), 0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Komisný predaj</h1>
          <p className="text-slate-500 text-sm mt-1">
            {consignors.length} {consignors.length === 1 ? 'komitent' : consignors.length < 5 ? 'komitenti' : 'komitentov'} · {totalVehicles} vozidiel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/customers/new">
              <User className="h-4 w-4 mr-2" />
              Nový zákazník
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/customers">
              <User className="h-4 w-4 mr-2" />
              Zákazníci
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats strip */}
      {consignors.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Komitentov', value: consignors.length, icon: User, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
            { label: 'Aktívnych vozidiel', value: activeVehicles, icon: Car, color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
            { label: 'Predaných vozidiel', value: soldVehicles, icon: CheckCircle2, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-100' },
            { label: 'Celkové príjmy z provízií', value: formatPrice(totalEarnings), icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
          ].map(s => (
            <Card key={s.label} className={`border ${s.bg}`}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Consignors list */}
      {consignors.length === 0 ? (
        <Card>
          <CardContent>
            <div className="py-16 text-center text-slate-400 space-y-3">
              <Handshake className="h-12 w-12 mx-auto opacity-25" />
              <p className="text-base font-semibold text-slate-500">Zatiaľ žiadni komitenti</p>
              <p className="text-sm max-w-xs mx-auto text-slate-400">
                Komitent sa zobrazí tu, keď zákazníkovi priradíte vozidlo v komisnom predaji.
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Link href="/admin/customers/new">Nový zákazník</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/admin/vehicles/new">Nové vozidlo</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {consignors.map((c) => {
            const cActive = c.consignedVehicles.filter(v => v.status !== 'SOLD').length
            const cSold = c.consignedVehicles.filter(v => v.status === 'SOLD').length
            const cEarnings = c.consignedVehicles.reduce(
              (s, v) => s + (v.commissionAmount != null ? Number(v.commissionAmount) : 0), 0
            )
            return (
              <Card key={c.id} className="overflow-hidden">
                {/* Consignor header */}
                <div className="flex items-center gap-4 px-6 py-4 bg-slate-50 border-b border-slate-100">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                    c.type === 'COMPANY' ? 'bg-purple-100 border border-purple-200' : 'bg-blue-100 border border-blue-200'
                  }`}>
                    {c.type === 'COMPANY'
                      ? <Building2 className="h-5 w-5 text-purple-600" />
                      : <User className="h-5 w-5 text-blue-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      <span className="font-bold text-slate-900 text-base">{customerDisplayName(c)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        c.type === 'COMPANY' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {c.type === 'COMPANY' ? 'Firma' : 'Fyzická osoba'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      {c.phone && (
                        <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors">
                          <Phone className="h-3.5 w-3.5" />{c.phone}
                        </a>
                      )}
                      {c.email && (
                        <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors">
                          <Mail className="h-3.5 w-3.5" />{c.email}
                        </a>
                      )}
                    </div>
                  </div>
                  {/* Per-consignor stats */}
                  <div className="hidden sm:flex items-center gap-5 shrink-0">
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">{cActive}</p>
                      <p className="text-xs text-slate-400">aktívnych</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-500">{cSold}</p>
                      <p className="text-xs text-slate-400">predaných</p>
                    </div>
                    {cEarnings > 0 && (
                      <div className="text-center">
                        <p className="text-lg font-bold text-purple-600">{formatPrice(cEarnings)}</p>
                        <p className="text-xs text-slate-400">príjmy</p>
                      </div>
                    )}
                  </div>
                  <Button asChild variant="outline" size="sm" className="shrink-0">
                    <Link href={`/admin/customers/${c.id}`}>
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      Profil
                    </Link>
                  </Button>
                </div>

                {/* Vehicle cards */}
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                    {c.consignedVehicles.map((v) => {
                      const statusVariant = v.status === 'AVAILABLE' ? 'success' : v.status === 'RESERVED' ? 'warning' : 'error'
                      const isSold = v.status === 'SOLD'
                      return (
                        <div
                          key={v.id}
                          className={`rounded-xl border p-3 space-y-3 transition-colors ${
                            isSold ? 'bg-slate-50 border-slate-200 opacity-80' : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {/* Image + title */}
                          <div className="flex gap-3">
                            <div className="relative w-24 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                              {v.images[0] ? (
                                <Image src={v.images[0].url} alt={v.title} fill className="object-cover" sizes="96px" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Car className="h-5 w-5 text-slate-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">{v.title}</p>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
                                <span className="flex items-center gap-0.5 text-xs text-slate-500">
                                  <Car className="h-3 w-3" />{v.year}
                                </span>
                                <span className="flex items-center gap-0.5 text-xs text-slate-500">
                                  <Gauge className="h-3 w-3" />{formatMileage(v.mileage)}
                                </span>
                                <span className="flex items-center gap-0.5 text-xs text-slate-500">
                                  <Fuel className="h-3 w-3" />{fuelTypeLabel(v.fuelType)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Status + price info */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <Badge variant={statusVariant}>{vehicleStatusLabel(v.status)}</Badge>
                              <span className="flex items-center gap-1 text-sm font-bold text-slate-800">
                                <Tag className="h-3.5 w-3.5 text-slate-400" />
                                {formatPrice(v.price)}
                              </span>
                            </div>
                            {v.commissionRate != null && (
                              <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 rounded-md px-2.5 py-1.5">
                                <span>Provízia</span>
                                <span className="font-semibold text-slate-700">{Number(v.commissionRate)} %</span>
                              </div>
                            )}
                            {isSold && (
                              <div className="space-y-1 bg-purple-50 border border-purple-100 rounded-md px-2.5 py-2">
                                {v.soldAt && (
                                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <Calendar className="h-3 w-3 text-purple-400" />
                                    Predané {new Date(v.soldAt).toLocaleDateString('sk-SK')}
                                  </div>
                                )}
                                {v.commissionAmount != null && (
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700">
                                    <TrendingUp className="h-3 w-3" />
                                    Odmena: {formatPrice(v.commissionAmount)}
                                  </div>
                                )}
                              </div>
                            )}
                            {!isSold && v.status === 'RESERVED' && (
                              <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-md px-2.5 py-1.5">
                                <Clock className="h-3 w-3" />
                                Rezervované — čaká na predaj
                              </div>
                            )}
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
                            <Button asChild variant="outline" size="sm" className="h-8 text-xs flex-1">
                              <Link href={`/admin/vehicles/${v.id}`}>
                                <Pencil className="h-3 w-3 mr-1" />
                                Upraviť
                              </Link>
                            </Button>
                            <PrintLabelButton vehicleId={v.id} />
                            {!isSold && (
                              <SellVehicleButton
                                vehicleId={v.id}
                                vehicleTitle={v.title}
                                listedPrice={Number(v.price)}
                                salePrice={v.salePrice != null ? Number(v.salePrice) : null}
                                isConsignment={v.isConsignment}
                                vehicleCommissionRate={v.commissionRate != null ? Number(v.commissionRate) : null}
                                size="sm"
                              />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
