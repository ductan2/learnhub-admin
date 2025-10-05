import type {
  User,
  Folder,
  MediaAsset,
  Lesson,
  Quiz,
  Question,
  Enrollment,
  QuizAttempt,
  LessonFilters,
  MediaFilters,
  CreateFolderDto,
  CreateLessonDto,
  UpdateLessonDto,
  CreateQuizDto,
  CreateQuestionDto,
  Topic,
  Tag,
  Level,
  Course,
  CourseFilters,
  CreateCourseDto,
  UpdateCourseDto,
  AddLessonToCourseDto,
  Notification,
  NotificationFilters,
  NotificationStats,
  CreateNotificationDto,
  Submission,
  SubmissionFilters,
  SubmissionStats,
  GradeSubmissionDto,
  BulkGradeDto,
} from "./types"
import {
  mockUsers,
  mockFolders,
  mockMediaAssets,
  mockLessons,
  mockQuizzes as initialMockQuizzes,
  mockQuestions,
  mockQuestionOptions,
  mockTopics,
  mockLevels,
  mockTags,
  mockCourses,
  mockCourseLessons,
  mockNotifications,
  mockSubmissions,
} from "./mock-data"

// Simulate network delay
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

const getContentApiBaseUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '')
  if (backendUrl) {
    return `${backendUrl}/api/v1/content`
  }
  return '/api/v1/content'
}

type ContentResource = 'topics' | 'levels' | 'tags'

const buildContentUrl = (resource: ContentResource, search?: string) => {
  const baseUrl = getContentApiBaseUrl().replace(/\/$/, '')
  const url = `${baseUrl}/${resource}`
  if (search) {
    return `${url}?search=${encodeURIComponent(search)}`
  }
  return url
}

const extractResourceArray = <T>(payload: unknown, resource: ContentResource): T => {
  if (Array.isArray(payload)) {
    return payload as T
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    const possibleKeys: Array<string> = [resource, 'data', 'items', 'results', 'content']

    for (const key of possibleKeys) {
      const value = record[key]

      if (Array.isArray(value)) {
        return value as T
      }

      if (value && typeof value === 'object') {
        const nestedRecord = value as Record<string, unknown>

        for (const nestedKey of possibleKeys) {
          const nestedValue = nestedRecord[nestedKey]

          if (Array.isArray(nestedValue)) {
            return nestedValue as T
          }
        }
      }
    }
  }

  return payload as T
}

