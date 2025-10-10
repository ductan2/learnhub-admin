import { delay } from '../utils'
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

    // Get user sessions
    getSessions: async (): Promise<SessionsResponse> => {
        await delay(800) // Simulate API call

        // Mock session data
        const mockSessions: SessionsResponse = {
            sessions: [
                {
                    id: 'session-1',
                    device: 'MacBook Pro',
                    browser: 'Chrome 120.0.0.0',
                    ip_address: '192.168.1.100',
                    location: 'San Francisco, CA, US',
                    created_at: '2024-01-15T10:30:00Z',
                    last_active: '2024-01-15T14:45:00Z',
                    is_current: true,
                    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                },
                {
                    id: 'session-2',
                    device: 'iPhone 15 Pro',
                    browser: 'Safari 17.2',
                    ip_address: '192.168.1.101',
                    location: 'San Francisco, CA, US',
                    created_at: '2024-01-14T16:20:00Z',
                    last_active: '2024-01-15T12:30:00Z',
                    is_current: false,
                    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15'
                },
                {
                    id: 'session-3',
                    device: 'Windows PC',
                    browser: 'Firefox 121.0',
                    ip_address: '203.0.113.45',
                    location: 'New York, NY, US',
                    created_at: '2024-01-13T09:15:00Z',
                    last_active: '2024-01-14T18:45:00Z',
                    is_current: false,
                    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
                }
            ],
            last_login: {
                date: '2024-01-15T14:45:00Z',
                ip_address: '192.168.1.100',
                device: 'MacBook Pro',
                location: 'San Francisco, CA, US'
            }
        }

        return mockSessions
    },

    // Terminate a specific session
    terminateSession: async (sessionId: string): Promise<TerminateSessionResponse> => {
        await delay(1000) // Simulate API call

        // Mock validation
        if (!sessionId) {
            return {
                status: 'error',
                message: 'Session ID is required'
            }
        }

        // Mock successful termination
        return {
            status: 'success',
            message: 'Session terminated successfully'
        }
    },

    // Terminate all other sessions (except current)
    terminateAllSessions: async (): Promise<TerminateSessionResponse> => {
        await delay(1200) // Simulate API call

        // Mock successful termination
        return {
            status: 'success',
            message: 'All other sessions terminated successfully'
        }
    }
}
