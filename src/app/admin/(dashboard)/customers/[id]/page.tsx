import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ChevronLeft, ShoppingBag, Calendar } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CustomerForm from '@/components/admin/CustomerForm'
import { customerDisplayName } from '@/lib/customer'
import { formatPrice } from '@/lib/utils'

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
    },
  })
  if (!customer) notFound()

  return (
    <div className="max-w-3xl space-y-6">
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

      {/* Purchase history */}
      {customer.vehicles.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-orange-500" />
              <CardTitle className="text-base font-semibold">Kúpna história zákazníka ({customer.vehicles.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {customer.vehicles.map((v) => (
                <div key={v.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="relative w-14 h-10 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                    {v.images[0] ? (
                      <Image src={v.images[0].url} alt={v.title} fill className="object-cover" sizes="56px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">foto</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">{v.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {v.soldAt && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Calendar className="h-3 w-3" />
                          {new Date(v.soldAt).toLocaleDateString('sk-SK')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {v.soldPrice && (
                      <p className="font-semibold text-slate-900 text-sm">{formatPrice(v.soldPrice)}</p>
                    )}
                    <p className="text-xs text-slate-400">predajná cena</p>
                  </div>
                  <Link href={`/admin/sold`} className="text-xs text-orange-500 hover:underline shrink-0">
                    Detail →
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
