import React from 'react'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import EquipmentManager from '@/components/admin/EquipmentManager'

export const metadata: Metadata = { title: 'Výbava vozidiel' }

export default async function EquipmentPage() {
  const items = await prisma.equipmentItem.findMany({
    orderBy: [{ category: 'asc' }, { subcategory: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
  })

  return <EquipmentManager initialItems={items} />
}
