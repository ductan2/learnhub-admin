export interface Lesson {
    id: string
    title: string
    description?: string
    topic_id: string
    level_id: string
    is_published: boolean
    created_at: string
    updated_at: string
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

export interface LessonFilters {
    topic_id?: string
    level_id?: string
    is_published?: boolean
    search?: string
}

// DTO types
export interface CreateLessonDto {
    title: string
    description?: string
    topic_id: string
    level_id: string
    is_published?: boolean
}

export interface UpdateLessonDto extends Partial<CreateLessonDto> { }
