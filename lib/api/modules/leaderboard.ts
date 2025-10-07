import type { User } from '@/types/user'

export const leaderboard = {
  getByPeriod: async (period: 'all-time' | 'monthly' | 'weekly'): Promise<User[]> => {
    const response = await fetch(`/api/leaderboard?period=${period}`)
    if (!response.ok) throw new Error('Failed to fetch leaderboard')
    return response.json()
  },
}
