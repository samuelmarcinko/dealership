import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

interface MenuItem {
  id: string
  href: string
  label: string
  exact?: boolean
  enabled: boolean
  isBuiltin: boolean
}

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: 'home', href: '/', label: 'Domov', exact: true, enabled: true, isBuiltin: true },
  { id: 'vehicles', href: '/vehicles', label: 'Vozidlá', enabled: true, isBuiltin: true },
  { id: 'about', href: '/about', label: 'O nás', enabled: true, isBuiltin: true },
  { id: 'contact', href: '/contact', label: 'Kontakt', enabled: true, isBuiltin: true },
]

function parseConfig(value: string): MenuItem[] | null {
  try {
    const config = JSON.parse(value)
    if (Array.isArray(config.items)) return config.items
  } catch {}
  return null
}

export async function GET() {
  const setting = await prisma.tenantSettings.findUnique({ where: { key: 'nav_menu_config' } })
  const items = (setting?.value && parseConfig(setting.value)) || DEFAULT_MENU_ITEMS
  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  if (!Array.isArray(body.items)) return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

  await prisma.tenantSettings.upsert({
    where: { key: 'nav_menu_config' },
    update: { value: JSON.stringify({ items: body.items }) },
    create: { key: 'nav_menu_config', value: JSON.stringify({ items: body.items }) },
  })

  return NextResponse.json({ ok: true })
}
