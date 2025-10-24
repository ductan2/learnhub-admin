import type { LessonSection } from '@/types/lesson'
import { apolloClient } from '@/lib/graphql/client'
import {
  CREATE_LESSON_SECTION,
  DELETE_LESSON_SECTION,
  GET_LESSON_SECTIONS,
  UPDATE_LESSON_SECTION,
} from '@/lib/graphql/queries'
import {
  CreateLessonSectionInput,
  CreateLessonSectionResponse,
  CreateLessonSectionVariables,
  DeleteLessonSectionResponse,
  DeleteLessonSectionVariables,
  GetLessonSectionsVariables,
  LessonSection as GraphqlLessonSection,
  LessonSectionsResponse,
  LessonSectionType,
  LessonSectionOrderField,
  OrderDirection,
  UpdateLessonSectionInput,
  UpdateLessonSectionResponse,
  UpdateLessonSectionVariables,
} from '@/content_schema'

type LessonSectionTypeKey = LessonSection['type']

const UI_TO_GRAPHQL_SECTION_TYPE: Record<LessonSectionTypeKey, LessonSectionType> = {
  text: LessonSectionType.TEXT,
  video: LessonSectionType.DIALOG,
  audio: LessonSectionType.AUDIO,
  image: LessonSectionType.IMAGE,
  quiz: LessonSectionType.EXERCISE,
  exercise: LessonSectionType.EXERCISE,
}

const GRAPHQL_TO_UI_SECTION_TYPE: Record<LessonSectionType, LessonSectionTypeKey> = {
  [LessonSectionType.TEXT]: 'text',
  [LessonSectionType.DIALOG]: 'video',
  [LessonSectionType.AUDIO]: 'audio',
  [LessonSectionType.IMAGE]: 'image',
  [LessonSectionType.EXERCISE]: 'exercise',
}

const toTrimmedString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const mapSectionBodyToUi = (section: GraphqlLessonSection): Partial<LessonSection> => {
  const body = (section.body ?? {}) as Record<string, unknown>
  const result: Partial<LessonSection> = {
    body,
  }

  const title = toTrimmedString(body.title)
  if (title) {
    result.title = title
  }

  switch (section.type) {
    case LessonSectionType.TEXT: {
      const content =
        toTrimmedString(body.content) ??
        toTrimmedString(body.text) ??
        toTrimmedString(body.html)
      if (content) {
        result.content = content
      }
      break
    }
    case LessonSectionType.DIALOG: {
      const content =
        toTrimmedString(body.videoUrl) ??
        toTrimmedString(body.content) ??
        toTrimmedString(body.embed) ??
        toTrimmedString(body.url)
      if (content) {
        result.content = content
      }
      const mediaId = toTrimmedString(body.mediaId)
      if (mediaId) {
        result.media_id = mediaId
      }
      break
    }
    case LessonSectionType.AUDIO: {
      const content =
        toTrimmedString(body.audioUrl) ?? toTrimmedString(body.url)
      if (content) {
        result.content = content
      }
      const mediaId = toTrimmedString(body.mediaId)
      if (mediaId) {
        result.media_id = mediaId
      }
      break
    }
    case LessonSectionType.IMAGE: {
      const content =
        toTrimmedString(body.imageUrl) ?? toTrimmedString(body.url)
      if (content) {
        result.content = content
      }
      const mediaId =
        toTrimmedString(body.mediaId) ?? toTrimmedString(body.imageId)
      if (mediaId) {
        result.media_id = mediaId
      }
      if (!result.title) {
        const caption = toTrimmedString(body.caption)
        if (caption) {
          result.title = caption
        }
      }
      break
    }
    case LessonSectionType.EXERCISE: {
      const quizId = toTrimmedString(body.quizId)
      if (quizId) {
        result.quiz_id = quizId
      }
      break
    }
  }

  return result
}

const mapSectionBodyToGraphql = (section: LessonSection): CreateLessonSectionInput['body'] => {
  const body: Record<string, any> = { ...(section.body ?? {}) }

  const trimmedContent = section.content?.trim()
  const trimmedTitle = section.title?.trim()
  const setString = (key: string, value?: string | null) => {
    if (value && value.trim()) {
      body[key] = value.trim()
    } else {
      delete body[key]
    }
  }

  switch (section.type) {
    case 'text': {
      setString('title', trimmedTitle ?? null)
      setString('content', trimmedContent ?? null)
      delete body.videoUrl
      delete body.audioUrl
      break
    }
    case 'video': {
      setString('title', trimmedTitle ?? null)
      if (trimmedContent) {
        body.videoUrl = trimmedContent
        body.content = trimmedContent
      } else {
        delete body.videoUrl
        delete body.content
      }
      if (section.media_id) {
        body.mediaId = section.media_id
      } else {
        delete body.mediaId
      }
      delete body.audioUrl
      break
    }
    case 'audio': {
      setString('title', trimmedTitle ?? null)
      if (trimmedContent) {
        body.audioUrl = trimmedContent
      } else {
        delete body.audioUrl
      }
      if (section.media_id) {
        body.mediaId = section.media_id
      } else {
        delete body.mediaId
      }
      delete body.videoUrl
      delete body.content
      break
    }
    case 'image': {
      setString('title', trimmedTitle ?? null)
      if (trimmedContent) {
        body.imageUrl = trimmedContent
        body.url = trimmedContent
      } else {
        delete body.imageUrl
        delete body.url
      }
      if (section.media_id) {
        body.mediaId = section.media_id
      } else {
        delete body.mediaId
      }
      break
    }
    case 'quiz': {
      setString('title', trimmedTitle ?? null)
      if (section.quiz_id) {
        body.quizId = section.quiz_id
      } else {
        delete body.quizId
      }
      break
    }
    case 'exercise': {
      setString('title', trimmedTitle ?? null)
      break
    }
  }

  return body
}

