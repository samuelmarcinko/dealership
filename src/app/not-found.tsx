import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Car } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mx-auto mb-6">
          <Car className="h-10 w-10 text-orange-500" />
        </div>
        <h1 className="text-6xl font-extrabold text-slate-900 mb-2">404</h1>
        <p className="text-xl font-semibold text-slate-700 mb-2">Stránka nenájdená</p>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto">
          Stránka, ktorú hľadáte, neexistuje alebo bola presunutá.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
            <Link href="/">Späť na úvod</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/vehicles">Prezerať vozidlá</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
