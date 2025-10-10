// Settings-related types

export interface UserProfile {
    display_name: string
    avatar_url?: string
    locale: string
    time_zone: string
}

export interface ChangePasswordDto {
    current_password: string
    new_password: string
    confirm_password: string
}

export interface UserSession {
    id: string
    device: string
    browser: string
    ip_address: string
    location: string
    created_at: string
    last_active: string
    is_current: boolean
    user_agent: string
}

export interface SessionsResponse {
    sessions: UserSession[]
    last_login: {
        date: string
        ip_address: string
        device: string
        location: string
    }
}

export interface UpdateProfileResponse {
    status: 'success' | 'error'
    message?: string
    data?: UserProfile
}

export interface ChangePasswordResponse {
    status: 'success' | 'error'
    message?: string
}

export interface TerminateSessionResponse {
    status: 'success' | 'error'
    message?: string
}
