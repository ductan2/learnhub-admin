export const STATUS_ACTIVE = "active";
export const STATUS_LOCKED = "locked";
export const STATUS_DISABLED = "disabled";
export const STATUS_DELETED = "deleted";

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
    status: typeof STATUS_ACTIVE | typeof STATUS_LOCKED | typeof STATUS_DISABLED | typeof STATUS_DELETED
    profile: UserProfile
    role: string
    tenant: string
    points?: number
    streak?: number
}

export interface UserPoints {
    user_id: string
    lifetime: number
    weekly: number
    monthly: number
    updated_at: string
}

export interface UserStreak {
    user_id: string
    current_len: number
    longest_len: number
    last_day: string | null
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
