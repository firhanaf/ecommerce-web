'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminApi } from '@/lib/admin-api'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { User } from '@/types/api'

function formatDate(d: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d))
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => adminApi.listUsers(page, 20),
  })

  const users: User[] = data?.data?.data ?? []
  const meta = data?.data?.meta

  const updateStatus = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => adminApi.updateUserStatus(id, is_active),
    onSuccess: () => { toast.success('Status pengguna diperbarui'); qc.invalidateQueries({ queryKey: ['admin-users'] }) },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal'),
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manajemen Pengguna</h1>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-4 py-3 text-xs font-semibold text-muted-foreground border-b bg-gray-50">
          <span>Pengguna</span>
          <span>Role</span>
          <span>Bergabung</span>
          <span>Aksi</span>
        </div>

        {isLoading ? (
          <div className="space-y-px">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-4 py-3 items-center border-t">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-5 w-14" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-7 w-16" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground text-sm">Tidak ada pengguna</p>
        ) : (
          users.map((user, idx) => (
            <div key={user.id} className={`grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-4 py-3 items-center ${idx > 0 ? 'border-t' : ''}`}>
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                {!user.is_active && (
                  <span className="text-xs text-red-500">Dinonaktifkan</span>
                )}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {user.role}
              </span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(user.created_at)}</span>
              <Button
                size="sm"
                variant={user.is_active ? 'outline' : 'default'}
                onClick={() => updateStatus.mutate({ id: user.id, is_active: !user.is_active })}
                disabled={updateStatus.isPending}
                className={`text-xs ${!user.is_active ? '' : 'text-destructive border-destructive hover:bg-destructive/5'}`}
              >
                {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
              </Button>
            </div>
          ))
        )}
      </div>

      {meta && meta.total_pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Sebelumnya</Button>
          <span className="text-sm px-2 py-2 text-muted-foreground">{page} / {meta.total_pages}</span>
          <Button variant="outline" size="sm" disabled={page >= meta.total_pages} onClick={() => setPage((p) => p + 1)}>Selanjutnya →</Button>
        </div>
      )}
    </div>
  )
}
