import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { prisma } from '@/lib/prisma'
import DeleteUserButton from '@/components/admin/DeleteUserButton'
import { format } from 'date-fns'

export const metadata: Metadata = { title: 'Používatelia' }

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Používatelia</h1>
          <p className="text-slate-500 text-sm mt-1">{users.length} používateľov celkom</p>
        </div>
        <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
          <Link href="/admin/users/new">
            <Plus className="h-4 w-4 mr-2" />
            Pridať používateľa
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Zoznam používateľov</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meno</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rola</TableHead>
                <TableHead>Vytvorený</TableHead>
                <TableHead className="w-[100px]">Akcie</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                    Žiadni používatelia
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-slate-600">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {format(new Date(user.createdAt), 'dd.MM.yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                          <Link href={`/admin/users/${user.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DeleteUserButton userId={user.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
