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
