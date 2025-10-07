import { apolloClient } from '@/lib/graphql/client'
import {
  GET_QUIZZES,
  GET_QUIZ,
  CREATE_QUIZ,
  UPDATE_QUIZ,
  DELETE_QUIZ,
} from '@/lib/graphql/queries'
import type {
  Quiz as GraphqlQuiz,
  QuizQuestion as GraphqlQuizQuestion,
  QuestionOption as GraphqlQuestionOption,
  QuizzesResponse,
  QuizResponse,
  CreateQuizResponse,
  GetQuizzesVariables,
  GetQuizVariables,
  CreateQuizVariables,
} from '@/content_schema'
import type { Quiz, CreateQuizDto, QuizQuestion, QuizAnswer } from '@/types/quiz'

type UpdateQuizVariables = {
  id: string
  input: {
    lessonId?: string
    topicId?: string
    levelId?: string
    title?: string
    description?: string
    timeLimitS?: number
  }
}

type UpdateQuizResponse = {
  updateQuiz: GraphqlQuiz
}

type DeleteQuizVariables = { id: string }
type DeleteQuizResponse = { deleteQuiz: boolean }

const normalizeQuestionType = (type: string): QuizQuestion['type'] => {
  const normalized = type?.toLowerCase()
  switch (normalized) {
    case 'multiple_choice':
    case 'multiple-choice':
      return 'multiple_choice'
    case 'true_false':
    case 'truefalse':
    case 'true-false':
      return 'true_false'
    case 'short_answer':
    case 'short-answer':
    case 'shortanswer':
      return 'short_answer'
    default:
      return 'multiple_choice'
  }
}

const mapOption = (option: GraphqlQuestionOption): QuizAnswer => ({
  id: option.id,
  question_id: option.questionId ?? '',
  answer_text: option.label,
  is_correct: option.isCorrect,
  order: option.ord ?? 0,
  feedback: option.feedback ?? undefined,
})

const mapQuestion = (question: GraphqlQuizQuestion): QuizQuestion => {
  const type = normalizeQuestionType(question.type)
  const answers = (question.options ?? []).map(mapOption)

  let correctAnswer: QuizQuestion['correct_answer']

  if (type === 'true_false') {
    const correctOption = answers.find((option) => option.is_correct)
    if (correctOption) {
      const normalized = correctOption.answer_text.trim().toLowerCase()
      if (normalized === 'true' || normalized === 'false') {
        correctAnswer = normalized
      } else {
        correctAnswer = correctOption.answer_text
      }
    }
  } else if (type === 'short_answer') {
    const metadata = question.metadata as Record<string, unknown> | undefined
    const possibleAnswer =
      (metadata?.correctAnswer as string | undefined) ??
      (metadata?.correct_answer as string | undefined) ??
      (metadata?.answer as string | undefined)

    if (possibleAnswer) {
      correctAnswer = possibleAnswer
    }
  }

  return {
    id: question.id,
    quiz_id: question.quizId,
    type,
    question_text: question.prompt,
    points: question.points ?? 0,
    order: question.ord ?? 0,
    prompt_media_id: question.promptMedia ?? undefined,
    metadata: question.metadata ?? undefined,
    answers,
    correct_answer: correctAnswer,
  }
}

const mapQuiz = (quiz: GraphqlQuiz): Quiz => ({
  id: quiz.id,
  title: quiz.title,
  description: quiz.description ?? undefined,
  topic_id: (quiz as any).topic?.id ?? '',
  level_id: (quiz as any).level?.id ?? '',
  level: (quiz as any).level ? {
    id: (quiz as any).level.id,
    name: (quiz as any).level.name,
  } : undefined,
  topic: (quiz as any).topic ? {
    id: (quiz as any).topic.id,
    name: (quiz as any).topic.name,
  } : undefined,
  time_limit: quiz.timeLimitS ? Math.round(quiz.timeLimitS / 60) : undefined,
  passing_score: undefined,
  shuffle_questions: undefined,
  shuffle_answers: undefined,
  show_correct_answers: undefined,
  question_count: quiz.questions ? quiz.questions.length : undefined,
  average_score: undefined,
  attempt_count: undefined,
  lesson_id: quiz.lessonId ?? '',
  created_at: quiz.createdAt,
  updated_at: quiz.createdAt,
  total_points: quiz.totalPoints ?? undefined,
  tags: (quiz.tags ?? []).map((tag) => ({
    id: tag.id,
    slug: tag.slug,
    name: tag.name,
  })),
  questions: quiz.questions ? quiz.questions.map(mapQuestion) : undefined,
})

