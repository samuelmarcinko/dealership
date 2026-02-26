'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Car,
  Users,
  Rss,
  Settings,
  LogOut,
  Car as CarIcon,
  FileText,
  UserCheck,
  Archive,
  ScrollText,
  Boxes,
  Images,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  exact?: boolean
  children?: { href: string; label: string; icon: React.ElementType }[]
}

const navItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/customers', label: 'Zákazníci', icon: UserCheck },
  {
    href: '/admin/vehicles',
    label: 'Ponuka vozidiel',
    icon: Car,
    children: [
      { href: '/admin/vehicles/equipment', label: 'Výbava vozidiel', icon: Boxes },
    ],
  },
  { href: '/admin/sold', label: 'Predané vozidlá', icon: Archive, exact: true },
  { href: '/admin/documents', label: 'Šablóny zmlúv', icon: ScrollText },
  { href: '/admin/media', label: 'Knižnica médií', icon: Images, exact: true },
  { href: '/admin/users', label: 'Používatelia', icon: Users },
  { href: '/admin/pages', label: 'Stránky', icon: FileText },
  { href: '/admin/settings', label: 'Nastavenia', icon: Settings, exact: true },
  { href: '/admin/import', label: 'Import', icon: Rss, exact: true },
]

interface Props {
  userName: string
  userEmail: string
}

export default function AdminSidebar({ userName, userEmail }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="flex flex-col w-64 bg-slate-900 min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-800">
        <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
          <CarIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="text-white font-bold text-lg">Auto</span>
          <span className="text-orange-400 font-bold text-lg">Bazar</span>
          <div className="text-slate-500 text-xs">Admin</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => (
          <div key={item.href}>
            <Link
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive(item.href, item.exact)
                  ? 'bg-orange-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
            {item.children && isActive(item.href) && (
              <div className="ml-4 mt-0.5 space-y-0.5 pl-3 border-l border-slate-700">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                      pathname === child.href
                        ? 'bg-orange-500/90 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    )}
                  >
                    <child.icon className="h-3.5 w-3.5 shrink-0" />
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-slate-800">
        <div className="px-3 py-2 mb-2">
          <p className="text-white text-sm font-medium truncate">{userName}</p>
          <p className="text-slate-500 text-xs truncate">{userEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-red-900/40 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Odhlásiť sa
        </button>
      </div>
    </aside>
  )
}
