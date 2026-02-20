'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, Car, Phone, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TenantBranding } from '@/lib/tenant'

const builtInNavLinks = [
  { href: '/', label: 'Domov', exact: true },
  { href: '/vehicles', label: 'Vozidlá' },
  { href: '/about', label: 'O nás' },
  { href: '/contact', label: 'Kontakt' },
]

interface Props {
  branding?: TenantBranding
  customNavLinks?: { href: string; label: string }[]
}

export default function Navbar({ branding, customNavLinks = [] }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const name = branding?.businessName ?? 'AutoBazar'
  const style = branding?.navbarStyle ?? 'dark'

  const allLinks = [
    ...builtInNavLinks,
    ...customNavLinks.map((l) => ({ href: l.href, label: l.label, exact: false })),
  ]

  function isActive(link: { href: string; exact?: boolean }) {
    if (link.exact) return pathname === link.href
    return pathname === link.href || pathname.startsWith(link.href + '/')
  }

  const headerClass = cn(
    'sticky top-0 z-50 backdrop-blur-sm shadow-lg',
    style === 'light'
      ? 'bg-white/95 border-b border-slate-200'
      : style === 'colored'
        ? 'bg-primary/95 border-b border-white/10'
        : 'bg-slate-900/95 border-b border-white/5'
  )

  const logoTextClass = cn(
    'font-bold text-xl tracking-tight',
    style === 'light' ? 'text-slate-900' : 'text-white'
  )

  const desktopLinkBase = 'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150'

  function desktopLinkClass(link: { href: string; exact?: boolean }) {
    const active = isActive(link)
    if (style === 'light') {
      return cn(
        desktopLinkBase,
        active ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
      )
    }
    if (style === 'colored') {
      return cn(
        desktopLinkBase,
        active ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'
      )
    }
    // dark (default)
    return cn(
      desktopLinkBase,
      active ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
    )
  }

  const phoneClass = cn(
    'flex items-center gap-2 text-sm font-medium transition-colors group',
    style === 'light' ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'
  )

  const phoneIconClass = cn(
    'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
    style === 'light'
      ? 'bg-slate-100 group-hover:bg-slate-200'
      : 'bg-white/5 group-hover:bg-white/10'
  )

  const mobileBurgerClass = cn(
    'md:hidden p-2 ml-auto transition-colors rounded-lg',
    style === 'light'
      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      : 'text-slate-400 hover:text-white hover:bg-white/5'
  )

  const mobileMenuClass = cn(
    'md:hidden backdrop-blur-sm border-t',
    style === 'light'
      ? 'bg-white/95 border-slate-200'
      : style === 'colored'
        ? 'bg-primary/95 border-white/10'
        : 'bg-slate-800/95 border-white/5'
  )

  function mobileLinkClass(link: { href: string; exact?: boolean }) {
    const active = isActive(link)
    if (style === 'light') {
      return cn(
        'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
        active ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
      )
    }
    if (style === 'colored') {
      return cn(
        'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
        active ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'
      )
    }
    return cn(
      'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
      active ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
    )
  }

  const mobilePhoneClass = cn(
    'flex items-center gap-2 px-4 py-3 text-sm transition-colors',
    style === 'light' ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'
  )

  return (
    <header className={headerClass}>
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            {branding?.logoUrl ? (
              <div className="relative h-10 w-28">
                <Image
                  src={branding.logoUrl}
                  alt={name}
                  fill
                  className="object-contain object-left"
                  sizes="112px"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg shadow-md">
                <Car className="h-5 w-5 text-white" />
              </div>
            )}
            <span className={logoTextClass}>{name}</span>
          </Link>

          {/* Desktop nav — centered */}
          <nav className="hidden md:flex flex-1 items-center justify-center gap-0.5">
            {allLinks.map((link) => (
              <Link key={link.href} href={link.href} className={desktopLinkClass(link)}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side: phone + email */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            {branding?.contactPhone && (
              <a
                href={`tel:${branding.contactPhone.replace(/\s/g, '')}`}
                className={phoneClass}
              >
                <div className={phoneIconClass}>
                  <Phone className="h-3.5 w-3.5" />
                </div>
                <span>{branding.contactPhone}</span>
              </a>
            )}
            {branding?.contactEmail && (
              <a
                href={`mailto:${branding.contactEmail}`}
                className={phoneClass}
              >
                <div className={phoneIconClass}>
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <span>{branding.contactEmail}</span>
              </a>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className={mobileBurgerClass}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className={mobileMenuClass}>
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {allLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={mobileLinkClass(link)}
              >
                {link.label}
              </Link>
            ))}
            {branding?.contactPhone && (
              <a
                href={`tel:${branding.contactPhone.replace(/\s/g, '')}`}
                className={mobilePhoneClass}
              >
                <Phone className="h-4 w-4" />
                {branding.contactPhone}
              </a>
            )}
            {branding?.contactEmail && (
              <a
                href={`mailto:${branding.contactEmail}`}
                className={mobilePhoneClass}
              >
                <Mail className="h-4 w-4" />
                {branding.contactEmail}
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
