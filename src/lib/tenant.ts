import { prisma } from '@/lib/prisma'

export interface TenantBranding {
  businessName: string
  logoUrl?: string
  primaryColor?: string
  customCss?: string
  contactPhone?: string
  contactEmail?: string
  contactAddress?: string
  socialFacebook?: string
  socialInstagram?: string
}

export async function getTenantSettings(): Promise<Record<string, string>> {
  const settings = await prisma.tenantSettings.findMany()
  return Object.fromEntries(settings.map((s) => [s.key, s.value]))
}

export async function getTenantBranding(): Promise<TenantBranding> {
  const s = await getTenantSettings()
  return {
    businessName: s['business_name'] || process.env.TENANT_NAME || 'AutoBazar',
    logoUrl: s['logo_url'] || undefined,
    primaryColor: s['primary_color'] || undefined,
    customCss: s['custom_css'] || undefined,
    contactPhone: s['contact_phone'] || undefined,
    contactEmail: s['contact_email'] || undefined,
    contactAddress: s['contact_address'] || undefined,
    socialFacebook: s['social_facebook'] || undefined,
    socialInstagram: s['social_instagram'] || undefined,
  }
}
