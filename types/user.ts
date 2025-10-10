export interface UserProfile {
    display_name: string
    avatar_url?: string
    locale: string
    time_zone: string
    updated_at: string
}

export interface User {
    id: string
    email: string
    email_verified: boolean
    created_at: string
    updated_at: string
    deleted_at?: string
    last_login_at?: string
    last_login_ip?: string
    lockout_until?: string
    status: "active" | "banned" | "suspended" | "locked" | "disabled" | "deleted"
    profile: UserProfile
    points?: number
    streak?: number
}

export interface UserRole {
    id: string
    name: string
}

// User-related filter types
export interface UserFilters {
    status?: "active" | "banned" | "suspended" | "locked" | "disabled" | "deleted"
    email_verified?: boolean
    search?: string
    date_from?: string
    date_to?: string
}

// User-related DTO types
export interface UpdateUserRoleDto {
    user_id: string
    role: User["status"]
}

export interface UpdateUserTenantDto {
    user_id: string
    tenant: string
}

export interface LockUserDto {
    user_id: string
    lockout_until: string
}

export interface ResetPasswordDto {
    user_id: string
}
