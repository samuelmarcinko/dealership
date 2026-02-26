import React from 'react'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import MediaLibrary from '@/components/admin/MediaLibrary'

export const metadata: Metadata = { title: 'Knižnica médií' }

export default async function MediaPage() {
  const files = await prisma.mediaFile.findMany({ orderBy: { uploadedAt: 'desc' } })

  return <MediaLibrary initialFiles={files} />
}
