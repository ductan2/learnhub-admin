import type {
  Course,
  CourseFilters,
  CreateCourseDto,
  UpdateCourseDto,
  AddLessonToCourseDto,
  CourseLesson,
  CourseReview,
  CourseReviewCollection,
} from '@/types/course'
import { apolloClient } from '@/lib/graphql/client'
import {
  ADD_COURSE_LESSON,
  CREATE_COURSE,
  DELETE_COURSE,
  DELETE_COURSE_REVIEW,
  GET_COURSE,
  GET_COURSES,
  GET_COURSE_LESSONS,
  GET_COURSE_REVIEWS,
  PUBLISH_COURSE,
  REORDER_COURSE_LESSONS,
  REMOVE_COURSE_LESSON,
  SUBMIT_COURSE_REVIEW,
  UNPUBLISH_COURSE,
  UPDATE_COURSE,
} from '@/lib/graphql/queries'

const DEFAULT_COURSE_PAGE_SIZE = 100

type GraphqlCourse = {
  id: string
  title: string
  description?: string | null
  topicId?: string | null
  levelId?: string | null
  instructorId?: string | null
  thumbnailURL?: string | null
  isPublished: boolean
  isFeatured: boolean
  price?: number | null
  durationHours?: number | null
  averageRating?: number | null
  reviewCount: number
  createdAt: string
  updatedAt: string
  publishedAt?: string | null
  lessons?: Array<{
    id: string
    courseId?: string | null
    lessonId: string
    ord?: number | null
    isRequired?: boolean | null
    createdAt?: string | null
    lesson?: {
      id: string
      title: string
      description?: string | null
      isPublished?: boolean
      topic?: { id: string; name: string } | null
      level?: { id: string; name: string } | null
    } | null
  }>
}

type GraphqlCourseCollection = {
  courses: {
    items: GraphqlCourse[]
    totalCount: number
    page: number
    pageSize: number
  }
}

type GraphqlCourseLesson = NonNullable<GraphqlCourse['lessons']>[number]

const mapCourseLesson = (lesson: GraphqlCourseLesson): CourseLesson => ({
  id: lesson.id,
  course_id: lesson.courseId ?? '',
  lesson_id: lesson.lessonId,
  ord: lesson.ord ?? 0,
  is_required: lesson.isRequired ?? true,
  created_at: lesson.createdAt ?? '',
  lesson: lesson.lesson
    ? {
        id: lesson.lesson.id,
        title: lesson.lesson.title,
        description: lesson.lesson.description ?? null,
        topic: lesson.lesson.topic ?? undefined,
        level: lesson.lesson.level ?? undefined,
        is_published: lesson.lesson.isPublished,
      }
    : undefined,
})

const mapCourse = (course: GraphqlCourse): Course => {
  const lessonIds = Array.isArray(course.lessons)
    ? course.lessons
        .map((lesson) => lesson.lessonId)
        .filter((id): id is string => typeof id === 'string' && id.length > 0)
    : []

  const hasDetailedLessonInfo = Array.isArray(course.lessons)
    ? course.lessons.some(
        (lesson) =>
          lesson.ord !== undefined || lesson.isRequired !== undefined || !!lesson.lesson || !!lesson.courseId
      )
    : false

  const lessons = hasDetailedLessonInfo
    ? course.lessons?.map((lesson) => mapCourseLesson(lesson))
    : undefined

  return {
    id: course.id,
    title: course.title,
    description: course.description ?? null,
    topic_id: course.topicId ?? null,
    level_id: course.levelId ?? null,
    instructor_id: course.instructorId ?? null,
    thumbnail_url: course.thumbnailURL ?? null,
    is_published: course.isPublished,
    is_featured: course.isFeatured,
    price: course.price ?? null,
    duration_hours: course.durationHours ?? null,
    average_rating: course.averageRating ?? null,
    review_count: course.reviewCount,
    created_at: course.createdAt,
    updated_at: course.updatedAt,
    published_at: course.publishedAt ?? null,
    enrollment_count: null,
    completion_rate: null,
    lesson_ids: lessonIds,
    lessons,
  }
}

