export interface CustomerLike {
  type: string
  firstName?: string | null
  lastName?: string | null
  companyName?: string | null
  ico?: string | null
}

export function customerDisplayName(c: CustomerLike): string {
  if (c.type === 'COMPANY') {
    return c.companyName || '(bez názvu)'
  }
  const parts = [c.firstName, c.lastName].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : '(bez mena)'
}

export function customerShortInfo(c: CustomerLike): string {
  if (c.type === 'COMPANY' && c.ico) return `IČO: ${c.ico}`
  return c.type === 'PERSON' ? 'Fyzická osoba' : 'Firma'
}
