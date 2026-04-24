import React from 'react'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import MediaLibrary, { type LibraryFile } from '@/components/admin/MediaLibrary'

export const metadata: Metadata = { title: 'Knižnica médií' }

export default async function MediaPage() {
  const [mediaFiles, vehicleImages, brandingSettings] = await Promise.all([
    prisma.mediaFile.findMany({ orderBy: { uploadedAt: 'desc' } }),
    prisma.vehicleImage.findMany({
      where: { url: { startsWith: '/uploads/' } },
      include: { vehicle: { select: { make: true, model: true } } },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.tenantSettings.findMany({
      where: { value: { startsWith: '/uploads/branding/' } },
    }),
  ])

  const files: LibraryFile[] = [
    ...mediaFiles.map((f) => ({
      id: f.id,
      url: f.url,
      filename: f.filename,
      size: f.size,
      folder: 'media' as const,
    })),
    ...vehicleImages.map((img) => ({
      id: img.id,
      url: img.url,
      filename: img.url.split('/').pop() ?? img.id,
      folder: 'vehicles' as const,
      label: `${img.vehicle.make} ${img.vehicle.model}`,
    })),
    ...brandingSettings.map((s) => ({
      id: s.key,
      url: s.value,
      filename: s.value.split('/').pop() ?? s.key,
      folder: 'branding' as const,
      label: s.key,
    })),
  ]

  return <MediaLibrary initialFiles={files} />
}
