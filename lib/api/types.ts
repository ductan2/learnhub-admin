// Common types for LMS API responses

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'teacher' | 'student'
  avatar?: string
  createdAt: string
  updatedAt: string
  isActive: boolean
}

export interface Course {
  id: string
  title: string
  description: string
  instructorId: string
  instructor: User
  price: number
  duration: number // in hours
  level: 'beginner' | 'intermediate' | 'advanced'
  thumbnail?: string
  isPublished: boolean
  enrollmentCount: number
  createdAt: string
  updatedAt: string
}

export interface Lesson {
  id: string
  courseId: string
  title: string
  content: string
  videoUrl?: string
  duration: number // in minutes
  order: number
  isPreview: boolean
  createdAt: string
  updatedAt: string
}

export interface Enrollment {
  id: string
  studentId: string
  courseId: string
  student: User
  course: Course
  progress: number // 0-100
  enrolledAt: string
  completedAt?: string
  isActive: boolean
}

// API response wrappers
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

// Request types
export interface CreateCourseRequest {
  title: string
  description: string
  price: number
  duration: number
  level: 'beginner' | 'intermediate' | 'advanced'
  thumbnail?: string
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
  isPublished?: boolean
}

export interface CreateUserRequest {
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'teacher' | 'student'
  password: string
}

export interface UpdateUserRequest extends Partial<Omit<CreateUserRequest, 'password'>> {
  isActive?: boolean
}

// Query parameters
export interface UsersQueryParams {
  page?: number
  limit?: number
  role?: string
  search?: string
  isActive?: boolean
}

export interface CoursesQueryParams {
  page?: number
  limit?: number
  instructorId?: string
  level?: string
  isPublished?: boolean
  search?: string
}