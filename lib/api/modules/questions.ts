import type { Question, CreateQuestionDto } from '@/lib/types'
import { delay } from '@/lib/api/utils'
import { mockQuestions, mockQuestionOptions } from '@/lib/mock-data'

export const questions = {
  getByQuizId: async (quizId: string): Promise<Question[]> => {
    await delay()
    return mockQuestions.filter((q) => q.quiz_id === quizId)
  },

  create: async (data: CreateQuestionDto): Promise<Question> => {
    await delay()
    const newQuestion: Question = {
      id: String(mockQuestions.length + 1),
      quiz_id: data.quiz_id,
      type: data.type,
      question_text: data.question_text,
      points: data.points,
      prompt_media_id: data.prompt_media_id,
      order: mockQuestions.filter((q) => q.quiz_id === data.quiz_id).length + 1,
    }
    mockQuestions.push(newQuestion)

    if (data.options) {
      data.options.forEach((opt, index) => {
        mockQuestionOptions.push({
          id: String(mockQuestionOptions.length + 1),
          question_id: newQuestion.id,
          option_text: opt.option_text,
          is_correct: opt.is_correct,
          order: index + 1,
        })
      })
    }

    return newQuestion
  },
}
