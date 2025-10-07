export interface User {
    id: string
    email: string
    username: string
    full_name: string
    avatar_url?: string
    email_verified: boolean
    role: "user" | "admin" | "moderator" | "instructor"
    status: "active" | "banned" | "suspended" | "locked" | "disabled" | "deleted"
    tenant: string
    created_at: string
    updated_at: string
    last_login?: string
    last_login_at?: string
    last_login_ip?: string
    lockout_until?: string | null
    deleted_at?: string | null
    total_points: number
    current_streak: number
    longest_streak?: number
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
    role: User["role"]
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