const mapLessonSection = (section: GraphqlLessonSection): LessonSection => ({
  id: section.id,
  lesson_id: section.lessonId,
  order: section.ord,
  type: GRAPHQL_TO_UI_SECTION_TYPE[section.type] ?? 'text',
  ...mapSectionBodyToUi(section),
})

const buildCreateInput = (section: LessonSection): CreateLessonSectionInput => {
  const input: CreateLessonSectionInput & { ord?: number } = {
    type: UI_TO_GRAPHQL_SECTION_TYPE[section.type] ?? LessonSectionType.TEXT,
    body: mapSectionBodyToGraphql(section),
  }

  return input
}

const buildUpdateInput = (section: LessonSection): UpdateLessonSectionInput => {
  const input: UpdateLessonSectionInput = {
    type: UI_TO_GRAPHQL_SECTION_TYPE[section.type] ?? LessonSectionType.TEXT,
    body: mapSectionBodyToGraphql(section),
  }


  return input
}

const isTemporaryId = (id: string) => id.startsWith('temp-')

export const lessonSections = {
  getByLessonId: async (lessonId: string): Promise<LessonSection[]> => {
    try {
      const variables: GetLessonSectionsVariables = {
        lessonId,
        page: 1,
        pageSize: 100,
        orderBy: {
          field: LessonSectionOrderField.ORD,
          direction: OrderDirection.ASC,
        },
      }

      const { data } = await apolloClient.query<LessonSectionsResponse, GetLessonSectionsVariables>({
        query: GET_LESSON_SECTIONS,
        variables,
        fetchPolicy: 'network-only',
      })

      if (!data?.lessonSections?.items) {
        return []
      }

      return data.lessonSections.items.map(mapLessonSection)
    } catch (error) {
      console.error('Failed to fetch lesson sections from GraphQL:', error)
      throw new Error('Failed to load lesson sections')
    }
  },

  create: async (lessonId: string, section: LessonSection): Promise<LessonSection> => {
    try {
      const input = buildCreateInput(section)
      const { data } = await apolloClient.mutate<CreateLessonSectionResponse, CreateLessonSectionVariables>({
        mutation: CREATE_LESSON_SECTION,
        variables: {
          lessonId,
          input,
        },
      })

      if (!data?.createLessonSection) {
        throw new Error('Failed to create lesson section')
      }

      return mapLessonSection(data.createLessonSection)
    } catch (error) {
      console.error('Failed to create lesson section via GraphQL:', error)
      throw new Error('Failed to create lesson section')
    }
  },

  update: async (section: LessonSection): Promise<LessonSection> => {
    if (isTemporaryId(section.id)) {
      throw new Error('Cannot update a section that has not been saved yet')
    }

    try {
      const input = buildUpdateInput(section)
      const { data } = await apolloClient.mutate<UpdateLessonSectionResponse, UpdateLessonSectionVariables>({
        mutation: UPDATE_LESSON_SECTION,
        variables: {
          id: section.id,
          input,
        },
      })

      if (!data?.updateLessonSection) {
        throw new Error('Failed to update lesson section')
      }

      return mapLessonSection(data.updateLessonSection)
    } catch (error) {
      console.error('Failed to update lesson section via GraphQL:', error)
      throw new Error('Failed to update lesson section')
    }
  },

  delete: async (id: string): Promise<void> => {
    if (isTemporaryId(id)) {
      return
    }

    try {
      const { data } = await apolloClient.mutate<DeleteLessonSectionResponse, DeleteLessonSectionVariables>({
        mutation: DELETE_LESSON_SECTION,
        variables: { id },
      })

      if (!data?.deleteLessonSection) {
        throw new Error('Failed to delete lesson section')
      }
    } catch (error) {
      console.error('Failed to delete lesson section via GraphQL:', error)
      throw new Error('Failed to delete lesson section')
    }
  },

  sync: async (
    lessonId: string,
    updatedSections: LessonSection[],
    originalSections: LessonSection[],
  ): Promise<LessonSection[]> => {
    const originalById = new Map(originalSections.map((section) => [section.id, section]))
    const updatedById = new Map(updatedSections.map((section) => [section.id, section]))

    const deletionPromises = originalSections
      .filter((section) => !updatedById.has(section.id))
      .map((section) => lessonSections.delete(section.id))

    await Promise.all(deletionPromises)

    for (const section of updatedSections) {
      if (isTemporaryId(section.id)) {
        await lessonSections.create(lessonId, section)
      } else {
        const original = originalById.get(section.id)
        const hasChanged =
          !original ||
          original.type !== section.type ||
          original.content !== section.content ||
          original.title !== section.title ||
          original.media_id !== section.media_id ||
          original.quiz_id !== section.quiz_id ||
          original.order !== section.order ||
          JSON.stringify(original.body ?? null) !== JSON.stringify(section.body ?? null)

        if (hasChanged) {
          await lessonSections.update(section)
        }
      }
    }

    return await lessonSections.getByLessonId(lessonId)
  },
}
