import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import AdminShell from '@/components/admin/AdminShell'
import { ToastProvider } from '@/components/ui/toast'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()
  if (!session) redirect('/admin/login')

  return (
    <ToastProvider>
      <AdminShell userName={session.name} userEmail={session.email} userRole={session.role}>
        {children}
      </AdminShell>
    </ToastProvider>
  )
}
