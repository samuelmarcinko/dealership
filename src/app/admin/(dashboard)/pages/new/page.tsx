import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import PageForm from '@/components/admin/PageForm'

export const metadata: Metadata = { title: 'Nová stránka' }

export default function NewPagePage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link
          href="/admin/pages"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Späť na stránky
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Nová stránka</h1>
        <p className="text-slate-500 text-sm mt-1">
          Vytvorte novú stránku. Po vytvorení budete presmerovaný do vizuálneho editora.
        </p>
      </div>

      <PageForm />
    </div>
  )
}