const fetchContentResource = async <T>(resource: ContentResource, search?: string): Promise<T> => {
  const response = await fetch(buildContentUrl(resource, search), {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${resource}`)
  }

  const payload = await response.json()
  return extractResourceArray<T>(payload, resource)
}

// API Service
export const api = {
  // Users
  users: {
    getAll: async (): Promise<User[]> => {
      const response = await fetch("/api/users")
      if (!response.ok) throw new Error("Failed to fetch users")
      return response.json()
    },

    getById: async (id: string): Promise<User> => {
      await delay()
      const user = mockUsers.find((u) => u.id === id)
      if (!user) throw new Error("User not found")
      return user
    },

    updateStatus: async (userId: string, status: User["status"]): Promise<void> => {
      const response = await fetch(`/api/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error("Failed to update user status")
    },
  },

  // Media
  media: {
    getFolders: async (): Promise<Folder[]> => {
      await delay()
      return mockFolders
    },

    getAssets: async (filters?: MediaFilters): Promise<MediaAsset[]> => {
      await delay()
      let assets = [...mockMediaAssets]

      if (filters?.folder_id !== undefined) {
        assets = assets.filter((a) => a.folder_id === filters.folder_id)
      }
      if (filters?.mime_type) {
        assets = assets.filter((a) => a.mime_type.startsWith(filters.mime_type!))
      }
      if (filters?.search) {
        const search = filters.search.toLowerCase()
        assets = assets.filter((a) => a.filename.toLowerCase().includes(search))
      }

      return assets
    },

    createFolder: async (data: CreateFolderDto): Promise<Folder> => {
      await delay()
      const newFolder: Folder = {
        id: String(mockFolders.length + 1),
        name: data.name,
        parent_id: data.parent_id,
        created_at: new Date().toISOString(),
        created_by: "admin",
        file_count: 0,
        total_size: 0,
      }
      mockFolders.push(newFolder)
      return newFolder
    },

    deleteAsset: async (id: string): Promise<void> => {
      await delay()
      const index = mockMediaAssets.findIndex((a) => a.id === id)
      if (index === -1) throw new Error("Asset not found")
      mockMediaAssets.splice(index, 1)
    },

    deleteFolder: async (id: string): Promise<void> => {
      await delay()
      const index = mockFolders.findIndex((f) => f.id === id)
      if (index === -1) throw new Error("Folder not found")
      mockFolders.splice(index, 1)
    },
  },

  // Topics & Levels
  topics: {
    getAll: async (search?: string): Promise<Topic[]> => {
      try {
        const topics = await fetchContentResource<Topic[]>('topics', search)
        if (Array.isArray(topics) && topics.length > 0) {
          return topics
        }
        return mockTopics
      } catch (error) {
        console.error('Failed to fetch topics from content API:', error)
        return mockTopics
      }
    },
  },

  levels: {
    getAll: async (search?: string): Promise<Level[]> => {
      try {
        const levels = await fetchContentResource<Level[]>('levels', search)
        if (Array.isArray(levels) && levels.length > 0) {
          return levels
        }
        return mockLevels
      } catch (error) {
        console.error('Failed to fetch levels from content API:', error)
        return mockLevels
      }
    },
  },

  tags: {
    getAll: async (search?: string): Promise<Tag[]> => {
      try {
        const tags = await fetchContentResource<Tag[]>('tags', search)
        if (Array.isArray(tags) && tags.length > 0) {
          return tags
        }
        return mockTags
      } catch (error) {
        console.error('Failed to fetch tags from content API:', error)
        return mockTags
      }
    },
  },

  // Lessons
  lessons: {
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
        lessons = lessons.filter(
          (l) => l.title.toLowerCase().includes(search) || l.description?.toLowerCase().includes(search),
        )
      }

      return lessons
    },

    getById: async (id: string): Promise<Lesson> => {
      await delay()
      const lesson = mockLessons.find((l) => l.id === id)
      if (!lesson) throw new Error("Lesson not found")
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
      if (!lesson) throw new Error("Lesson not found")
      Object.assign(lesson, data)
      lesson.updated_at = new Date().toISOString()
      lesson.version += 1
      return lesson
    },

    publish: async (id: string, published: boolean): Promise<Lesson> => {
      await delay()
      const lesson = mockLessons.find((l) => l.id === id)
      if (!lesson) throw new Error("Lesson not found")
      lesson.is_published = published
      lesson.updated_at = new Date().toISOString()
      return lesson
    },

    delete: async (id: string): Promise<void> => {
      await delay()
      const index = mockLessons.findIndex((l) => l.id === id)
      if (index === -1) throw new Error("Lesson not found")
      mockLessons.splice(index, 1)
    },
  },

  // Quizzes
  quizzes: {
    getAll: async (): Promise<Quiz[]> => {
      await delay()
      return initialMockQuizzes
    },

    getById: async (id: string): Promise<Quiz> => {
      await delay()
      const quiz = initialMockQuizzes.find((q) => q.id === id)
      if (!quiz) throw new Error("Quiz not found")
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
      if (!quiz) throw new Error("Quiz not found")
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
  },

  // Questions
  questions: {
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

      // Add options if provided
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
  },

  // Enrollments
  enrollments: {
    getByUserId: async (userId: string): Promise<Enrollment[]> => {
      const response = await fetch(`/api/enrollments?userId=${userId}`)
      if (!response.ok) throw new Error("Failed to fetch enrollments")
      return response.json()
    },
  },

  // Quiz Attempts
  quizAttempts: {
    getByUserId: async (userId: string): Promise<QuizAttempt[]> => {
      const response = await fetch(`/api/quiz-attempts?userId=${userId}`)
      if (!response.ok) throw new Error("Failed to fetch quiz attempts")
      return response.json()
    },
  },

  // Analytics
  analytics: {
    getDashboardStats: async () => {
      const response = await fetch("/api/analytics/dashboard")
      if (!response.ok) throw new Error("Failed to fetch dashboard stats")
      return response.json()
    },
  },

  // Leaderboard
  leaderboard: {
    getByPeriod: async (period: "all-time" | "monthly" | "weekly"): Promise<User[]> => {
      const response = await fetch(`/api/leaderboard?period=${period}`)
      if (!response.ok) throw new Error("Failed to fetch leaderboard")
      return response.json()
    },
  },

  // Courses
  courses: {
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
        courses = courses.filter(
          (c) => c.title.toLowerCase().includes(search) || c.description?.toLowerCase().includes(search),
        )
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
      if (!course) throw new Error("Course not found")
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
      if (!course) throw new Error("Course not found")
      Object.assign(course, data)
      course.updated_at = new Date().toISOString()
      return course
    },

    publish: async (id: string, published: boolean): Promise<Course> => {
      await delay()
      const course = mockCourses.find((c) => c.id === id)
      if (!course) throw new Error("Course not found")
      course.is_published = published
      course.updated_at = new Date().toISOString()
      return course
    },

    delete: async (id: string): Promise<void> => {
      await delay()
      const index = mockCourses.findIndex((c) => c.id === id)
      if (index === -1) throw new Error("Course not found")
      mockCourses.splice(index, 1)
    },

    duplicate: async (id: string): Promise<Course> => {
      await delay()
      const course = mockCourses.find((c) => c.id === id)
      if (!course) throw new Error("Course not found")
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
      if (!course) throw new Error("Course not found")
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
      if (!course) throw new Error("Course not found")
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
      if (!course) throw new Error("Course not found")
      course.lesson_ids = lessonIds
      course.updated_at = new Date().toISOString()
    },

    getLessons: async (courseId: string): Promise<Lesson[]> => {
      await delay()
      const course = mockCourses.find((c) => c.id === courseId)
      if (!course) throw new Error("Course not found")
      return mockLessons.filter((l) => course.lesson_ids.includes(l.id))
    },
  },

  // Notifications
  notifications: {
    getAll: async (filters?: NotificationFilters): Promise<Notification[]> => {
      await delay()
      let notifications = [...mockNotifications]

      if (filters?.user_id) {
        notifications = notifications.filter((n) => n.user_id === filters.user_id)
      }
      if (filters?.type) {
        notifications = notifications.filter((n) => n.type === filters.type)
      }
      if (filters?.priority) {
        notifications = notifications.filter((n) => n.priority === filters.priority)
      }
      if (filters?.is_read !== undefined) {
        notifications = notifications.filter((n) => n.is_read === filters.is_read)
      }
      if (filters?.search) {
        const search = filters.search.toLowerCase()
        notifications = notifications.filter(
          (n) => n.title.toLowerCase().includes(search) || n.body?.toLowerCase().includes(search),
        )
      }
      if (filters?.date_from) {
        notifications = notifications.filter((n) => n.created_at >= filters.date_from!)
      }
      if (filters?.date_to) {
        notifications = notifications.filter((n) => n.created_at <= filters.date_to!)
      }

      return notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    },

    getStats: async (): Promise<NotificationStats> => {
      await delay()
      const total = mockNotifications.length
      const read = mockNotifications.filter((n) => n.is_read).length
      const unread = total - read

      const by_type: Record<string, number> = {}
      const by_priority: Record<string, number> = {}

      mockNotifications.forEach((n) => {
        by_type[n.type] = (by_type[n.type] || 0) + 1
        by_priority[n.priority] = (by_priority[n.priority] || 0) + 1
      })

      return {
        total,
        read,
        unread,
        by_type,
        by_priority,
        read_rate: total > 0 ? (read / total) * 100 : 0,
      }
    },

    create: async (data: CreateNotificationDto): Promise<Notification | Notification[]> => {
      await delay()

      // Broadcast to multiple users
      if (data.user_ids && data.user_ids.length > 0) {
        const notifications: Notification[] = data.user_ids.map((userId) => {
          const notification: Notification = {
            id: String(mockNotifications.length + Math.random()),
            user_id: userId,
            title: data.title,
            body: data.body,
            type: data.type,
            data: data.data || {},
            is_read: false,
            created_at: new Date().toISOString(),
            expires_at: data.expires_at,
            priority: data.priority || "normal",
          }
          mockNotifications.push(notification)
          return notification
        })
        return notifications
      }

      // Broadcast by tenant
      if (data.tenant) {
        const tenantUsers = mockUsers.filter((u) => u.tenant === data.tenant)
        const notifications: Notification[] = tenantUsers.map((user) => {
          const notification: Notification = {
            id: String(mockNotifications.length + Math.random()),
            user_id: user.id,
            title: data.title,
            body: data.body,
            type: data.type,
            data: data.data || {},
            is_read: false,
            created_at: new Date().toISOString(),
            expires_at: data.expires_at,
            priority: data.priority || "normal",
          }
          mockNotifications.push(notification)
          return notification
        })
        return notifications
      }

      // Single user notification
      const notification: Notification = {
        id: String(mockNotifications.length + 1),
        user_id: data.user_id || "",
        title: data.title,
        body: data.body,
        type: data.type,
        data: data.data || {},
        is_read: false,
        created_at: new Date().toISOString(),
        expires_at: data.expires_at,
        priority: data.priority || "normal",
      }
      mockNotifications.push(notification)
      return notification
    },

    markAsRead: async (id: string): Promise<void> => {
      await delay()
      const notification = mockNotifications.find((n) => n.id === id)
      if (notification) {
        notification.is_read = true
        notification.read_at = new Date().toISOString()
      }
    },

    delete: async (id: string): Promise<void> => {
      await delay()
      const index = mockNotifications.findIndex((n) => n.id === id)
      if (index !== -1) {
        mockNotifications.splice(index, 1)
      }
    },

    deleteExpired: async (): Promise<number> => {
      await delay()
      const now = new Date().toISOString()
      const expiredCount = mockNotifications.filter((n) => n.expires_at && n.expires_at < now).length
      mockNotifications.splice(
        0,
        mockNotifications.length,
        ...mockNotifications.filter((n) => !n.expires_at || n.expires_at >= now),
      )
      return expiredCount
    },
  },

  // Submissions
  submissions: {
    getAll: async (filters?: SubmissionFilters): Promise<Submission[]> => {
      await delay()
      let submissions = [...mockSubmissions]

      if (filters?.type) {
        submissions = submissions.filter((s) => s.type === filters.type)
      }
      if (filters?.status) {
        submissions = submissions.filter((s) => s.status === filters.status)
      }
      if (filters?.user_id) {
        submissions = submissions.filter((s) => s.user_id === filters.user_id)
      }
      if (filters?.assignment_id) {
        submissions = submissions.filter((s) => s.assignment_id === filters.assignment_id)
      }
      if (filters?.search) {
        const search = filters.search.toLowerCase()
        submissions = submissions.filter(
          (s) =>
            s.assignment_title.toLowerCase().includes(search) ||
            s.content?.toLowerCase().includes(search) ||
            s.teacher_feedback?.toLowerCase().includes(search),
        )
      }
      if (filters?.date_from) {
        submissions = submissions.filter((s) => s.submitted_at >= filters.date_from!)
      }
      if (filters?.date_to) {
        submissions = submissions.filter((s) => s.submitted_at <= filters.date_to!)
      }

      // Attach user data
      submissions = submissions.map((s) => ({
        ...s,
        user: mockUsers.find((u) => u.id === s.user_id),
      }))

      return submissions.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
    },

    getById: async (id: string): Promise<Submission> => {
      await delay()
      const submission = mockSubmissions.find((s) => s.id === id)
      if (!submission) throw new Error("Submission not found")
      return {
        ...submission,
        user: mockUsers.find((u) => u.id === submission.user_id),
      }
    },

    getStats: async (): Promise<SubmissionStats> => {
      await delay()
      const total = mockSubmissions.length
      const pending = mockSubmissions.filter((s) => s.status === "pending").length
      const graded = mockSubmissions.filter((s) => s.status === "graded").length
      const rejected = mockSubmissions.filter((s) => s.status === "rejected").length
      const needs_revision = mockSubmissions.filter((s) => s.status === "needs_revision").length

      const by_type: Record<string, number> = {}
      mockSubmissions.forEach((s) => {
        by_type[s.type] = (by_type[s.type] || 0) + 1
      })

      const aiScores = mockSubmissions.filter((s) => s.ai_score).map((s) => s.ai_score!)
      const teacherScores = mockSubmissions.filter((s) => s.teacher_score).map((s) => s.teacher_score!)

      const average_ai_score = aiScores.length > 0 ? aiScores.reduce((a, b) => a + b, 0) / aiScores.length : 0
      const average_teacher_score =
        teacherScores.length > 0 ? teacherScores.reduce((a, b) => a + b, 0) / teacherScores.length : 0

      return {
        total,
        pending,
        graded,
        rejected,
        needs_revision,
        by_type,
        average_ai_score,
        average_teacher_score,
      }
    },

    grade: async (data: GradeSubmissionDto): Promise<Submission> => {
      await delay()
      const submission = mockSubmissions.find((s) => s.id === data.submission_id)
      if (!submission) throw new Error("Submission not found")

      submission.teacher_score = data.teacher_score
      submission.teacher_feedback = data.teacher_feedback
      submission.status = data.status
      submission.graded_at = new Date().toISOString()
      submission.graded_by = "2" // Mock teacher ID

      return {
        ...submission,
        user: mockUsers.find((u) => u.id === submission.user_id),
      }
    },

    bulkGrade: async (data: BulkGradeDto): Promise<Submission[]> => {
      await delay()
      const gradedSubmissions: Submission[] = []

      for (const id of data.submission_ids) {
        const submission = mockSubmissions.find((s) => s.id === id)
        if (submission) {
          submission.teacher_score = data.teacher_score
          submission.teacher_feedback = data.teacher_feedback
          submission.status = data.status
          submission.graded_at = new Date().toISOString()
          submission.graded_by = "2" // Mock teacher ID

          gradedSubmissions.push({
            ...submission,
            user: mockUsers.find((u) => u.id === submission.user_id),
          })
        }
      }

      return gradedSubmissions
    },

    delete: async (id: string): Promise<void> => {
      await delay()
      const index = mockSubmissions.findIndex((s) => s.id === id)
      if (index !== -1) {
        mockSubmissions.splice(index, 1)
      }
    },
  },
}
