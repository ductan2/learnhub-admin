import type { Course, CourseFilters, CreateCourseDto, UpdateCourseDto, AddLessonToCourseDto } from '@/types/course'
import type { Lesson } from '@/types/lesson'
import { delay } from '@/lib/api/utils'
import { mockCourses, mockCourseLessons, mockLessons } from '@/lib/mock-data'

export const courses = {
  getAll: async (filters?: CourseFilters): Promise<Course[]> => {
    await delay()
    let courses = [...mockCourses]

    if (filters?.topic_id) {
      courses = courses.filter((c) => c.topic_id === filters.topic_id)
    }
    if (filters?.level_id) {
      courses = courses.filter((c) => c.level_id === filters.level_id)
    }
    if (filters?.instructor_id) {
      courses = courses.filter((c) => c.instructor_id === filters.instructor_id)
    }
    if (filters?.is_published !== undefined) {
      courses = courses.filter((c) => c.is_published === filters.is_published)
    }
    if (filters?.is_featured !== undefined) {
      courses = courses.filter((c) => c.is_featured === filters.is_featured)
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase()
      courses = courses.filter((c) => c.title.toLowerCase().includes(search) || c.description?.toLowerCase().includes(search))
    }
    if (filters?.min_price !== undefined) {
      courses = courses.filter((c) => (c.price || 0) >= filters.min_price!)
    }
    if (filters?.max_price !== undefined) {
      courses = courses.filter((c) => (c.price || 0) <= filters.max_price!)
    }

    return courses
  },

  getById: async (id: string): Promise<Course> => {
    await delay()
    const course = mockCourses.find((c) => c.id === id)
    if (!course) throw new Error('Course not found')
    return course
  },

  create: async (data: CreateCourseDto): Promise<Course> => {
    await delay()
    const newCourse: Course = {
      id: String(mockCourses.length + 1),
      ...data,
      is_published: data.is_published ?? false,
      is_featured: data.is_featured ?? false,
      lesson_ids: data.lesson_ids ?? [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      enrollment_count: 0,
      completion_rate: 0,
      rating: 0,
    }
    mockCourses.push(newCourse)
    return newCourse
  },

  update: async (id: string, data: UpdateCourseDto): Promise<Course> => {
    await delay()
    const course = mockCourses.find((c) => c.id === id)
    if (!course) throw new Error('Course not found')
    Object.assign(course, data)
    course.updated_at = new Date().toISOString()
    return course
  },

  publish: async (id: string, published: boolean): Promise<Course> => {
    await delay()
    const course = mockCourses.find((c) => c.id === id)
    if (!course) throw new Error('Course not found')
    course.is_published = published
    course.updated_at = new Date().toISOString()
    return course
  },

  delete: async (id: string): Promise<void> => {
    await delay()
    const index = mockCourses.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('Course not found')
    mockCourses.splice(index, 1)
  },

  duplicate: async (id: string): Promise<Course> => {
    await delay()
    const course = mockCourses.find((c) => c.id === id)
    if (!course) throw new Error('Course not found')
    const newCourse: Course = {
      ...course,
      id: String(mockCourses.length + 1),
      title: `${course.title} (Copy)`,
      is_published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      enrollment_count: 0,
      completion_rate: 0,
    }
    mockCourses.push(newCourse)
    return newCourse
  },

  addLesson: async (data: AddLessonToCourseDto): Promise<void> => {
    await delay()
    const course = mockCourses.find((c) => c.id === data.course_id)
    if (!course) throw new Error('Course not found')
    if (!course.lesson_ids.includes(data.lesson_id)) {
      course.lesson_ids.push(data.lesson_id)
      course.updated_at = new Date().toISOString()
    }
    const newCourseLesson = {
      id: String(mockCourseLessons.length + 1),
      course_id: data.course_id,
      lesson_id: data.lesson_id,
      order: data.order ?? course.lesson_ids.length,
      is_required: data.is_required ?? true,
    }
    mockCourseLessons.push(newCourseLesson)
  },

  removeLesson: async (courseId: string, lessonId: string): Promise<void> => {
    await delay()
    const course = mockCourses.find((c) => c.id === courseId)
    if (!course) throw new Error('Course not found')
    course.lesson_ids = course.lesson_ids.filter((id) => id !== lessonId)
    course.updated_at = new Date().toISOString()
    const index = mockCourseLessons.findIndex((cl) => cl.course_id === courseId && cl.lesson_id === lessonId)
    if (index !== -1) {
      mockCourseLessons.splice(index, 1)
    }
  },

  reorderLessons: async (courseId: string, lessonIds: string[]): Promise<void> => {
    await delay()
    const course = mockCourses.find((c) => c.id === courseId)
    if (!course) throw new Error('Course not found')
    course.lesson_ids = lessonIds
    course.updated_at = new Date().toISOString()
  },

  getLessons: async (courseId: string): Promise<Lesson[]> => {
    await delay()
    const course = mockCourses.find((c) => c.id === courseId)
    if (!course) throw new Error('Course not found')
    return mockLessons.filter((l) => course.lesson_ids.includes(l.id))
  },
}
