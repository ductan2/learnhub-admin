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
    user?: import('./user').User
}
