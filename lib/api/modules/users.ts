import type { User, UserPoints, UserStreak } from '@/types/user'
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

  getById: async (id: string): Promise<{ user: User, points?: UserPoints, streak?: UserStreak }> => {
    const response = await apiClient.get<{
      data?: {
        user: User
        points?: UserPoints
        streak?: UserStreak
      }
    }>(
      `/api/v1/users/${id}`,
      {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      }
    )
    return {
      user: response.data?.data?.user || {} as User,
      points: response.data?.data?.points || {} as UserPoints,
      streak: response.data?.data?.streak || {} as UserStreak,
    }
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
  updateRole: async (userId: string, role: string): Promise<void> => {
    await apiClient.put(
      `/api/v1/users/${userId}/role`,
      { role },
      {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  },
  lockAccount: async (userId: string, lockoutUntil: string): Promise<User> => {
    const response = await apiClient.post<{ data: User }>(
      `/api/v1/users/${userId}/lock`,
      { lockout_until: lockoutUntil },
      {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      }
    )
    return response.data?.data
  },
  unlockAccount: async (userId: string): Promise<User> => {
    const response = await apiClient.post<{ data: User }>(
      `/api/v1/users/${userId}/unlock`,
      {},
      {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      }
    )
    return response.data?.data 
  },
  softDelete: async (userId: string): Promise<User> => {
    const response = await apiClient.delete<{ data: User }>(
      `/api/v1/users/${userId}/delete`,
      {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      }
    )
    return response.data?.data 
  },
  restore: async (userId: string): Promise<User> => {
    const response = await apiClient.post<{ data: User }>(
      `/api/v1/users/${userId}/restore`,
      {},
      {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      }
    )
    return response.data?.data 
  },
  resetPassword: async (userId: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ data?: { message: string } }>(
      `/api/v1/users/${userId}/reset-password`,
      {},
      {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      }
    )
    return { message: response.data?.data?.message || "Password reset email sent successfully" }
  },
  updateTenant: async (userId: string, tenant: string): Promise<User> => {
    const response = await apiClient.post<{ data?: { user: User } }>(
      `/api/v1/users/${userId}/tenant`,
      { tenant },
      {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      }
    )
    return response.data?.data?.user || {} as User
  },
}
