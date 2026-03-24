import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import AnnouncementBar from '@/components/public/AnnouncementBar'
import CompareBar from '@/components/public/CompareBar'
import ThemeProvider from '@/components/public/ThemeProvider'
import { CompareProvider } from '@/contexts/CompareContext'
import { getTenantBranding } from '@/lib/tenant'
import { hexToHsl } from '@/lib/utils'
import { FONT_PRESETS } from '@/lib/fontPresets'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { LayoutDashboard } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [branding, navPages, session, navMenuSetting] = await Promise.all([
    getTenantBranding(),
    prisma.customPage
      .findMany({ where: { isPublished: true, showInNav: true }, orderBy: { navOrder: 'asc' } })
      .catch(() => [] as { slug: string; title: string }[]),
    getServerSession(),
    prisma.tenantSettings.findUnique({ where: { key: 'nav_menu_config' } }),
  ])

  const customNavLinks = navPages.map((p) => ({ href: `/${p.slug}`, label: p.title }))

  // If a custom menu config is saved, use it; otherwise fall back to defaults
  let navLinks: { href: string; label: string; exact?: boolean }[] | undefined
  if (navMenuSetting?.value) {
    try {
      const config = JSON.parse(navMenuSetting.value)
      if (Array.isArray(config.items)) {
        navLinks = [
          ...(config.items as { href: string; label: string; exact?: boolean; enabled: boolean }[])
            .filter((item) => item.enabled !== false)
            .map(({ href, label, exact }) => ({ href, label, exact })),
          ...customNavLinks,
        ]
      }
    } catch {}
  }

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

  const defaultTheme = (branding.defaultTheme === 'dark' ? 'dark' : 'light') as 'light' | 'dark'

  // Inline script runs before hydration — prevents FOUC on dark mode
  const foucScript = `(function(){try{var s=localStorage.getItem('public-theme'),d='${defaultTheme}';if((s||d)==='dark')document.documentElement.classList.add('dark-public');}catch(e){}})();`

  return (
    <CompareProvider>
      <ThemeProvider defaultTheme={defaultTheme}>
        <>
          {/* FOUC prevention — must be first, runs synchronously */}
          <script dangerouslySetInnerHTML={{ __html: foucScript }} />

          {inlineStyles && <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />}
          {branding.bannerEnabled === 'true' && branding.bannerText && (
            <AnnouncementBar
              text={branding.bannerText}
              url={branding.bannerUrl}
              bgColor={branding.bannerBgColor}
            />
          )}
          <div className="flex flex-col min-h-screen">
            <Navbar branding={branding} navLinks={navLinks} customNavLinks={customNavLinks} />
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
      </ThemeProvider>
    </CompareProvider>
  )
}