const buildCourseFilter = (filters?: CourseFilters) => {
  if (!filters) return undefined

  const filter: Record<string, unknown> = {}

  if (filters.topic_id) {
    filter.topicId = filters.topic_id
  }

  if (filters.level_id) {
    filter.levelId = filters.level_id
  }

  if (filters.instructor_id) {
    filter.instructorId = filters.instructor_id
  }

  if (filters.is_published !== undefined) {
    filter.isPublished = filters.is_published
  }

  if (filters.is_featured !== undefined) {
    filter.isFeatured = filters.is_featured
  }

  if (filters.search) {
    filter.search = filters.search
  }

  return Object.keys(filter).length > 0 ? filter : undefined
}

const buildCreateCourseInput = (data: CreateCourseDto) => {
  const user = localStorage.getItem('user')
  const userID = user ? JSON.parse(user).id : null
  const input: Record<string, unknown> = {
    title: data.title,
    instructorId: userID,
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

  if (data.thumbnail_url?.trim()) {
    input.thumbnailURL = data.thumbnail_url.trim()
  }

  if (typeof data.is_featured === 'boolean') {
    input.isFeatured = data.is_featured
  }

  if (typeof data.price === 'number') {
    input.price = data.price
  }

  if (typeof data.duration_hours === 'number') {
    input.durationHours = data.duration_hours
  }

  return input
}

const buildUpdateCourseInput = (data: UpdateCourseDto) => {
  const input: Record<string, unknown> = {}

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

  if (typeof data.instructor_id === 'string') {
    input.instructorId = data.instructor_id
  }

  if (typeof data.thumbnail_url === 'string') {
    input.thumbnailURL = data.thumbnail_url
  }

  if (typeof data.is_featured === 'boolean') {
    input.isFeatured = data.is_featured
  }

  if (typeof data.price === 'number') {
    input.price = data.price
  }

  if (typeof data.duration_hours === 'number') {
    input.durationHours = data.duration_hours
  }

  return input
}

const fetchCourseById = async (id: string): Promise<Course> => {
  const { data } = await apolloClient.query<{ course: GraphqlCourse }>({
    query: GET_COURSE,
    variables: { id },
    fetchPolicy: 'network-only',
  })

  if (!data?.course) {
    throw new Error('Course not found')
  }

  return mapCourse(data.course)
}

const fetchCourseLessons = async (courseId: string): Promise<CourseLesson[]> => {
  const { data } = await apolloClient.query({
    query: GET_COURSE_LESSONS,
    variables: {
      courseId,
      page: 1,
      pageSize: DEFAULT_COURSE_PAGE_SIZE,
      orderBy: { field: 'ORD', direction: 'ASC' },
    },
    fetchPolicy: 'network-only',
  })

  const collection = (data as any)?.courseLessons
  if (!collection?.items) {
    return []
  }

  return collection.items.map((item: any) => mapCourseLesson(item))
}

const duplicateCourseLessons = async (sourceCourseId: string, targetCourseId: string) => {
  const lessons = await fetchCourseLessons(sourceCourseId)
  if (!lessons.length) return

  for (const lesson of lessons.sort((a, b) => a.ord - b.ord)) {
    await apolloClient.mutate({
      mutation: ADD_COURSE_LESSON,
      variables: {
        courseId: targetCourseId,
        input: {
          lessonId: lesson.lesson_id,
          ord: lesson.ord,
          isRequired: lesson.is_required,
        },
      },
    })
  }
}

export const courses = {
  getAll: async (filters?: CourseFilters): Promise<Course[]> => {
    try {
      const variables: Record<string, unknown> = {
        page: 1,
        pageSize: DEFAULT_COURSE_PAGE_SIZE,
        orderBy: { field: 'CREATED_AT', direction: 'DESC' },
      }

      const filter = buildCourseFilter(filters)
      if (filter) {
        variables.filter = filter
      }

      const { data } = await apolloClient.query<GraphqlCourseCollection>({
        query: GET_COURSES,
        variables,
        fetchPolicy: 'network-only',
      })

      const items = data?.courses?.items ?? []
      return items.map(mapCourse)
    } catch (error) {
      console.error('Failed to fetch courses from GraphQL:', error)
      throw new Error('Failed to fetch courses')
    }
  },

  getById: fetchCourseById,

  create: async (data: CreateCourseDto): Promise<Course> => {
    try {
      const { is_published, ...rest } = data
      const input = buildCreateCourseInput({ ...rest, title: data.title })

      const { data: response } = await apolloClient.mutate<{ createCourse: GraphqlCourse }>({
        mutation: CREATE_COURSE,
        variables: { input },
      })

      if (!response?.createCourse) {
        throw new Error('Failed to create course')
      }

      let course = mapCourse(response.createCourse)

      if (is_published) {
        course = await courses.publish(course.id, true)
      }

      return course
    } catch (error) {
      console.error('Failed to create course via GraphQL:', error)
      throw new Error('Failed to create course')
    }
  },

  update: async (id: string, data: UpdateCourseDto): Promise<Course> => {
    try {
      const { is_published, ...rest } = data
      const input = buildUpdateCourseInput(rest)

      let course: Course | null = null

      if (Object.keys(input).length > 0) {
        const { data: response } = await apolloClient.mutate<{ updateCourse: GraphqlCourse }>({
          mutation: UPDATE_COURSE,
          variables: { id, input },
        })

        if (!response?.updateCourse) {
          throw new Error('Failed to update course')
        }

        course = mapCourse(response.updateCourse)
      } else {
        course = await fetchCourseById(id)
      }

      if (typeof is_published === 'boolean') {
        course = await courses.publish(id, is_published)
      }

      return course
    } catch (error) {
      console.error('Failed to update course via GraphQL:', error)
      throw new Error('Failed to update course')
    }
  },

  publish: async (id: string, published: boolean): Promise<Course> => {
    try {
      if (published) {
        const { data } = await apolloClient.mutate<{ publishCourse: { id: string } }>({
          mutation: PUBLISH_COURSE,
          variables: { id },
        })

        if (!data?.publishCourse) {
          throw new Error('Failed to publish course')
        }
      } else {
        const { data } = await apolloClient.mutate<{ unpublishCourse: { id: string } }>({
          mutation: UNPUBLISH_COURSE,
          variables: { id },
        })

        if (!data?.unpublishCourse) {
          throw new Error('Failed to unpublish course')
        }
      }

      return await fetchCourseById(id)
    } catch (error) {
      console.error('Failed to toggle course publish status via GraphQL:', error)
      throw new Error('Failed to update course status')
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apolloClient.mutate({
        mutation: DELETE_COURSE,
        variables: { id },
      })
    } catch (error) {
      console.error('Failed to delete course via GraphQL:', error)
      throw new Error('Failed to delete course')
    }
  },

  duplicate: async (id: string): Promise<Course> => {
    try {
      const course = await fetchCourseById(id)
      const duplicateTitle = `${course.title} (Copy)`

      const newCourse = await courses.create({
        title: duplicateTitle,
        description: course.description ?? undefined,
        topic_id: course.topic_id ?? undefined,
        level_id: course.level_id ?? undefined,
        instructor_id: course.instructor_id ?? undefined,
        thumbnail_url: course.thumbnail_url ?? undefined,
        is_featured: course.is_featured,
        price: course.price ?? undefined,
        duration_hours: course.duration_hours ?? undefined,
        is_published: false,
      })

      if (course.lesson_ids.length > 0) {
        await duplicateCourseLessons(id, newCourse.id)
      }

      return newCourse
    } catch (error) {
      console.error('Failed to duplicate course via GraphQL:', error)
      throw new Error('Failed to duplicate course')
    }
  },

  addLesson: async (data: AddLessonToCourseDto): Promise<CourseLesson> => {
    try {
      const { data: response } = await apolloClient.mutate<{ addCourseLesson: any }>({
        mutation: ADD_COURSE_LESSON,
        variables: {
          courseId: data.course_id,
          input: {
            lessonId: data.lesson_id,
            ord: data.ord ?? 1,
            isRequired: data.is_required ?? true,
          },
        },
      })

      if (!response?.addCourseLesson) {
        throw new Error('Failed to add course lesson')
      }

      return mapCourseLesson(response.addCourseLesson)
    } catch (error) {
      console.error('Failed to add lesson to course via GraphQL:', error)
      throw new Error('Failed to add lesson to course')
    }
  },

  removeLesson: async (courseLessonId: string): Promise<void> => {
    try {
      await apolloClient.mutate({
        mutation: REMOVE_COURSE_LESSON,
        variables: { id: courseLessonId },
      })
    } catch (error) {
      console.error('Failed to remove course lesson via GraphQL:', error)
      throw new Error('Failed to remove course lesson')
    }
  },

  reorderLessons: async (courseId: string, lessonIds: string[]): Promise<void> => {
    try {
      await apolloClient.mutate({
        mutation: REORDER_COURSE_LESSONS,
        variables: { courseId, lessonIds },
      })
    } catch (error) {
      console.error('Failed to reorder course lessons via GraphQL:', error)
      throw new Error('Failed to reorder course lessons')
    }
  },

  getLessons: fetchCourseLessons,

  getReviews: async (courseId: string, page = 1, pageSize = 20): Promise<CourseReviewCollection> => {
    try {
      const { data } = await apolloClient.query({
        query: GET_COURSE_REVIEWS,
        variables: { courseId, page, pageSize },
        fetchPolicy: 'network-only',
      })

      const course = (data as any)?.course
      const collection = course?.reviews

      if (!collection) {
        return { items: [], total_count: 0, page, page_size: pageSize }
      }

      const items = (collection.items ?? []).map((item: any) => ({
        id: item.id,
        course_id: item.courseId,
        user_id: item.userId,
        rating: item.rating,
        comment: item.comment ?? null,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
      }))

      return {
        items,
        total_count: collection.totalCount ?? items.length,
        page: collection.page ?? page,
        page_size: collection.pageSize ?? pageSize,
        average_rating: course?.averageRating ?? null,
        review_count: course?.reviewCount ?? items.length,
      }
    } catch (error) {
      console.error('Failed to fetch course reviews via GraphQL:', error)
      throw new Error('Failed to fetch course reviews')
    }
  },

  submitReview: async (courseId: string, rating: number, comment?: string): Promise<CourseReview> => {
    try {
      const { data } = await apolloClient.mutate({
        mutation: SUBMIT_COURSE_REVIEW,
        variables: {
          input: {
            courseId,
            rating,
            comment,
          },
        },
      })

      const review = (data as any)?.submitCourseReview
      if (!review) {
        throw new Error('Failed to submit course review')
      }

      return {
        id: review.id,
        course_id: review.courseId,
        user_id: review.userId,
        rating: review.rating,
        comment: review.comment ?? null,
        created_at: review.createdAt,
        updated_at: review.updatedAt,
      }
    } catch (error) {
      console.error('Failed to submit course review via GraphQL:', error)
      throw new Error('Failed to submit course review')
    }
  },

  deleteReview: async (courseId: string): Promise<void> => {
    try {
      await apolloClient.mutate({
        mutation: DELETE_COURSE_REVIEW,
        variables: { courseId },
      })
    } catch (error) {
      console.error('Failed to delete course review via GraphQL:', error)
      throw new Error('Failed to delete course review')
    }
  },
}
