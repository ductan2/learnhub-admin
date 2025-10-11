export interface Course {
    id: string
    title: string
    description?: string | null
    topic_id?: string | null
    level_id?: string | null
    instructor_id?: string | null
    thumbnail_url?: string | null
    is_published: boolean
    is_featured: boolean
    price?: number | null
    duration_hours?: number | null
    average_rating?: number | null
    review_count: number
    created_at: string
    updated_at: string
    published_at?: string | null
    enrollment_count?: number | null
    completion_rate?: number | null
    lesson_ids: string[]
    lessons?: CourseLesson[]
}

export interface CourseLesson {
    id: string
    course_id: string
    lesson_id: string
    ord: number
    is_required: boolean
    created_at: string
    lesson?: {
        id: string
        title: string
        description?: string | null
        topic?: { id: string; name: string }
        level?: { id: string; name: string }
        is_published?: boolean
    }
}

export interface CourseReview {
    id: string
    course_id: string
    user_id: string
    rating: number
    comment?: string | null
    created_at: string
    updated_at: string
}

export interface CourseReviewCollection {
    items: CourseReview[]
    total_count: number
    page: number
    page_size: number
    average_rating?: number | null
    review_count?: number
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
export interface CreateCourseDto {
    title: string
    description?: string
    topic_id?: string
    level_id?: string
    instructor_id?: string
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
    ord?: number
    is_required?: boolean
}
