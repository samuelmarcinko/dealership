import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import AnnouncementBar from '@/components/public/AnnouncementBar'
import { getTenantBranding } from '@/lib/tenant'
import { hexToHsl } from '@/lib/utils'
import { FONT_PRESETS } from '@/lib/fontPresets'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [branding, navPages] = await Promise.all([
    getTenantBranding(),
    prisma.customPage
      .findMany({ where: { isPublished: true, showInNav: true }, orderBy: { navOrder: 'asc' } })
      .catch(() => [] as { slug: string; title: string }[]),
  ])

  const customNavLinks = navPages.map((p) => ({ href: `/${p.slug}`, label: p.title }))

  const preset = FONT_PRESETS[branding.fontPreset ?? 'default'] ?? FONT_PRESETS.default

  const cssVars = branding.primaryColor
    ? `:root{--primary:${hexToHsl(branding.primaryColor)};--ring:${hexToHsl(branding.primaryColor)};}`
    : ''

  const inlineStyles =
    preset.import +
    cssVars +
    preset.bodyCSS +
    preset.headingCSS +
    (branding.customCss ?? '')

  return (
    <>
      {inlineStyles && <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />}
      {branding.bannerEnabled === 'true' && branding.bannerText && (
        <AnnouncementBar
          text={branding.bannerText}
          url={branding.bannerUrl}
          bgColor={branding.bannerBgColor}
        />
      )}
      <div className="flex flex-col min-h-screen">
        <Navbar branding={branding} customNavLinks={customNavLinks} />
        <main className="flex-1">{children}</main>
        <Footer branding={branding} customNavLinks={customNavLinks} />
      </div>
    </>
  )
}
