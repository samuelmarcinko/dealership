import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DeletePageButton from '@/components/admin/DeletePageButton'
import { Plus, FileText, ExternalLink } from 'lucide-react'

export const metadata: Metadata = { title: 'Stránky' }

export default async function PagesPage() {
  const pages = await prisma.customPage.findMany({ orderBy: { navOrder: 'asc' } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vlastné stránky</h1>
          <p className="text-slate-500 text-sm mt-1">Vytvárajte ľubovolné podstránky s vlastným obsahom.</p>
        </div>
        <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
          <Link href="/admin/pages/new">
            <Plus className="h-4 w-4 mr-2" />
            Nová stránka
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-base font-semibold">Všetky stránky</CardTitle>
          </div>
          {pages.length === 0 && (
            <CardDescription>Zatiaľ žiadne vlastné stránky. Vytvorte prvú!</CardDescription>
          )}
        </CardHeader>
        {pages.length > 0 && (
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900">{page.title}</span>
                        {page.isPublished ? (
                          <Badge className="bg-green-100 text-green-700 border-0 text-xs">Zverejnené</Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-500 border-0 text-xs">Skrytá</Badge>
                        )}
                        {page.showInNav && (
                          <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">V navigácii</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-400">
                        <span>/{page.slug}</span>
                        {page.isPublished && (
                          <a
                            href={`/${page.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/pages/${page.id}`}>Upraviť</Link>
                    </Button>
                    <DeletePageButton id={page.id} title={page.title} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
