import type { Prisma } from '@prisma/client'

/**
 * Čo sa počíta ako predaj.
 *
 * Predaj vzniká výhradne cez tlačidlo „Predať vozidlo“ — vtedy sa nastaví
 * `soldAt`, `buyerId` a `soldPrice`. Vozidlo, ktoré len zmizlo z XML feedu
 * (alebo ho feed označil za neaktívne), dostáva stav `ARCHIVED` a do predajov
 * ani do tržieb nevstupuje.
 *
 * Kontrolujeme `soldAt`, nie `buyerId`: ak by sa zákazník neskôr zmazal,
 * `buyerId` sa vynuluje, ale predaj sa stal a má zostať v histórii.
 */
export const SOLD_VEHICLE_WHERE = {
  status: 'SOLD',
  soldAt: { not: null },
} satisfies Prisma.VehicleWhereInput

export function isRealSale(v: { status: string; soldAt: Date | null }): boolean {
  return v.status === 'SOLD' && v.soldAt !== null
}

/**
 * Tržba z predaja. Bez inzerovanej ceny ako náhrady — tá by do štatistík
 * prepašovala sumy za vozidlá, ktoré sa nikdy nepredali.
 */
export function saleRevenue(v: { soldPrice: Prisma.Decimal | number | null }): number {
  return v.soldPrice != null ? Number(v.soldPrice) : 0
}

/** Stavy, ktoré sú verejne viditeľné v ponuke. */
export const PUBLIC_VEHICLE_STATUSES = ['AVAILABLE', 'RESERVED'] as const
