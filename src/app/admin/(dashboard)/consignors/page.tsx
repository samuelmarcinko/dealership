import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, User, Building2, Phone, Mail, Car, Handshake } from 'lucide-react'
import { customerDisplayName } from '@/lib/customer'
import DeleteCustomerButton from '@/components/admin/DeleteCustomerButton'

export const metadata: Metadata = { title: 'Komisný predaj' }

export default async function ConsignorsPage() {
  const consignors = await prisma.customer.findMany({
    where: { isConsignor: true },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { consignedVehicles: true } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Komisný predaj</h1>
          <p className="text-slate-500 text-sm mt-1">Komitenti — vlastníci vozidiel v komisnom predaji</p>
        </div>
        <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
          <Link href="/admin/consignors/new">
            <Plus className="h-4 w-4 mr-2" />
            Nový komitent
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Handshake className="h-4 w-4 text-purple-600" />
            Zoznam komitentov ({consignors.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {consignors.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Handshake className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Zatiaľ žiadni komitenti.</p>
              <Button asChild className="mt-4 bg-orange-500 hover:bg-orange-600 text-white" size="sm">
                <Link href="/admin/consignors/new">Pridať komitenta</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {consignors.map((c) => (
                <div key={c.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    c.type === 'COMPANY' ? 'bg-purple-100' : 'bg-blue-100'
                  }`}>
                    {c.type === 'COMPANY'
                      ? <Building2 className="h-4 w-4 text-purple-600" />
                      : <User className="h-4 w-4 text-blue-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-slate-900">{customerDisplayName(c)}</span>
                    <div className="flex items-center gap-4 mt-0.5">
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
                  {c._count.consignedVehicles > 0 && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
                      <Car className="h-3.5 w-3.5" />
                      {c._count.consignedVehicles} {c._count.consignedVehicles === 1 ? 'vozidlo' : 'vozidiel'}
                    </div>
                  )}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/consignors/${c.id}`}>Upraviť</Link>
                    </Button>
                    <DeleteCustomerButton id={c.id} name={customerDisplayName(c)} />
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
