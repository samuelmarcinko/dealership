import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import AdminShell from '@/components/admin/AdminShell'
import { ToastProvider } from '@/components/ui/toast'
import { getTenantBranding } from '@/lib/tenant'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()
  if (!session) redirect('/admin/login')

  const branding = await getTenantBranding()

  return (
    <ToastProvider>
      <AdminShell userName={session.name} userEmail={session.email} userRole={session.role} businessName={branding.businessName}>
        {children}
      </AdminShell>
    </ToastProvider>
  )
}
