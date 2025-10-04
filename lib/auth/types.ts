// Authentication API Types

export interface LoginRequest {
    email: string
    password: string
    mfa_code?: string
}

export interface LoginResponse {
    status: 'success' | 'error'
    message?: string
    data?: {
        access_token: string
        refresh_token: string
        expires_at: string
        mfa_required: boolean
        user: {
            id: string
            email: string
            email_verified: boolean
            status: 'active' | 'locked' | 'disabled' | 'deleted'
            profile: {
                display_name: string
                avatar_url?: string
                locale: string
                time_zone: string
                updated_at: string
            }
            created_at: string
            updated_at: string
        }
    }
}

export interface RefreshTokenResponse {
    status: 'success' | 'error'
    message?: string
    data?: {
        access_token: string
        expires_at: string
    }
}

export interface User {
    id: string
    email: string
    email_verified: boolean
    status: 'active' | 'locked' | 'disabled' | 'deleted'
    profile: {
        display_name: string
        avatar_url?: string
        locale: string
        time_zone: string
        updated_at: string
    }
    created_at: string
    updated_at: string
}

export interface LogoutResponse {
    status: 'success' | 'error'
    message?: string
}

