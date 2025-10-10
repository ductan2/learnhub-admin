import type { User } from '@/types/user'
import { delay } from '@/lib/api/utils'
import { mockUsers } from '@/lib/mock-data'
import apiClient from '@/lib/api/client'

export const users = {
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<{ data?: { users?: User[] } }>(
      '/api/v1/users',
      {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      }
    )

    return response.data?.data?.users || []
  },

  getById: async (id: string): Promise<User | undefined> => {
    const response = await apiClient.get<{ data?: { user?: User } }>(
      `/api/v1/users/${id}`,
      {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      }
    )
    return response.data?.data?.user
  },

  updateStatus: async (userId: string, status: User['status']): Promise<void> => {
    await apiClient.patch(
      `/api/v1/users/${userId}/status`,
      { status },
      {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  },
  updateRole: async (userId: string, role_id: string): Promise<void> => {
    await apiClient.patch(
      `/api/v1/users/${userId}/role`,
      { role_id },
      {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  },
}
