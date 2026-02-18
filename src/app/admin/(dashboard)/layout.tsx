import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { ToastProvider } from '@/components/ui/toast'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()
  if (!session) redirect('/admin/login')

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-slate-100">
        <AdminSidebar userName={session.name} userEmail={session.email} />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </ToastProvider>
  )
}
