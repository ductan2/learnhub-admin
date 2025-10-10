import { z } from 'zod'

// Profile update schema
export const profileUpdateSchema = z.object({
    display_name: z.string().min(1, 'Display name is required').max(50, 'Display name must be less than 50 characters'),
    avatar_url: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
    locale: z.string().min(1, 'Locale is required'),
    time_zone: z.string().min(1, 'Time zone is required'),
})

// Password change schema
export const changePasswordSchema = z.object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
})

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
