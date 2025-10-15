import { delay } from '../utils'
import apiClient from '@/lib/api/client'
import type {
    UserProfile,
    ChangePasswordDto,
    SessionsResponse,
    UpdateProfileResponse,
    ChangePasswordResponse,
    TerminateSessionResponse
} from '@/types/settings'

export const settings = {
    // Update user profile
    updateProfile: async (profileData: UserProfile): Promise<UpdateProfileResponse> => {
        await delay(1000) // Simulate API call

        // Mock validation
        if (!profileData.display_name.trim()) {
            return {
                status: 'error',
                message: 'Display name is required'
            }
        }

        // Mock successful update
        return {
            status: 'success',
            message: 'Profile updated successfully',
            data: profileData
        }
    },

    // Change password
    changePassword: async (passwordData: ChangePasswordDto): Promise<ChangePasswordResponse> => {
        await delay(1500) // Simulate API call

        // Mock validation
        if (passwordData.current_password !== 'currentPassword123') {
            return {
                status: 'error',
                message: 'Current password is incorrect'
            }
        }

        if (passwordData.new_password !== passwordData.confirm_password) {
            return {
                status: 'error',
                message: 'New passwords do not match'
            }
        }

        if (passwordData.new_password.length < 8) {
            return {
                status: 'error',
                message: 'New password must be at least 8 characters long'
            }
        }

        // Mock successful password change
        return {
            status: 'success',
            message: 'Password changed successfully'
        }
    },

    // Get user sessions (integrated with backend)
    getSessions: async (): Promise<SessionsResponse> => {
        type BackendSession = {
            id: string
            created_at: string
            expires_at?: string
            ip_addr: string
            is_current: boolean
            user_agent: string
        }

        // Helper to extract basic device info from user agent
        const extractDevice = (ua: string): { device: string; browser: string } => {
            const lower = ua.toLowerCase()
            let device = 'Unknown device'
            if (lower.includes('iphone')) device = 'iPhone'
            else if (lower.includes('ipad')) device = 'iPad'
            else if (lower.includes('android')) device = 'Android'
            else if (lower.includes('macintosh') || lower.includes('mac os')) device = 'Mac'
            else if (lower.includes('windows')) device = 'Windows PC'
            else if (lower.includes('linux')) device = 'Linux'

            let browser = 'Unknown browser'
            if (lower.includes('chrome') && !lower.includes('edge') && !lower.includes('edg/')) browser = 'Chrome'
            else if (lower.includes('safari') && !lower.includes('chrome')) browser = 'Safari'
            else if (lower.includes('firefox')) browser = 'Firefox'
            else if (lower.includes('edg/')) browser = 'Edge'

            return { device, browser }
        }

        const { data } = await apiClient.get<BackendSession[]>('/api/v1/sessions')

        const sessions = (data || []).map((s) => {
            const { device, browser } = extractDevice(s.user_agent || '')
            return {
                id: s.id,
                device,
                browser,
                ip_address: s.ip_addr,
                location: 'Unknown',
                created_at: s.created_at,
                last_active: s.created_at,
                is_current: s.is_current,
                user_agent: s.user_agent,
            }
        })

        // Derive last login info from the newest session
        const newest = sessions
            .slice()
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

        return {
            sessions,
            last_login: newest
                ? {
                    date: newest.created_at,
                    ip_address: newest.ip_address,
                    device: newest.device,
                    location: newest.location,
                }
                : {
                    date: new Date().toISOString(),
                    ip_address: '-',
                    device: '-',
                    location: '-',
                },
        }
    },

    // Terminate a specific session
    terminateSession: async (sessionId: string): Promise<TerminateSessionResponse> => {
        if (!sessionId) {
            return { status: 'error', message: 'Session ID is required' }
        }

        try {
            await apiClient.delete(`/api/v1/sessions/${sessionId}`)
            return { status: 'success', message: 'Session terminated successfully' }
        } catch (error) {
            return { status: 'error', message: 'Failed to terminate session' }
        }
    },

    // Terminate all other sessions (except current)
    terminateAllSessions: async (): Promise<TerminateSessionResponse> => {
        try {
            await apiClient.post('/api/v1/sessions/revoke-all')
            return { status: 'success', message: 'All other sessions terminated successfully' }
        } catch (error) {
            return { status: 'error', message: 'Failed to terminate sessions' }
        }
    }
}
