import type { User } from './user'

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
