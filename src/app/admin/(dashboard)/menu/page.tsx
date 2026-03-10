import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Navigation } from 'lucide-react'
import MenuEditor from '@/components/admin/MenuEditor'

export const metadata: Metadata = { title: 'Navigácia' }

interface MenuItem {
  id: string
  href: string
  label: string
  exact?: boolean
  enabled: boolean
  isBuiltin: boolean
}

const DEFAULT_ITEMS: MenuItem[] = [
  { id: 'home', href: '/', label: 'Domov', exact: true, enabled: true, isBuiltin: true },
  { id: 'vehicles', href: '/vehicles', label: 'Vozidlá', enabled: true, isBuiltin: true },
  { id: 'about', href: '/about', label: 'O nás', enabled: true, isBuiltin: true },
  { id: 'contact', href: '/contact', label: 'Kontakt', enabled: true, isBuiltin: true },
]

export default async function MenuPage() {
  const setting = await prisma.tenantSettings.findUnique({ where: { key: 'nav_menu_config' } })

  let items: MenuItem[] = DEFAULT_ITEMS
  if (setting?.value) {
    try {
      const config = JSON.parse(setting.value)
      if (Array.isArray(config.items)) items = config.items
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Navigácia</h1>
        <p className="text-slate-500 text-sm mt-1">
          Spravujte položky v hlavnom menu webu — premenujte, skryte alebo pridajte vlastné odkazy.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Navigation className="h-4 w-4 text-orange-500" />
            Položky menu
          </CardTitle>
          <CardDescription>
            Zmeňte poradie ťahom šípok, premenujte položky alebo ich skryte kliknutím na ikonu oka.
            Zabudované položky majú pevný odkaz, ale ich názov a viditeľnosť sa dá zmeniť.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MenuEditor initialItems={items} />
        </CardContent>
      </Card>
    </div>
  )
}
