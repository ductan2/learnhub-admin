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

// DTO types
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
