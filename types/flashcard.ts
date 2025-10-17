export interface Flashcard {
  id: string
  setId: string
  frontText: string
  backText: string
  frontMediaId?: string
  backMediaId?: string
  ord: number
  hints?: string[]
  createdAt: string
}

export interface FlashcardSet {
  id: string
  title: string
  description?: string
  topicId?: string
  topic?: import('./common').Topic
  levelId?: string
  level?: import('./common').Level
  createdAt: string
  createdBy?: string
  tags: import('./common').Tag[]
  cards?: Flashcard[]
  cardCount: number
}

export interface CreateFlashcardSetDto {
  title: string
  description?: string | null
  topicId?: string | null
  levelId?: string | null
}

export interface UpdateFlashcardSetDto {
  title?: string
  description?: string | null
  topicId?: string | null
  levelId?: string | null
}

export interface AddFlashcardDto {
  setId: string
  frontText: string
  backText: string
  frontMediaId?: string | null
  backMediaId?: string | null
  hints?: string[]
}

export interface UpdateFlashcardDto {
  setId?: string
  frontText?: string
  backText?: string
  frontMediaId?: string | null
  backMediaId?: string | null
  hints?: string[] | null
  ord?: number
}
