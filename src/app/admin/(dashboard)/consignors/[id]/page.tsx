import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ChevronLeft, Car, Calendar, Handshake } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import CustomerForm from '@/components/admin/CustomerForm'
import { customerDisplayName } from '@/lib/customer'
import { formatPrice, vehicleStatusLabel } from '@/lib/utils'

export const metadata: Metadata = { title: 'Upraviť komitenta' }

export default async function EditConsignorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
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
        <Link href="/admin/consignors" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Späť na komitentov
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">{customerDisplayName(customer)}</h1>
        <p className="text-slate-500 text-sm mt-1">Komitent — {customer.type === 'COMPANY' ? 'Firma / Živnostník' : 'Fyzická osoba'}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
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
          isConsignor
        />

        <div className="xl:sticky xl:top-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Handshake className="h-4 w-4 text-purple-500" />
                <CardTitle className="text-base font-semibold">
                  Komisné vozidlá
                  {customer.consignedVehicles.length > 0 && (
                    <span className="ml-1.5 text-sm font-normal text-slate-400">({customer.consignedVehicles.length})</span>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            {customer.consignedVehicles.length === 0 ? (
              <CardContent>
                <p className="text-sm text-slate-400 text-center py-6">Komitent nemá žiadne komisné vozidlá.</p>
                <div className="text-center">
                  <Link href="/admin/vehicles/new" className="text-sm text-orange-500 hover:underline">
                    Pridať vozidlo →
                  </Link>
                </div>
              </CardContent>
            ) : (
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {customer.consignedVehicles.map((v) => {
                    const statusVariant = v.status === 'AVAILABLE' ? 'success' : v.status === 'RESERVED' ? 'warning' : 'error'
                    return (
                      <div key={v.id} className="flex items-center gap-3 px-5 py-4">
                        <div className="relative w-14 h-10 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                          {v.images[0] ? (
                            <Image src={v.images[0].url} alt={v.title} fill className="object-cover" sizes="56px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Car className="h-4 w-4 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 text-sm truncate">{v.title}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <Badge variant={statusVariant}>{vehicleStatusLabel(v.status)}</Badge>
                            {v.status === 'SOLD' && v.soldAt && (
                              <span className="flex items-center gap-1 text-xs text-slate-400">
                                <Calendar className="h-3 w-3" />
                                {new Date(v.soldAt).toLocaleDateString('sk-SK')}
                              </span>
                            )}
                            {v.commissionAmount != null && (
                              <span className="text-xs font-semibold text-purple-700">
                                Odmena: {formatPrice(v.commissionAmount)}
                              </span>
                            )}
                          </div>
                        </div>
                        <Link href={`/admin/vehicles/${v.id}`} className="text-xs text-purple-500 hover:underline shrink-0">
                          Detail →
                        </Link>
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
