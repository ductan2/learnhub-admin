import type { Lesson, LessonFilters, CreateLessonDto, UpdateLessonDto } from '@/types/lesson'
import { delay } from '@/lib/api/utils'
import { mockLessons } from '@/lib/mock-data'

export const lessons = {
  getAll: async (filters?: LessonFilters): Promise<Lesson[]> => {
    await delay()
    let lessons = [...mockLessons]

    if (filters?.topic_id) {
      lessons = lessons.filter((l) => l.topic_id === filters.topic_id)
    }
    if (filters?.level_id) {
      lessons = lessons.filter((l) => l.level_id === filters.level_id)
    }
    if (filters?.is_published !== undefined) {
      lessons = lessons.filter((l) => l.is_published === filters.is_published)
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase()
      lessons = lessons.filter((l) => l.title.toLowerCase().includes(search) || l.description?.toLowerCase().includes(search))
    }

    return lessons
  },

  getById: async (id: string): Promise<Lesson> => {
    await delay()
    const lesson = mockLessons.find((l) => l.id === id)
    if (!lesson) throw new Error('Lesson not found')
    return lesson
  },

  create: async (data: CreateLessonDto): Promise<Lesson> => {
    await delay()
    const newLesson: Lesson = {
      id: String(mockLessons.length + 1),
      ...data,
      is_published: data.is_published ?? false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
      enrollment_count: 0,
      completion_rate: 0,
    }
    mockLessons.push(newLesson)
    return newLesson
  },

  update: async (id: string, data: UpdateLessonDto): Promise<Lesson> => {
    await delay()
    const lesson = mockLessons.find((l) => l.id === id)
    if (!lesson) throw new Error('Lesson not found')
    Object.assign(lesson, data)
    lesson.updated_at = new Date().toISOString()
    lesson.version += 1
    return lesson
  },

  publish: async (id: string, published: boolean): Promise<Lesson> => {
    await delay()
    const lesson = mockLessons.find((l) => l.id === id)
    if (!lesson) throw new Error('Lesson not found')
    lesson.is_published = published
    lesson.updated_at = new Date().toISOString()
    return lesson
  },

  delete: async (id: string): Promise<void> => {
    await delay()
    const index = mockLessons.findIndex((l) => l.id === id)
    if (index === -1) throw new Error('Lesson not found')
    mockLessons.splice(index, 1)
  },
}
