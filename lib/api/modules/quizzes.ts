import type { Quiz, CreateQuizDto } from '@/lib/types'
import { delay } from '@/lib/api/utils'
import { mockQuizzes as initialMockQuizzes } from '@/lib/mock-data'

export const quizzes = {
  getAll: async (): Promise<Quiz[]> => {
    await delay()
    return initialMockQuizzes
  },

  getById: async (id: string): Promise<Quiz> => {
    await delay()
    const quiz = initialMockQuizzes.find((q) => q.id === id)
    if (!quiz) throw new Error('Quiz not found')
    return quiz
  },

  getByLessonId: async (lessonId: string): Promise<Quiz[]> => {
    await delay()
    return initialMockQuizzes.filter((q) => q.lesson_id === lessonId)
  },

  create: async (data: CreateQuizDto): Promise<Quiz> => {
    await delay()
    const newQuiz: Quiz = {
      id: String(initialMockQuizzes.length + 1),
      ...data,
      question_count: 0,
      average_score: 0,
      attempt_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    initialMockQuizzes.push(newQuiz)
    return newQuiz
  },

  update: async (id: string, data: CreateQuizDto): Promise<void> => {
    await delay()
    const index = initialMockQuizzes.findIndex((q) => q.id === id)
    if (index !== -1) {
      initialMockQuizzes[index] = { ...initialMockQuizzes[index], ...data, updated_at: new Date().toISOString() }
    }
  },

  delete: async (id: string): Promise<void> => {
    await delay()
    const index = initialMockQuizzes.findIndex((q) => q.id === id)
    if (index !== -1) {
      initialMockQuizzes.splice(index, 1)
    }
  },

  duplicate: async (id: string): Promise<Quiz> => {
    await delay()
    const quiz = initialMockQuizzes.find((q) => q.id === id)
    if (!quiz) throw new Error('Quiz not found')
    const newQuiz: Quiz = {
      ...quiz,
      id: String(initialMockQuizzes.length + 1),
      title: `${quiz.title} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    initialMockQuizzes.push(newQuiz)
    return newQuiz
  },
}
