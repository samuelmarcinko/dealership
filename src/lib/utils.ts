import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | string | { toString(): string }): string {
  const num = typeof price === 'number' ? price : parseFloat(price.toString())
  return new Intl.NumberFormat('sk-SK', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatMileage(km: number): string {
  return new Intl.NumberFormat('sk-SK').format(km) + ' km'
}

export function fuelTypeLabel(fuel: string): string {
  const map: Record<string, string> = {
    PETROL: 'Benzín',
    DIESEL: 'Nafta',
    ELECTRIC: 'Elektro',
    HYBRID: 'Hybrid',
    LPG: 'LPG',
    CNG: 'CNG',
  }
  return map[fuel] ?? fuel
}

export function transmissionLabel(t: string): string {
  const map: Record<string, string> = {
    MANUAL: 'Manuál',
    AUTOMATIC: 'Automat',
    SEMI_AUTOMATIC: 'Semi-automat',
  }
  return map[t] ?? t
}

export function bodyTypeLabel(b: string): string {
  const map: Record<string, string> = {
    SEDAN: 'Sedan',
    HATCHBACK: 'Hatchback',
    ESTATE: 'Kombi',
    SUV: 'SUV',
    COUPE: 'Coupe',
    CONVERTIBLE: 'Kabriolet',
    VAN: 'Van',
    PICKUP: 'Pickup',
    OTHER: 'Iné',
  }
  return map[b] ?? b
}

export function vehicleStatusLabel(s: string): string {
  const map: Record<string, string> = {
    AVAILABLE: 'Dostupné',
    RESERVED: 'Rezervované',
    SOLD: 'Predané',
  }
  return map[s] ?? s
}

export function vehicleStatusColor(s: string): string {
  const map: Record<string, string> = {
    AVAILABLE: 'bg-green-100 text-green-800',
    RESERVED: 'bg-yellow-100 text-yellow-800',
    SOLD: 'bg-red-100 text-red-800',
  }
  return map[s] ?? 'bg-gray-100 text-gray-800'
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) return `0 0% ${Math.round(l * 100)}%`

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

  let h: number
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
    case g: h = ((b - r) / d + 2) / 6; break
    default: h = ((r - g) / d + 4) / 6
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}
