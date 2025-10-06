import type { User } from '@/lib/types'
import { delay } from '@/lib/api/utils'
import { mockUsers } from '@/lib/mock-data'

export const users = {
  getAll: async (): Promise<User[]> => {
    const response = await fetch('/api/users')
    if (!response.ok) throw new Error('Failed to fetch users')
    return response.json()
  },

  getById: async (id: string): Promise<User> => {
    await delay()
    const user = mockUsers.find((u) => u.id === id)
    if (!user) throw new Error('User not found')
    return user
  },

  updateStatus: async (userId: string, status: User['status']): Promise<void> => {
    const response = await fetch(`/api/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!response.ok) throw new Error('Failed to update user status')
  },
}
