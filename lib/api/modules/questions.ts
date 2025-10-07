import { apolloClient } from '@/lib/graphql/client'
import {
  GET_QUIZ_QUESTIONS,
  ADD_QUIZ_QUESTION,
  ADD_QUESTION_OPTION,
  UPDATE_QUESTION_OPTION,
  DELETE_QUESTION_OPTION,
} from '@/lib/graphql/queries'
import type {
  QuizQuestion as GraphqlQuizQuestion,
  QuestionOption as GraphqlQuestionOption,
  QuizQuestionsResponse,
  GetQuizQuestionsVariables,
  AddQuizQuestionResponse,
  AddQuizQuestionVariables,
  AddQuestionOptionResponse,
  AddQuestionOptionVariables,
  UpdateQuestionOptionResponse,
  UpdateQuestionOptionVariables,
  DeleteQuestionOptionResponse,
  DeleteQuestionOptionVariables,
} from '@/content_schema'
import type { Question, CreateQuestionDto, QuestionOption } from '@/types/quiz'

const normalizeQuestionType = (type: string): Question['type'] => {
  const normalized = type?.toLowerCase()
  switch (normalized) {
    case 'multiple_choice':
    case 'multiple-choice':
      return 'multiple_choice'
    case 'true_false':
    case 'truefalse':
    case 'true-false':
      return 'true_false'
    case 'fill_blank':
    case 'fill-blank':
    case 'fill_in_the_blank':
      return 'fill_blank'
    case 'audio':
      return 'audio'
    default:
      return 'short_answer'
  }
}

const mapOption = (option: GraphqlQuestionOption): QuestionOption => ({
  id: option.id,
  question_id: option.questionId ?? '',
  option_text: option.label,
  is_correct: option.isCorrect,
  order: option.ord ?? 0,
  feedback: option.feedback ?? undefined,
})

const mapQuestion = (question: GraphqlQuizQuestion): Question => ({
  id: question.id,
  quiz_id: question.quizId,
  type: normalizeQuestionType(question.type),
  question_text: question.prompt,
  points: question.points ?? 0,
  order: question.ord ?? 0,
  prompt_media_id: question.promptMedia ?? undefined,
  metadata: question.metadata ?? undefined,
  options: (question.options ?? []).map(mapOption),
})

const buildQuestionInput = (data: CreateQuestionDto): AddQuizQuestionVariables['input'] => ({
  type: data.type.replace(/-/g, '_').toUpperCase(),
  prompt: data.question_text,
  promptMedia: data.prompt_media_id,
  points: data.points,
  metadata: data.metadata,
})

export const questions = {
  getByQuizId: async (quizId: string): Promise<Question[]> => {
    try {
      const { data } = await apolloClient.query<QuizQuestionsResponse, GetQuizQuestionsVariables>({
        query: GET_QUIZ_QUESTIONS,
        variables: { quizId, page: 1, pageSize: 100 },
        fetchPolicy: 'network-only',
      })

      const items = data?.quizQuestions?.items ?? []
      return items.map(mapQuestion)
    } catch (error) {
      console.error('Failed to fetch quiz questions via GraphQL:', error)
      throw new Error('Failed to fetch quiz questions')
    }
  },

  create: async (data: CreateQuestionDto): Promise<Question> => {
    try {
      const { data: response } = await apolloClient.mutate<AddQuizQuestionResponse, AddQuizQuestionVariables>({
        mutation: ADD_QUIZ_QUESTION,
        variables: { quizId: data.quiz_id, input: buildQuestionInput(data) },
        refetchQueries: [{ query: GET_QUIZ_QUESTIONS, variables: { quizId: data.quiz_id } }],
      })

      if (!response?.addQuizQuestion) {
        throw new Error('Missing addQuizQuestion response')
      }

      const question = mapQuestion(response.addQuizQuestion)

      if (data.options?.length) {
        await Promise.all(
          data.options.map((option, index) =>
            questions.addOption(
              response.addQuizQuestion.id,
              {
                ord: index + 1,
                label: option.option_text,
                isCorrect: option.is_correct,
              },
              data.quiz_id
            )
          )
        )

        const refreshed = await questions.getByQuizId(data.quiz_id)
        return refreshed.find((q) => q.id === response.addQuizQuestion.id) ?? question
      }

      return question
    } catch (error) {
      console.error('Failed to create quiz question via GraphQL:', error)
      throw new Error('Failed to create quiz question')
    }
  },

  addOption: async (
    questionId: string,
    input: { ord: number; label: string; isCorrect: boolean; feedback?: string },
    quizId?: string
  ): Promise<QuestionOption> => {
    try {
      const { data } = await apolloClient.mutate<AddQuestionOptionResponse, AddQuestionOptionVariables>({
        mutation: ADD_QUESTION_OPTION,
        variables: {
          questionId,
          input: {
            ord: input.ord,
            label: input.label,
            isCorrect: input.isCorrect,
            feedback: input.feedback,
          },
        },
        refetchQueries: quizId
          ? [{ query: GET_QUIZ_QUESTIONS, variables: { quizId, page: 1, pageSize: 100 } }]
          : undefined,
      })

      if (!data?.addQuestionOption) {
        throw new Error('Missing addQuestionOption response')
      }

      return mapOption(data.addQuestionOption)
    } catch (error) {
      console.error('Failed to add question option via GraphQL:', error)
      throw new Error('Failed to add question option')
    }
  },

  updateOption: async (
    optionId: string,
    input: { label?: string; isCorrect?: boolean; feedback?: string }
  ): Promise<QuestionOption> => {
    try {
      const { data } = await apolloClient.mutate<UpdateQuestionOptionResponse, UpdateQuestionOptionVariables>({
        mutation: UPDATE_QUESTION_OPTION,
        variables: { id: optionId, input },
      })

      if (!data?.updateQuestionOption) {
        throw new Error('Missing updateQuestionOption response')
      }

      return mapOption(data.updateQuestionOption)
    } catch (error) {
      console.error('Failed to update question option via GraphQL:', error)
      throw new Error('Failed to update question option')
    }
  },

  deleteOption: async (optionId: string): Promise<void> => {
    try {
      await apolloClient.mutate<DeleteQuestionOptionResponse, DeleteQuestionOptionVariables>({
        mutation: DELETE_QUESTION_OPTION,
        variables: { id: optionId },
      })
    } catch (error) {
      console.error('Failed to delete question option via GraphQL:', error)
      throw new Error('Failed to delete question option')
    }
  },
}
