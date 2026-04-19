import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ChevronLeft, ShoppingBag, Calendar, Handshake, Car, Gauge, Fuel, Tag, TrendingUp, Pencil } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import CustomerForm from '@/components/admin/CustomerForm'
import SellVehicleButton from '@/components/admin/SellVehicleButton'
import PrintLabelButton from '@/components/admin/PrintLabelButton'
import { customerDisplayName } from '@/lib/customer'
import { formatPrice, vehicleStatusLabel, fuelTypeLabel, formatMileage } from '@/lib/utils'

export const metadata: Metadata = { title: 'Upraviť zákazníka' }

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      vehicles: {
        where: { status: 'SOLD' },
        include: { images: { where: { isPrimary: true }, take: 1 } },
        orderBy: { soldAt: 'desc' },
      },
      consignedVehicles: {
        include: { images: { where: { isPrimary: true }, take: 1 } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!customer) notFound()

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <Link href="/admin/customers" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Späť na zákazníkov
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">{customerDisplayName(customer)}</h1>
        <p className="text-slate-500 text-sm mt-1">
          {customer.type === 'COMPANY' ? 'Firma / Živnostník' : 'Fyzická osoba'}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_460px] gap-6 items-start">
        {/* Left — edit form */}
        <CustomerForm
          initialData={{
            id: customer.id,
            type: customer.type,
            firstName: customer.firstName,
            lastName: customer.lastName,
            companyName: customer.companyName,
            ico: customer.ico,
            dic: customer.dic,
            icDph: customer.icDph,
            phone: customer.phone,
            email: customer.email,
            address: customer.address,
            note: customer.note,
          }}
        />

        {/* Right — purchase history + consignment history */}
        <div className="xl:sticky xl:top-6 space-y-4">
          {/* Purchase history */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-orange-500" />
                <CardTitle className="text-base font-semibold">
                  Kúpna história
                  {customer.vehicles.length > 0 && (
                    <span className="ml-1.5 text-sm font-normal text-slate-400">({customer.vehicles.length})</span>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            {customer.vehicles.length === 0 ? (
              <CardContent>
                <p className="text-sm text-slate-400 text-center py-6">Zatiaľ žiadne zakúpené vozidlá.</p>
              </CardContent>
            ) : (
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {customer.vehicles.map((v) => (
                    <div key={v.id} className="px-5 py-4 space-y-3">
                      <div className="flex gap-3">
                        <div className="relative w-20 h-14 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                          {v.images[0] ? (
                            <Image src={v.images[0].url} alt={v.title} fill className="object-cover" sizes="80px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Car className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-sm leading-snug">{v.title}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Car className="h-3 w-3" />{v.year}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Gauge className="h-3 w-3" />{formatMileage(v.mileage)}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Fuel className="h-3 w-3" />{fuelTypeLabel(v.fuelType)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 bg-slate-50 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-3">
                          {v.soldAt && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Calendar className="h-3 w-3" />
                              {new Date(v.soldAt).toLocaleDateString('sk-SK')}
                            </span>
                          )}
                          {v.soldPrice && (
                            <span className="flex items-center gap-1 text-xs font-bold text-orange-600">
                              <Tag className="h-3 w-3" />
                              {formatPrice(v.soldPrice)}
                            </span>
                          )}
                        </div>
                        <Link href={`/admin/sold`} className="text-xs text-orange-500 hover:text-orange-700 font-medium shrink-0">
                          Predané vozidlá →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Consigned vehicles */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Handshake className="h-4 w-4 text-purple-500" />
                  <CardTitle className="text-base font-semibold">
                    Komisné vozidlá
                    {customer.consignedVehicles.length > 0 && (
                      <span className="ml-1.5 text-sm font-normal text-slate-400">({customer.consignedVehicles.length})</span>
                    )}
                  </CardTitle>
                </div>
                {customer.consignedVehicles.some(v => v.status === 'SOLD' && v.commissionAmount != null) && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded-md">
                    <TrendingUp className="h-3 w-3" />
                    {formatPrice(
                      customer.consignedVehicles
                        .filter(v => v.commissionAmount != null)
                        .reduce((sum, v) => sum + Number(v.commissionAmount), 0)
                    )}
                  </span>
                )}
              </div>
            </CardHeader>
            {customer.consignedVehicles.length === 0 ? (
              <CardContent>
                <p className="text-sm text-slate-400 text-center py-6">Zákazník nemá žiadne komisné vozidlá.</p>
              </CardContent>
            ) : (
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {customer.consignedVehicles.map((v) => {
                    const statusVariant = v.status === 'AVAILABLE' ? 'success' : v.status === 'RESERVED' ? 'warning' : 'error'
                    return (
                      <div key={v.id} className="px-5 py-4 space-y-3">
                        <div className="flex gap-3">
                          <div className="relative w-20 h-14 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                            {v.images[0] ? (
                              <Image src={v.images[0].url} alt={v.title} fill className="object-cover" sizes="80px" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Car className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 text-sm leading-snug">{v.title}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                              <span className="flex items-center gap-1 text-xs text-slate-500">
                                <Car className="h-3 w-3" />{v.year}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-slate-500">
                                <Gauge className="h-3 w-3" />{formatMileage(v.mileage)}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-slate-500">
                                <Fuel className="h-3 w-3" />{fuelTypeLabel(v.fuelType)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg px-3 py-2 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge variant={statusVariant}>{vehicleStatusLabel(v.status)}</Badge>
                              <span className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                                <Tag className="h-3 w-3" />{formatPrice(v.price)}
                              </span>
                              {v.commissionRate != null && (
                                <span className="text-xs text-slate-500">Provízia: {Number(v.commissionRate)} %</span>
                              )}
                            </div>
                          </div>
                          {v.status === 'SOLD' && (v.soldAt || v.commissionAmount != null) && (
                            <div className="flex items-center gap-3 flex-wrap pt-1 border-t border-slate-200">
                              {v.soldAt && (
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                  <Calendar className="h-3 w-3" />
                                  Predané {new Date(v.soldAt).toLocaleDateString('sk-SK')}
                                </span>
                              )}
                              {v.commissionAmount != null && (
                                <span className="flex items-center gap-1 text-xs font-bold text-purple-700">
                                  <TrendingUp className="h-3 w-3" />
                                  Odmena: {formatPrice(v.commissionAmount)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {v.status !== 'SOLD' && (
                          <div className="flex items-center gap-2">
                            <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                              <Link href={`/admin/vehicles/${v.id}`}>
                                <Pencil className="h-3 w-3 mr-1" />
                                Upraviť
                              </Link>
                            </Button>
                            <PrintLabelButton vehicleId={v.id} />
                            <SellVehicleButton
                              vehicleId={v.id}
                              vehicleTitle={v.title}
                              listedPrice={Number(v.price)}
                              salePrice={v.salePrice != null ? Number(v.salePrice) : null}
                              isConsignment={v.isConsignment}
                              vehicleCommissionRate={v.commissionRate != null ? Number(v.commissionRate) : null}
                              size="sm"
                            />
                          </div>
                        )}
                        {v.status === 'SOLD' && (
                          <div className="flex items-center gap-2">
                            <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                              <Link href={`/admin/vehicles/${v.id}`}>
                                <Pencil className="h-3 w-3 mr-1" />
                                Zobraziť detail
                              </Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
