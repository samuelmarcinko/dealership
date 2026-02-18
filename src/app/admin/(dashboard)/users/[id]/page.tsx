import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import UserForm from '@/components/admin/UserForm'

export const metadata: Metadata = { title: 'Upraviť používateľa' }

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-orange-600 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Späť na zoznam
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Upraviť používateľa</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">{user.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm user={user} />
        </CardContent>
      </Card>
    </div>
  )
}
