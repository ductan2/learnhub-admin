import type { Enrollment } from '@/lib/types'

export const enrollments = {
  getByUserId: async (userId: string): Promise<Enrollment[]> => {
    const response = await fetch(`/api/enrollments?userId=${userId}`)
    if (!response.ok) throw new Error('Failed to fetch enrollments')
    return response.json()
  },
}
