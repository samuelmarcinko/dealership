import { prisma } from '@/lib/prisma'

export interface TenantBranding {
  // Core
  businessName: string
  logoUrl?: string
  primaryColor?: string
  customCss?: string
  contactPhone?: string
  contactEmail?: string
  contactAddress?: string
  socialFacebook?: string
  socialInstagram?: string
  // Hero
  heroBgImage?: string
  heroBadge?: string
  heroTitle?: string
  heroTitleAccent?: string
  heroSubtitle?: string
  heroBtn1Text?: string
  heroBtn1Url?: string
  heroBtn2Text?: string
  heroBtn2Url?: string
  // Phase 1 — font, stats, features, footer
  fontPreset?: string
  footerTagline?: string
  stat1Value?: string
  stat1Label?: string
  stat2Value?: string
  stat2Label?: string
  stat3Value?: string
  stat3Label?: string
  stat4Value?: string
  stat4Label?: string
  feature1Icon?: string
  feature1Title?: string
  feature1Desc?: string
  feature2Icon?: string
  feature2Title?: string
  feature2Desc?: string
  feature3Icon?: string
  feature3Title?: string
  feature3Desc?: string
  feature4Icon?: string
  feature4Title?: string
  feature4Desc?: string
  // Phase 2 — navbar, about, contact
  navbarStyle?: string
  aboutHeroTitle?: string
  aboutHeroSubtitle?: string
  aboutStory?: string
  aboutValue1Icon?: string
  aboutValue1Title?: string
  aboutValue1Desc?: string
  aboutValue2Icon?: string
  aboutValue2Title?: string
  aboutValue2Desc?: string
  aboutValue3Icon?: string
  aboutValue3Title?: string
  aboutValue3Desc?: string
  aboutValue4Icon?: string
  aboutValue4Title?: string
  aboutValue4Desc?: string
  aboutTeamText?: string
  contactHeroTitle?: string
  contactHeroSubtitle?: string
  contactHours?: string
  contactMapUrl?: string
  // Phase 3 — banner
  bannerEnabled?: string
  bannerText?: string
  bannerUrl?: string
  bannerBgColor?: string
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
    // Phase 1
    fontPreset: s['font_preset'] || undefined,
    footerTagline: s['footer_tagline'] || undefined,
    stat1Value: s['stat_1_value'] || undefined,
    stat1Label: s['stat_1_label'] || undefined,
    stat2Value: s['stat_2_value'] || undefined,
    stat2Label: s['stat_2_label'] || undefined,
    stat3Value: s['stat_3_value'] || undefined,
    stat3Label: s['stat_3_label'] || undefined,
    stat4Value: s['stat_4_value'] || undefined,
    stat4Label: s['stat_4_label'] || undefined,
    feature1Icon: s['feature_1_icon'] || undefined,
    feature1Title: s['feature_1_title'] || undefined,
    feature1Desc: s['feature_1_desc'] || undefined,
    feature2Icon: s['feature_2_icon'] || undefined,
    feature2Title: s['feature_2_title'] || undefined,
    feature2Desc: s['feature_2_desc'] || undefined,
    feature3Icon: s['feature_3_icon'] || undefined,
    feature3Title: s['feature_3_title'] || undefined,
    feature3Desc: s['feature_3_desc'] || undefined,
    feature4Icon: s['feature_4_icon'] || undefined,
    feature4Title: s['feature_4_title'] || undefined,
    feature4Desc: s['feature_4_desc'] || undefined,
    // Phase 2
    navbarStyle: s['navbar_style'] || undefined,
    aboutHeroTitle: s['about_hero_title'] || undefined,
    aboutHeroSubtitle: s['about_hero_subtitle'] || undefined,
    aboutStory: s['about_story'] || undefined,
    aboutValue1Icon: s['about_value_1_icon'] || undefined,
    aboutValue1Title: s['about_value_1_title'] || undefined,
    aboutValue1Desc: s['about_value_1_desc'] || undefined,
    aboutValue2Icon: s['about_value_2_icon'] || undefined,
    aboutValue2Title: s['about_value_2_title'] || undefined,
    aboutValue2Desc: s['about_value_2_desc'] || undefined,
    aboutValue3Icon: s['about_value_3_icon'] || undefined,
    aboutValue3Title: s['about_value_3_title'] || undefined,
    aboutValue3Desc: s['about_value_3_desc'] || undefined,
    aboutValue4Icon: s['about_value_4_icon'] || undefined,
    aboutValue4Title: s['about_value_4_title'] || undefined,
    aboutValue4Desc: s['about_value_4_desc'] || undefined,
    aboutTeamText: s['about_team_text'] || undefined,
    contactHeroTitle: s['contact_hero_title'] || undefined,
    contactHeroSubtitle: s['contact_hero_subtitle'] || undefined,
    contactHours: s['contact_hours'] || undefined,
    contactMapUrl: s['contact_map_url'] || undefined,
    // Phase 3
    bannerEnabled: s['banner_enabled'] || undefined,
    bannerText: s['banner_text'] || undefined,
    bannerUrl: s['banner_url'] || undefined,
    bannerBgColor: s['banner_bg_color'] || undefined,
  }
}
