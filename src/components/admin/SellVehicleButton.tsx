'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import SellVehicleModal from '@/components/admin/SellVehicleModal'
import { HandCoins } from 'lucide-react'

interface Props {
  vehicleId: string
  vehicleTitle: string
  listedPrice: number
}

export default function SellVehicleButton({ vehicleId, vehicleTitle, listedPrice }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-green-600 hover:bg-green-700 text-white gap-2"
      >
        <HandCoins className="h-4 w-4" />
        Predať vozidlo
      </Button>

      {open && (
        <SellVehicleModal
          vehicleId={vehicleId}
          vehicleTitle={vehicleTitle}
          listedPrice={listedPrice}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
