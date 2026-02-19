import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import { getTenantBranding } from '@/lib/tenant'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const branding = await getTenantBranding()

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar branding={branding} />
      <main className="flex-1">{children}</main>
      <Footer branding={branding} />
    </div>
  )
}
