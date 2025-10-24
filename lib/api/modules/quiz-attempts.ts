import type { QuizAttempt } from '@/types/common'
import apiClient from '@/lib/api/client'

export const quizAttempts = {
  getByUserId: async (userId: string): Promise<QuizAttempt[]> => {
    const response = await apiClient.get<{ data?: QuizAttempt[] }>(
      `/api/v1/quiz-attempts/user/${userId}`,
      {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      }
    )
    return response.data?.data || []
  },
}