const buildCreateQuizInput = (data: CreateQuizDto): CreateQuizVariables['input'] => ({
  title: data.title,
  description: data.description || undefined,
  lessonId: data.lesson_id || undefined,
  topicId: (data as any).topic_id || undefined,
  levelId: (data as any).level_id || undefined,
  timeLimitS: data.time_limit ? data.time_limit * 60 : undefined,
})

export const quizzes = {
  getAll: async (): Promise<Quiz[]> => {
    try {
      const { data } = await apolloClient.query<QuizzesResponse, GetQuizzesVariables>({
        query: GET_QUIZZES,
        variables: { page: 1, pageSize: 50 },
        fetchPolicy: 'network-only',
      })

      const items = data?.quizzes?.items ?? []
      return items.map(mapQuiz)
    } catch (error) {
      console.error('Failed to fetch quizzes via GraphQL:', error)
      throw new Error('Failed to fetch quizzes')
    }
  },

  getById: async (id: string): Promise<Quiz> => {
    try {
      const { data } = await apolloClient.query<QuizResponse, GetQuizVariables>({
        query: GET_QUIZ,
        variables: { id },
        fetchPolicy: 'network-only',
      })

      if (!data?.quiz) {
        throw new Error('Quiz not found')
      }

      return mapQuiz(data.quiz)
    } catch (error) {
      console.error('Failed to fetch quiz via GraphQL:', error)
      throw new Error('Failed to fetch quiz')
    }
  },

  getByLessonId: async (lessonId: string): Promise<Quiz[]> => {
    try {
      const { data } = await apolloClient.query<QuizzesResponse, GetQuizzesVariables>({
        query: GET_QUIZZES,
        variables: { lessonId, page: 1, pageSize: 50 },
        fetchPolicy: 'network-only',
      })

      const items = data?.quizzes?.items ?? []
      return items.map(mapQuiz)
    } catch (error) {
      console.error('Failed to fetch lesson quizzes via GraphQL:', error)
      throw new Error('Failed to fetch lesson quizzes')
    }
  },

  create: async (data: CreateQuizDto): Promise<Quiz> => {
    try {
      const { data: response } = await apolloClient.mutate<CreateQuizResponse, CreateQuizVariables>({
        mutation: CREATE_QUIZ,
        variables: { input: buildCreateQuizInput(data) },
        refetchQueries: [{ query: GET_QUIZZES, variables: { page: 1, pageSize: 50 } }],
      })

      if (!response?.createQuiz) {
        throw new Error('Missing createQuiz response')
      }

      return mapQuiz(response.createQuiz)
    } catch (error) {
      console.error('Failed to create quiz via GraphQL:', error)
      throw new Error('Failed to create quiz')
    }
  },

  update: async (id: string, data: Partial<CreateQuizDto>): Promise<Quiz> => {
    try {
      const variables: UpdateQuizVariables = {
        id,
        input: {
          title: data.title,
          description: data.description,
          lessonId: data.lesson_id,
          topicId: (data as any).topic_id, // optional mapping if provided
          levelId: (data as any).level_id, // optional mapping if provided
          timeLimitS: typeof data.time_limit === 'number' ? data.time_limit * 60 : undefined,
        },
      }

      const { data: response } = await apolloClient.mutate<UpdateQuizResponse, UpdateQuizVariables>({
        mutation: UPDATE_QUIZ,
        variables,
        refetchQueries: [
          { query: GET_QUIZZES, variables: { page: 1, pageSize: 50 } },
          { query: GET_QUIZ, variables: { id } },
        ],
      })

      if (!response?.updateQuiz) {
        throw new Error('Missing updateQuiz response')
      }

      return mapQuiz(response.updateQuiz)
    } catch (error) {
      console.error('Failed to update quiz via GraphQL:', error)
      throw new Error('Failed to update quiz')
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const { data } = await apolloClient.mutate<DeleteQuizResponse, DeleteQuizVariables>({
        mutation: DELETE_QUIZ,
        variables: { id },
        refetchQueries: [{ query: GET_QUIZZES, variables: { page: 1, pageSize: 50 } }],
      })

      if (!data?.deleteQuiz) {
        throw new Error('Failed to delete quiz')
      }
    } catch (error) {
      console.error('Failed to delete quiz via GraphQL:', error)
      throw new Error('Failed to delete quiz')
    }
  },

  duplicate: async () => {
    throw new Error('Duplicate quiz is not supported via GraphQL yet')
  },
}
