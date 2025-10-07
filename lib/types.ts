// Core Types for LMS Admin Dashboard

export interface User {
  id: string
  email: string
  username: string
  full_name: string
  avatar_url?: string
  email_verified: boolean
  role: "user" | "admin" | "moderator" | "instructor"
  status: "active" | "banned" | "suspended" | "locked" | "disabled" | "deleted"
  tenant: string
  created_at: string
  updated_at: string
  last_login?: string
  last_login_at?: string
  last_login_ip?: string
  lockout_until?: string | null
  deleted_at?: string | null
  total_points: number
  current_streak: number
  longest_streak?: number
}

export interface Folder {
  id: string
  name: string
  parentId: string | null
  depth?: number
  childrenCount?: number
  mediaCount?: number
  createdAt?: string
  updatedAt?: string
  parent?: {
    id: string
    name: string
  } | null
}

export interface MediaAsset {
  id: string
  storageKey: string
  kind: 'IMAGE' | 'AUDIO'
  mimeType: string
  folderId?: string | null
  originalName: string
  thumbnailURL?: string | null
  bytes: number
  durationMs?: number | null
  sha256?: string
  createdAt: string
  uploadedBy?: string | null
  downloadURL: string
}

export interface MediaAssetFilter {
  folderId?: string
  kind?: 'IMAGE' | 'AUDIO'
  uploadedBy?: string
  sha256?: string
  search?: string
}

export interface MediaAssetOrder {
  field: 'CREATED_AT' | 'BYTES'
  direction: 'ASC' | 'DESC'
}

export interface MediaAssetCollection {
  items: MediaAsset[]
  totalCount: number
  page: number
  pageSize: number
}

export interface Topic {
  id: string
  slug: string
  name: string
  createdAt: string
}

export interface CreateTopicDto {
  slug: string
  name: string
}

export type UpdateTopicDto = Partial<CreateTopicDto>

export interface Tag {
  id: string
  slug: string
  name: string
}

export interface CreateTagDto {
  slug: string
  name: string
}

export type UpdateTagDto = Partial<CreateTagDto>

export interface Level {
  id: string
  code: string
  name: string
}

export interface CreateLevelDto {
  code: string
  name: string
}

export type UpdateLevelDto = Partial<CreateLevelDto>

export interface Lesson {
  id: string
  code?: string
  title: string
  description?: string
  topic_id: string
  level_id: string
  is_published: boolean
  created_at: string
  updated_at: string
  published_at?: string | null
  created_by?: string
  version: number
  enrollment_count?: number
  completion_rate?: number
}

export interface LessonSection {
  id: string
  lesson_id: string
  type: "text" | "video" | "image" | "quiz"
  content?: string
  media_id?: string
  quiz_id?: string
  order: number
}

export interface Quiz {
  id: string
  title: string
  description?: string
  topic_id: string
  level_id: string
  time_limit?: number
  passing_score?: number
  shuffle_questions?: boolean
  shuffle_answers?: boolean
  show_correct_answers?: boolean
  question_count?: number
  average_score?: number
  attempt_count?: number

  lesson_id: string // TODO: remove this after integration api 
  created_at: string
  updated_at: string
}

export interface Question {
  id: string
  quiz_id: string
  type: "multiple_choice" | "true_false" | "fill_blank" | "short_answer" | "audio"
  question_text: string
  points: number
  order: number
  prompt_media_id?: string
}

export interface QuestionOption {
  id: string
  question_id: string
  option_text: string
  is_correct: boolean
  order: number
}

export interface Enrollment {
  id: string
  user_id: string
  lesson_id: string
  enrolled_at: string
  progress_percentage: number
  completed_at: string | null
}

export interface QuizAttempt {
  id: string
  user_id: string
  quiz_id: string
  started_at: string
  completed_at: string | null
  score: number
  max_score: number
}

export interface Course {
  id: string
  title: string
  description?: string
  topic_id: string
  level_id: string
  instructor_id: string
  thumbnail_url?: string
  is_published: boolean
  is_featured: boolean
  price?: number
  duration_hours?: number
  created_at: string
  updated_at: string
  enrollment_count?: number
  completion_rate?: number
  rating?: number
  lesson_ids: string[]
}

export interface CourseLesson {
  id: string
  course_id: string
  lesson_id: string
  order: number
  is_required: boolean
}

export interface LeaderboardSnapshot {
  id: string
  period: "daily" | "weekly" | "monthly"
  start_date: string
  end_date: string
  created_at: string
}

export interface LeaderboardEntry {
  snapshot_id: string
  user_id: string
  rank: number
  points: number
  user?: User
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  type: "multiple_choice" | "true_false" | "short_answer"
  question_text: string
  points: number
  order: number
  explanation?: string
  correct_answer?: string
  answers?: QuizAnswer[]
}

