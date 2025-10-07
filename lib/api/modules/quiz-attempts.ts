import type { QuizAttempt } from '@/types/common'

export const quizAttempts = {
  getByUserId: async (userId: string): Promise<QuizAttempt[]> => {
    const response = await fetch(`/api/quiz-attempts?userId=${userId}`)
    if (!response.ok) throw new Error('Failed to fetch quiz attempts')
    return response.json()
  },
}
