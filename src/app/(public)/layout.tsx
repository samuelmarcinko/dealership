import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import AnnouncementBar from '@/components/public/AnnouncementBar'
import CompareBar from '@/components/public/CompareBar'
import { CompareProvider } from '@/contexts/CompareContext'
import { getTenantBranding } from '@/lib/tenant'
import { hexToHsl } from '@/lib/utils'
import { FONT_PRESETS } from '@/lib/fontPresets'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { LayoutDashboard } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [branding, navPages, session] = await Promise.all([
    getTenantBranding(),
    prisma.customPage
      .findMany({ where: { isPublished: true, showInNav: true }, orderBy: { navOrder: 'asc' } })
      .catch(() => [] as { slug: string; title: string }[]),
    getServerSession(),
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
    <CompareProvider>
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

        {/* Admin shortcut — visible only when logged in */}
        {session && (
          <a
            href="/admin"
            className="fixed top-24 right-4 z-[60] flex items-center gap-2 px-3.5 py-2.5 bg-slate-900/90 backdrop-blur-sm text-white text-xs font-medium rounded-xl shadow-lg hover:bg-slate-800 transition-colors"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Administrácia
          </a>
        )}

        <CompareBar />
      </>
    </CompareProvider>
  )
}
