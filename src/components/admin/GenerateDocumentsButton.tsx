'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import DocumentWizard from '@/components/admin/DocumentWizard'
import { FileSignature, X } from 'lucide-react'

interface Props {
  vehicleId: string
  party: 'buyer' | 'consignor'
  label?: string
  size?: 'default' | 'sm'
}

export default function GenerateDocumentsButton({
  vehicleId, party, label = 'Vygenerovať dokumenty', size = 'default',
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size={size} onClick={() => setOpen(true)} className="gap-2">
        <FileSignature className="h-4 w-4" />
        {label}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Generovanie dokumentov</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {party === 'consignor'
                    ? 'Dokumenty k prevzatiu vozidla do komisie'
                    : 'Dokumenty k predaju vozidla'}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <DocumentWizard vehicleId={vehicleId} party={party} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
