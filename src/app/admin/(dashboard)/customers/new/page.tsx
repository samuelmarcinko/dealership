import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import CustomerForm from '@/components/admin/CustomerForm'

export const metadata: Metadata = { title: 'Nový zákazník' }

export default function NewCustomerPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/admin/customers" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Späť na zákazníkov
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Nový zákazník</h1>
        <p className="text-slate-500 text-sm mt-1">Vytvorte profil fyzickej osoby alebo firmy.</p>
      </div>
      <CustomerForm />
    </div>
  )
}
