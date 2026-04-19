import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, User, Building2, Phone, Mail, Search, Handshake, MapPin, Car } from 'lucide-react'
import { customerDisplayName } from '@/lib/customer'
import DeleteCustomerButton from '@/components/admin/DeleteCustomerButton'
import { CustomerType } from '@prisma/client'

export const metadata: Metadata = { title: 'Zákazníci' }

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string }>
}) {
  const sp = await searchParams
  const search = sp.search?.trim() || undefined
  const typeFilter = sp.type === 'PERSON' || sp.type === 'COMPANY' ? sp.type as CustomerType : undefined

  const [customers, allStats] = await Promise.all([
    prisma.customer.findMany({
      where: {
        ...(typeFilter && { type: typeFilter }),
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { companyName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { vehicles: true, consignedVehicles: true } },
        vehicles: { where: { soldAt: { not: null } }, select: { soldAt: true }, orderBy: { soldAt: 'desc' }, take: 1 },
      },
    }),
    prisma.customer.groupBy({
      by: ['type'],
      _count: true,
    }),
  ])

  const totalAll = allStats.reduce((s, g) => s + g._count, 0)
  const personsAll = allStats.find((g) => g.type === 'PERSON')?._count ?? 0
  const companiesAll = allStats.find((g) => g.type === 'COMPANY')?._count ?? 0

  const hasFilter = !!(search || typeFilter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Zákazníci</h1>
          <p className="text-slate-500 text-sm mt-1">{totalAll} zákazníkov celkom</p>
        </div>
        <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
          <Link href="/admin/customers/new">
            <Plus className="h-4 w-4 mr-2" />
            Nový zákazník
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Celkom', value: totalAll, icon: User, color: 'text-slate-600 bg-slate-100' },
          { label: 'Fyzické osoby', value: personsAll, icon: User, color: 'text-blue-600 bg-blue-50' },
          { label: 'Firmy / Živnostníci', value: companiesAll, icon: Building2, color: 'text-purple-600 bg-purple-50' },
        ].map((s) => (
          <Card key={s.label} className="hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 cursor-default">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter bar */}
      <form method="GET" className="flex flex-wrap gap-3 items-end bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex-1 min-w-48 space-y-1">
          <label className="text-xs font-medium text-slate-600">Hľadať</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              name="search"
              defaultValue={sp.search ?? ''}
              placeholder="Meno, firma, email, telefón..."
              className="w-full h-9 pl-9 pr-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Typ zákazníka</label>
          <select
            name="type"
            defaultValue={sp.type ?? ''}
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="">Všetci</option>
            <option value="PERSON">Fyzické osoby</option>
            <option value="COMPANY">Firmy / Živnostníci</option>
          </select>
        </div>
        <button
          type="submit"
          className="h-9 px-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-md transition-colors"
        >
          Filtrovať
        </button>
        {hasFilter && (
          <Link
            href="/admin/customers"
            className="h-9 px-4 border border-slate-300 hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-md transition-colors flex items-center"
          >
            Zrušiť
          </Link>
        )}
      </form>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {hasFilter ? `${customers.length} nájdených zákazníkov` : 'Zoznam zákazníkov'}
            {hasFilter && <span className="text-slate-400 font-normal ml-2 text-sm">(filtrované)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {customers.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <User className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                {hasFilter ? 'Žiadni zákazníci nevyhovujú filtrám.' : 'Zatiaľ žiadni zákazníci.'}
              </p>
              {!hasFilter && (
                <Button asChild className="mt-4 bg-orange-500 hover:bg-orange-600 text-white" size="sm">
                  <Link href="/admin/customers/new">Pridať prvého zákazníka</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {customers.map((c) => (
                <div key={c.id} className="group flex items-center gap-4 px-6 py-4 hover:bg-orange-50/40 hover:border-l-[3px] hover:border-l-orange-400 transition-all duration-150">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    c.type === 'COMPANY' ? 'bg-purple-100' : 'bg-blue-100'
                  }`}>
                    {c.type === 'COMPANY'
                      ? <Building2 className="h-4 w-4 text-purple-600" />
                      : <User className="h-4 w-4 text-blue-600" />
                    }
                  </div>
                  {/* Name + contact */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-slate-900">{customerDisplayName(c)}</span>
                      <Badge className={`text-xs border-0 ${c.type === 'COMPANY' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {c.type === 'COMPANY' ? 'Firma' : 'Osoba'}
                      </Badge>
                      {c.type === 'COMPANY' && c.ico && (
                        <span className="text-xs text-slate-400 font-mono">IČO: {c.ico}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {c.phone && (
                        <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors">
                          <Phone className="h-3 w-3" />{c.phone}
                        </a>
                      )}
                      {c.email && (
                        <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors">
                          <Mail className="h-3 w-3" />{c.email}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  {c.address && (
                    <div className="hidden xl:flex items-center gap-1 text-xs text-slate-400 shrink-0 max-w-[140px]">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{c.address.split('\n')[0]}</span>
                    </div>
                  )}

                  {/* Bought vehicles */}
                  <div className="hidden md:flex flex-col items-center gap-0.5 shrink-0 min-w-[64px]">
                    <div className={`flex items-center gap-1 text-sm font-bold ${
                      c._count.vehicles > 0 ? 'text-blue-600' : 'text-slate-300'
                    }`}>
                      <Car className="h-3.5 w-3.5" />
                      {c._count.vehicles}
                    </div>
                    <span className="text-[10px] text-slate-400 leading-none">Kúpené</span>
                  </div>

                  {/* Consigned vehicles */}
                  <div className="hidden md:flex flex-col items-center gap-0.5 shrink-0 min-w-[64px]">
                    <div className={`flex items-center gap-1 text-sm font-bold ${
                      c._count.consignedVehicles > 0 ? 'text-purple-600' : 'text-slate-300'
                    }`}>
                      <Handshake className="h-3.5 w-3.5" />
                      {c._count.consignedVehicles}
                    </div>
                    <span className="text-[10px] text-slate-400 leading-none">Komisné</span>
                  </div>

                  {/* Last activity */}
                  <div className="hidden lg:flex flex-col items-end gap-0.5 shrink-0 min-w-[90px]">
                    {c.vehicles[0]?.soldAt ? (
                      <>
                        <span className="text-xs font-medium text-slate-600">
                          {new Intl.DateTimeFormat('sk-SK', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date(c.vehicles[0].soldAt))}
                        </span>
                        <span className="text-[10px] text-slate-400">Posledný nákup</span>
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-300">—</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/customers/${c.id}`}>Upraviť</Link>
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
