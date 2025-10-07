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
