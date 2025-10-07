import type { Lesson, LessonFilters, CreateLessonDto, UpdateLessonDto } from '@/types/lesson'
import { apolloClient } from '@/lib/graphql/client'
import {
  CREATE_LESSON,
  GET_LESSON,
  GET_LESSONS,
  PUBLISH_LESSON,
  UNPUBLISH_LESSON,
  UPDATE_LESSON,
} from '@/lib/graphql/queries'
import {
  CreateLessonInput,
  CreateLessonResponse,
  CreateLessonVariables,
  GetLessonVariables,
  GetLessonsVariables,
  Lesson as GraphqlLesson,
  LessonFilterInput,
  LessonResponse,
  LessonsResponse,
  PublishLessonResponse,
  PublishLessonVariables,
  UnpublishLessonResponse,
  UnpublishLessonVariables,
  UpdateLessonInput,
  UpdateLessonResponse,
  UpdateLessonVariables,
  LessonOrderField,
  OrderDirection,
} from '@/content_schema'

const DEFAULT_LESSON_PAGE_SIZE = 100

const mapLesson = (lesson: GraphqlLesson): Lesson => ({
  id: lesson.id,
  code: lesson.code ?? undefined,
  title: lesson.title,
  description: lesson.description,
  topic_id: lesson.topic?.id ?? '',
  level_id: lesson.level?.id ?? '',
  is_published: lesson.isPublished,
  created_at: lesson.createdAt,
  updated_at: lesson.updatedAt,
  published_at: lesson.publishedAt ?? undefined,
  version: lesson.version,
  created_by: lesson.createdBy ?? undefined,
  enrollment_count: (lesson as unknown as { enrollmentCount?: number }).enrollmentCount,
  completion_rate: (lesson as unknown as { completionRate?: number }).completionRate,
})

const buildLessonFilter = (filters?: LessonFilters): LessonFilterInput | undefined => {
  if (!filters) return undefined

  const filter: LessonFilterInput = {}

  if (filters.topic_id) {
    filter.topicId = filters.topic_id
  }

  if (filters.level_id) {
    filter.levelId = filters.level_id
  }

  if (filters.is_published !== undefined) {
    filter.isPublished = filters.is_published
  }

  if (filters.search) {
    filter.search = filters.search
  }

  if (filters.created_by) {
    filter.createdBy = filters.created_by
  }

  return filter
}

const buildCreateLessonInput = (data: CreateLessonDto): CreateLessonInput => {
  const input: CreateLessonInput = {
    title: data.title,
  }

  if (data.code?.trim()) {
    input.code = data.code.trim()
  }

  if (data.description?.trim()) {
    input.description = data.description.trim()
  }

  if (data.topic_id) {
    input.topicId = data.topic_id
  }

  if (data.level_id) {
    input.levelId = data.level_id
  }

  if (data.created_by) {
    input.createdBy = data.created_by
  }

  return input
}

const buildUpdateLessonInput = (data: UpdateLessonDto): UpdateLessonInput => {
  const input: UpdateLessonInput = {}

  if (typeof data.title === 'string') {
    input.title = data.title
  }

  if (typeof data.description === 'string') {
    input.description = data.description
  }

  if (typeof data.topic_id === 'string') {
    input.topicId = data.topic_id
  }

  if (typeof data.level_id === 'string') {
    input.levelId = data.level_id
  }

  return input
}

const publishLessonByStatus = async (lessonId: string, published: boolean): Promise<Lesson> => {
  if (published) {
    const { data } = await apolloClient.mutate<PublishLessonResponse, PublishLessonVariables>({
      mutation: PUBLISH_LESSON,
      variables: { id: lessonId },
    })

    if (!data?.publishLesson) {
      throw new Error('Failed to publish lesson')
    }

    return mapLesson(data.publishLesson)
  }

  const { data } = await apolloClient.mutate<UnpublishLessonResponse, UnpublishLessonVariables>({
    mutation: UNPUBLISH_LESSON,
    variables: { id: lessonId },
  })

  if (!data?.unpublishLesson) {
    throw new Error('Failed to unpublish lesson')
  }

  return mapLesson(data.unpublishLesson)
}

export const lessons = {
  getAll: async (filters?: LessonFilters): Promise<Lesson[]> => {
    try {
      const variables: GetLessonsVariables = {
        page: 1,
        pageSize: DEFAULT_LESSON_PAGE_SIZE,
        orderBy: {
          field: LessonOrderField.CREATED_AT,
          direction: OrderDirection.DESC,
        },
      }

      const filter = buildLessonFilter(filters)
      if (filter && Object.keys(filter).length > 0) {
        variables.filter = filter
      }

      const { data } = await apolloClient.query<LessonsResponse, GetLessonsVariables>({
        query: GET_LESSONS,
        variables,
        fetchPolicy: 'network-only',
      })

      if (!data?.lessons?.items) {
        return []
      }

      return data.lessons.items.map(mapLesson)
    } catch (error) {
      console.error('Failed to fetch lessons from GraphQL:', error)
      throw new Error('Failed to fetch lessons')
    }
  },

  getById: async (id: string): Promise<Lesson> => {
    try {
      const { data } = await apolloClient.query<LessonResponse, GetLessonVariables>({
        query: GET_LESSON,
        variables: { id },
        fetchPolicy: 'network-only',
      })

      if (!data?.lesson) {
        throw new Error('Lesson not found')
      }

      return mapLesson(data.lesson)
    } catch (error) {
      console.error('Failed to fetch lesson from GraphQL:', error)
      throw new Error('Failed to load lesson')
    }
  },

  create: async (data: CreateLessonDto): Promise<Lesson> => {
    try {
      const { is_published, ...rest } = data
      const input = buildCreateLessonInput(rest)

      const { data: response } = await apolloClient.mutate<CreateLessonResponse, CreateLessonVariables>({
        mutation: CREATE_LESSON,
        variables: { input },
      })

      if (!response?.createLesson) {
        throw new Error('Failed to create lesson')
      }

      const createdLesson = mapLesson(response.createLesson)

      if (is_published) {
        return publishLessonByStatus(createdLesson.id, true)
      }

      return createdLesson
    } catch (error) {
      console.error('Failed to create lesson via GraphQL:', error)
      throw new Error('Failed to create lesson')
    }
  },

  update: async (id: string, data: UpdateLessonDto): Promise<Lesson> => {
    try {
      const { is_published, ...rest } = data
      const input = buildUpdateLessonInput(rest)

      const { data: response } = await apolloClient.mutate<UpdateLessonResponse, UpdateLessonVariables>({
        mutation: UPDATE_LESSON,
        variables: { id, input },
      })

      if (!response?.updateLesson) {
        throw new Error('Failed to update lesson')
      }

      let updatedLesson = mapLesson(response.updateLesson)

      if (typeof is_published === 'boolean') {
        updatedLesson = await publishLessonByStatus(id, is_published)
      }

      return updatedLesson
    } catch (error) {
      console.error('Failed to update lesson via GraphQL:', error)
      throw new Error('Failed to update lesson')
    }
  },

  publish: async (id: string, published: boolean): Promise<Lesson> => {
    try {
      return await publishLessonByStatus(id, published)
    } catch (error) {
      console.error('Failed to update lesson publish status via GraphQL:', error)
      throw new Error('Failed to update lesson status')
    }
  },

  delete: async () => {
    throw new Error('Lesson deletion is not supported via GraphQL API yet')
  },
}
