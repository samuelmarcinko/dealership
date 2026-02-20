import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, User, Building2, Phone, Mail, ShoppingBag } from 'lucide-react'
import { customerDisplayName } from '@/lib/customer'
import DeleteCustomerButton from '@/components/admin/DeleteCustomerButton'

export const metadata: Metadata = { title: 'Zákazníci' }

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { vehicles: true } } },
  })

  const total = customers.length
  const persons = customers.filter((c) => c.type === 'PERSON').length
  const companies = customers.filter((c) => c.type === 'COMPANY').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Zákazníci</h1>
          <p className="text-slate-500 text-sm mt-1">{total} zákazníkov celkom</p>
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
          { label: 'Celkom', value: total, icon: User, color: 'text-slate-600 bg-slate-100' },
          { label: 'Fyzické osoby', value: persons, icon: User, color: 'text-blue-600 bg-blue-50' },
          { label: 'Firmy / Živnostníci', value: companies, icon: Building2, color: 'text-purple-600 bg-purple-50' },
        ].map((s) => (
          <Card key={s.label}>
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

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Zoznam zákazníkov</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {customers.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <User className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Zatiaľ žiadni zákazníci.</p>
              <Button asChild className="mt-4 bg-orange-500 hover:bg-orange-600 text-white" size="sm">
                <Link href="/admin/customers/new">Pridať prvého zákazníka</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {customers.map((c) => (
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
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{customerDisplayName(c)}</span>
                      <Badge className={`text-xs border-0 ${c.type === 'COMPANY' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {c.type === 'COMPANY' ? 'Firma' : 'Osoba'}
                      </Badge>
                    </div>
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
                      {c.type === 'COMPANY' && c.ico && (
                        <span className="text-xs text-slate-400">IČO: {c.ico}</span>
                      )}
                    </div>
                  </div>
                  {c._count.vehicles > 0 && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
                      <ShoppingBag className="h-3.5 w-3.5" />
                      {c._count.vehicles} {c._count.vehicles === 1 ? 'kúpa' : 'kúpy'}
                    </div>
                  )}
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
