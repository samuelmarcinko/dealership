import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Building2, Phone, Mail, Car, Handshake, ExternalLink, Calendar } from 'lucide-react'
import { customerDisplayName } from '@/lib/customer'
import { formatPrice, vehicleStatusLabel } from '@/lib/utils'

export const metadata: Metadata = { title: 'Komisný predaj' }

export default async function ConsignorsPage() {
  // Komitenti = zákazníci, ktorí majú aspoň 1 vozidlo v komisnom predaji
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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Komisný predaj</h1>
          <p className="text-slate-500 text-sm mt-1">
            Zákazníci s vozidlami v komisnom predaji — {consignors.length} {consignors.length === 1 ? 'komitent' : 'komitenti'}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/customers">
            <User className="h-4 w-4 mr-2" />
            Zákazníci
          </Link>
        </Button>
      </div>

      {/* Stats */}
      {consignors.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Komitentov', value: consignors.length, color: 'text-purple-600 bg-purple-50' },
            { label: 'Vozidiel celkom', value: totalVehicles, color: 'text-slate-600 bg-slate-100' },
            { label: 'Aktívnych', value: activeVehicles, color: 'text-green-600 bg-green-50' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="pt-4 pb-3">
                <p className={`text-2xl font-bold ${s.color.split(' ')[0]}`}>{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Handshake className="h-4 w-4 text-purple-600" />
            Aktívni komitenti
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {consignors.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <Handshake className="h-10 w-10 mx-auto opacity-30" />
              <p className="text-sm font-medium">Zatiaľ žiadni komitenti</p>
              <p className="text-xs max-w-xs mx-auto">
                Komitent sa zobrazí tu, keď zákazníkovi priradíte vozidlo v komisnom predaji.
                Zákazníka môžete vytvoriť v sekcii Zákazníci.
              </p>
              <div className="flex gap-2 justify-center pt-1">
                <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Link href="/admin/customers/new">Nový zákazník</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/admin/vehicles/new">Nové vozidlo</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {consignors.map((c) => (
                <div key={c.id} className="px-6 py-5">
                  {/* Consignor header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      c.type === 'COMPANY' ? 'bg-purple-100' : 'bg-blue-100'
                    }`}>
                      {c.type === 'COMPANY'
                        ? <Building2 className="h-4 w-4 text-purple-600" />
                        : <User className="h-4 w-4 text-blue-600" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{customerDisplayName(c)}</span>
                        <span className="text-xs text-slate-400">
                          {c.consignedVehicles.length} {c.consignedVehicles.length === 1 ? 'vozidlo' : 'vozidiel'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        {c.phone && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Phone className="h-3 w-3" />{c.phone}
                          </span>
                        )}
                        {c.email && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Mail className="h-3 w-3" />{c.email}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/customers/${c.id}`}>
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        Profil zákazníka
                      </Link>
                    </Button>
                  </div>

                  {/* Vehicles */}
                  <div className="ml-12 space-y-2">
                    {c.consignedVehicles.map((v) => {
                      const statusVariant = v.status === 'AVAILABLE' ? 'success' : v.status === 'RESERVED' ? 'warning' : 'error'
                      return (
                        <div key={v.id} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="relative w-12 h-9 bg-slate-200 rounded overflow-hidden shrink-0">
                            {v.images[0] ? (
                              <Image src={v.images[0].url} alt={v.title} fill className="object-cover" sizes="48px" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Car className="h-3.5 w-3.5 text-slate-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{v.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant={statusVariant}>{vehicleStatusLabel(v.status)}</Badge>
                              {v.commissionRate != null && (
                                <span className="text-xs text-slate-400">Provízia: {Number(v.commissionRate)} %</span>
                              )}
                              {v.status === 'SOLD' && v.soldAt && (
                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                  <Calendar className="h-3 w-3" />
                                  Predané {new Date(v.soldAt).toLocaleDateString('sk-SK')}
                                </span>
                              )}
                              {v.status === 'SOLD' && v.commissionAmount != null && (
                                <span className="text-xs font-semibold text-purple-700">
                                  Odmena: {formatPrice(v.commissionAmount)}
                                </span>
                              )}
                            </div>
                          </div>
                          <Link href={`/admin/vehicles/${v.id}`} className="text-xs text-orange-500 hover:underline shrink-0">
                            Upraviť →
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
