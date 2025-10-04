import { useApiQuery, useApiMutation, useApiPutMutation, useApiDeleteMutation, useInvalidateQueries } from './hooks'
import { 
  User, 
  Course, 
  Enrollment,
  PaginatedResponse,
  ApiResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
  CreateUserRequest,
  UpdateUserRequest,
  UsersQueryParams,
  CoursesQueryParams 
} from './types'

// Query Keys - centralized for easy management
export const queryKeys = {
  users: ['users'] as const,
  userDetail: (id: string) => ['users', id] as const,
  courses: ['courses'] as const,
  courseDetail: (id: string) => ['courses', id] as const,
  enrollments: ['enrollments'] as const,
  courseEnrollments: (courseId: string) => ['enrollments', 'course', courseId] as const,
  userEnrollments: (userId: string) => ['enrollments', 'user', userId] as const,
  dashboard: ['dashboard'] as const,
}

// User API Hooks
export function useUsers(params?: UsersQueryParams) {
  const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : ''
  
  return useApiQuery<PaginatedResponse<User>>(
    [...queryKeys.users, params],
    `/users${queryString}`,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )
}

export function useUser(id: string) {
  return useApiQuery<ApiResponse<User>>(
    queryKeys.userDetail(id),
    `/users/${id}`,
    {
      enabled: !!id,
    }
  )
}

export function useCreateUser() {
  const { invalidateByPrefix } = useInvalidateQueries()
  
  return useApiMutation<ApiResponse<User>, CreateUserRequest>('/users', {
    onSuccess: () => {
      invalidateByPrefix('users')
    },
  })
}

export function useUpdateUser(id: string) {
  const { invalidateByKey, invalidateByPrefix } = useInvalidateQueries()
  
  return useApiPutMutation<ApiResponse<User>, UpdateUserRequest>(`/users/${id}`, {
    onSuccess: () => {
      invalidateByKey(queryKeys.userDetail(id))
      invalidateByPrefix('users')
    },
  })
}

export function useDeleteUser() {
  const { invalidateByPrefix } = useInvalidateQueries()
  
  return useApiDeleteMutation<ApiResponse<null>, { id: string }>('/users', {
    onSuccess: () => {
      invalidateByPrefix('users')
    },
  })
}

// Course API Hooks
export function useCourses(params?: CoursesQueryParams) {
  const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : ''
  
  return useApiQuery<PaginatedResponse<Course>>(
    [...queryKeys.courses, params],
    `/courses${queryString}`,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )
}

export function useCourse(id: string) {
  return useApiQuery<ApiResponse<Course>>(
    queryKeys.courseDetail(id),
    `/courses/${id}`,
    {
      enabled: !!id,
    }
  )
}

export function useCreateCourse() {
  const { invalidateByPrefix } = useInvalidateQueries()
  
  return useApiMutation<ApiResponse<Course>, CreateCourseRequest>('/courses', {
    onSuccess: () => {
      invalidateByPrefix('courses')
    },
  })
}

export function useUpdateCourse(id: string) {
  const { invalidateByKey, invalidateByPrefix } = useInvalidateQueries()
  
  return useApiPutMutation<ApiResponse<Course>, UpdateCourseRequest>(`/courses/${id}`, {
    onSuccess: () => {
      invalidateByKey(queryKeys.courseDetail(id))
      invalidateByPrefix('courses')
    },
  })
}

export function useDeleteCourse() {
  const { invalidateByPrefix } = useInvalidateQueries()
  
  return useApiDeleteMutation<ApiResponse<null>, { id: string }>('/courses', {
    onSuccess: () => {
      invalidateByPrefix('courses')
    },
  })
}

// Enrollment API Hooks
export function useCourseEnrollments(courseId: string) {
  return useApiQuery<PaginatedResponse<Enrollment>>(
    queryKeys.courseEnrollments(courseId),
    `/courses/${courseId}/enrollments`,
    {
      enabled: !!courseId,
    }
  )
}

export function useUserEnrollments(userId: string) {
  return useApiQuery<PaginatedResponse<Enrollment>>(
    queryKeys.userEnrollments(userId),
    `/users/${userId}/enrollments`,
    {
      enabled: !!userId,
    }
  )
}

export function useEnrollStudent() {
  const { invalidateByPrefix } = useInvalidateQueries()
  
  return useApiMutation<ApiResponse<Enrollment>, { courseId: string; studentId: string }>(
    '/enrollments',
    {
      onSuccess: () => {
        invalidateByPrefix('enrollments')
        invalidateByPrefix('courses')
      },
    }
  )
}

export function useUnenrollStudent() {
  const { invalidateByPrefix } = useInvalidateQueries()
  
  return useApiDeleteMutation<ApiResponse<null>, { enrollmentId: string }>(
    '/enrollments',
    {
      onSuccess: () => {
        invalidateByPrefix('enrollments')
        invalidateByPrefix('courses')
      },
    }
  )
}

// Dashboard Stats Hook
export function useDashboardStats() {
  return useApiQuery<{
    totalUsers: number
    totalCourses: number
    totalEnrollments: number
    recentActivities: Array<{
      id: string
      type: 'enrollment' | 'course_created' | 'user_registered'
      message: string
      timestamp: string
    }>
  }>(
    queryKeys.dashboard,
    '/dashboard/stats',
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchInterval: 5 * 60 * 1000, // refetch every 5 minutes
    }
  )
}