export interface Lesson {
    id: string
    title: string
    code?: string
    description?: string
    topic_id: string
    level_id: string
    is_published: boolean
    created_at: string
    updated_at: string
    version: number
    published_at?: string | null
    created_by?: string
    enrollment_count?: number
    completion_rate?: number
}

export interface LessonSection {
    id: string
    lesson_id: string
    type: "text" | "video" | "audio" | "image" | "quiz" | "exercise"
    title?: string
    content?: string
    media_id?: string
    quiz_id?: string
    order: number
    body?: Record<string, any>
}

export interface LessonFilters {
    topic_id?: string
    level_id?: string
    is_published?: boolean
    search?: string
    created_by?: string
}

// DTO types
export interface CreateLessonDto {
    title: string
    code?: string
    description?: string
    topic_id: string
    level_id: string
    is_published?: boolean
    created_by?: string
}

export interface UpdateLessonDto extends Partial<CreateLessonDto> { }