export interface QuizAnswer {
  id: string
  question_id: string
  answer_text: string
  is_correct: boolean
  order: number
}

// Filter types
export interface UserFilters {
  status?: "active" | "banned" | "suspended" | "locked" | "disabled" | "deleted"
  email_verified?: boolean
  search?: string
  date_from?: string
  date_to?: string
}

export interface LessonFilters {
  topic_id?: string
  level_id?: string
  is_published?: boolean
  search?: string
  created_by?: string
}

export interface MediaFilters {
  folderId?: string | null
  kind?: 'IMAGE' | 'AUDIO'
  uploadedBy?: string
  sha256?: string
  search?: string
}

export interface CourseFilters {
  topic_id?: string
  level_id?: string
  instructor_id?: string
  is_published?: boolean
  is_featured?: boolean
  search?: string
  min_price?: number
  max_price?: number
}

// DTO types
export interface CreateFolderDto {
  name: string
  parentId?: string | null
}

export interface CreateLessonDto {
  code?: string
  title: string
  description?: string
  topic_id: string
  level_id: string
  created_by?: string
  is_published?: boolean
}

export interface UpdateLessonDto extends Partial<CreateLessonDto> { }

export interface CreateQuizDto {
  title: string
  description?: string
  topic_id: string
  level_id: string
  time_limit?: number
  passing_score?: number
  shuffle_questions?: boolean
  shuffle_answers?: boolean
  show_correct_answers?: boolean
}

export interface CreateQuestionDto {
  quiz_id: string
  type: Question["type"]
  question_text: string
  points: number
  prompt_media_id?: string
  options?: Array<{
    option_text: string
    is_correct: boolean
  }>
}

export interface UpdateUserRoleDto {
  user_id: string
  role: User["role"]
}

export interface UpdateUserTenantDto {
  user_id: string
  tenant: string
}

export interface LockUserDto {
  user_id: string
  lockout_until: string
}

export interface ResetPasswordDto {
  user_id: string
}

export interface CreateCourseDto {
  title: string
  description?: string
  topic_id: string
  level_id: string
  instructor_id: string
  thumbnail_url?: string
  is_published?: boolean
  is_featured?: boolean
  price?: number
  duration_hours?: number
  lesson_ids?: string[]
}

export interface UpdateCourseDto extends Partial<CreateCourseDto> { }

export interface AddLessonToCourseDto {
  course_id: string
  lesson_id: string
  order?: number
  is_required?: boolean
}

export interface Notification {
  id: string
  user_id: string
  title: string
  body?: string
  type: "system" | "lesson" | "quiz" | "reminder" | "announcement" | "course"
  data?: Record<string, any>
  is_read: boolean
  read_at?: string
  created_at: string
  expires_at?: string
  priority: "low" | "normal" | "high"
}

export interface NotificationFilters {
  user_id?: string
  type?: Notification["type"]
  priority?: Notification["priority"]
  is_read?: boolean
  search?: string
  date_from?: string
  date_to?: string
}

export interface CreateNotificationDto {
  user_id?: string
  user_ids?: string[]
  tenant?: string
  title: string
  body?: string
  type: Notification["type"]
  data?: Record<string, any>
  expires_at?: string
  priority?: Notification["priority"]
}

export interface NotificationStats {
  total: number
  read: number
  unread: number
  by_type: Record<string, number>
  by_priority: Record<string, number>
  read_rate: number
}

export interface Submission {
  id: string
  user_id: string
  assignment_id: string
  assignment_title: string
  type: "speaking" | "writing"
  content?: string
  file_url?: string
  audio_url?: string
  status: "pending" | "graded" | "rejected" | "needs_revision"
  ai_score?: number
  teacher_score?: number
  ai_feedback?: string
  teacher_feedback?: string
  submitted_at: string
  graded_at?: string
  graded_by?: string
  user?: User
}

export interface SubmissionFilters {
  type?: "speaking" | "writing"
  status?: Submission["status"]
  user_id?: string
  assignment_id?: string
  search?: string
  date_from?: string
  date_to?: string
}

export interface GradeSubmissionDto {
  submission_id: string
  teacher_score: number
  teacher_feedback?: string
  status: "graded" | "needs_revision" | "rejected"
}

export interface BulkGradeDto {
  submission_ids: string[]
  teacher_score: number
  teacher_feedback?: string
  status: "graded" | "needs_revision" | "rejected"
}

export interface SubmissionStats {
  total: number
  pending: number
  graded: number
  rejected: number
  needs_revision: number
  by_type: Record<string, number>
  average_ai_score: number
  average_teacher_score: number
}
