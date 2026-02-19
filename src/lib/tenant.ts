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
  heroBgImage?: string
  heroBadge?: string
  heroTitle?: string
  heroTitleAccent?: string
  heroSubtitle?: string
  heroBtn1Text?: string
  heroBtn1Url?: string
  heroBtn2Text?: string
  heroBtn2Url?: string
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
    heroBgImage: s['hero_bg_image'] || undefined,
    heroBadge: s['hero_badge'] || undefined,
    heroTitle: s['hero_title'] || undefined,
    heroTitleAccent: s['hero_title_accent'] || undefined,
    heroSubtitle: s['hero_subtitle'] || undefined,
    heroBtn1Text: s['hero_btn1_text'] || undefined,
    heroBtn1Url: s['hero_btn1_url'] || undefined,
    heroBtn2Text: s['hero_btn2_text'] || undefined,
    heroBtn2Url: s['hero_btn2_url'] || undefined,
  }
}
