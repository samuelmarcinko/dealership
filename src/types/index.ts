import type { Vehicle, VehicleImage, User, TenantSettings } from '@prisma/client'

export type VehicleWithImages = Vehicle & {
  images: VehicleImage[]
}

export type PublicVehicle = Pick<
  Vehicle,
  'id' | 'slug' | 'title' | 'make' | 'model' | 'variant' | 'year' | 'price' | 'salePrice' | 'mileage' | 'fuelType' | 'transmission' | 'bodyType' | 'status'
> & {
  primaryImage: VehicleImage | null
}

export type { Vehicle, VehicleImage, User, TenantSettings }

export type ApiResponse<T = null> =
  | { success: true; data: T }
  | { success: false; error: string }
