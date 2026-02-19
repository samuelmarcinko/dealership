import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function generateVehicleSlug(
  make: string,
  model: string,
  year: number,
  excludeId?: string
): Promise<string> {
  const base = slugify(`${make} ${model} ${year}`)
  let slug = base
  let counter = 2

  while (true) {
    const existing = await prisma.vehicle.findUnique({ where: { slug } })
    if (!existing || existing.id === excludeId) return slug
    slug = `${base}-${counter++}`
  }
}
