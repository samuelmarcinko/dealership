import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import { getTenantBranding } from '@/lib/tenant'
import { hexToHsl } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const branding = await getTenantBranding()

  const cssVars = branding.primaryColor
    ? `:root{--primary:${hexToHsl(branding.primaryColor)};--ring:${hexToHsl(branding.primaryColor)};}`
    : ''
  const inlineStyles = cssVars + (branding.customCss ?? '')

  return (
    <>
      {inlineStyles && <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />}
      <div className="flex flex-col min-h-screen">
        <Navbar branding={branding} />
        <main className="flex-1">{children}</main>
        <Footer branding={branding} />
      </div>
    </>
  )
}
