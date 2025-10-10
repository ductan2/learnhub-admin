"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import apiClient from '../api/client'
import { LoginRequest, LoginResponse, LogoutResponse } from './types'
import type { User } from '@/types/user'
import { toast } from '@/hooks/use-toast'

interface AuthContextType {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    mfaRequired: boolean
    login: (email: string, password: string, mfaCode?: string) => Promise<void>
    logout: () => Promise<void>
    checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [mfaRequired, setMfaRequired] = useState(false)
    const router = useRouter()

    const isAuthenticated = !!user && !mfaRequired

    // Check if user is authenticated on mount
    const checkAuth = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken')
            const savedUser = localStorage.getItem('user')

            if (token && savedUser) {
                // Parse saved user and check if session is still valid
                try {
                    const userData = JSON.parse(savedUser) as User

                    // Check if user account is active
                    if (userData.status !== 'active') {
                        throw new Error('User account is not active')
                    }

                    setUser(userData)
                } catch (error) {
                    // Token is invalid, clear storage
                    localStorage.removeItem('accessToken')
                    localStorage.removeItem('refreshToken')
                    localStorage.removeItem('tokenExpiresAt')
                    localStorage.removeItem('user')
                    setUser(null)
                }
            } else {
                setUser(null)
            }
        } catch (error) {
            console.error('Auth check failed:', error)
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        checkAuth()
    }, [checkAuth])

    const login = async (email: string, password: string, mfaCode?: string) => {
        try {
            const requestData: LoginRequest = {
                email,
                password,
            }

            if (mfaCode) {
                requestData.mfa_code = mfaCode
            }

            const response = await axios.post<LoginResponse>(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/login`,
                requestData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            )

            // Check if login was successful
            if (response.data.status !== 'success' || !response.data.data) {
                throw new Error(response.data.message || 'Login failed')
            }

            const { access_token, refresh_token, expires_at, mfa_required, user: userData } = response.data.data

            // Check if MFA is required
            if (mfa_required) {
                setMfaRequired(true)
                throw new Error('MFA code required')
            }

            // Check user status
            if (userData.status !== 'active') {
                throw new Error(`Account is ${userData.status}. Please contact support.`)
            }

            // Save tokens and user data
            localStorage.setItem('accessToken', access_token)
            localStorage.setItem('refreshToken', refresh_token)
            localStorage.setItem('tokenExpiresAt', expires_at)
            localStorage.setItem('user', JSON.stringify(userData))

            setUser(userData)
            setMfaRequired(false)
            toast({
                title: 'Login successful',
                description: 'You are now logged in',
            })
            // Redirect to dashboard
            router.push('/')
        } catch (error: any) {
            console.error('Login failed:', error)

            // Check if it's an MFA requirement (not an actual error)
            if (error.message === 'MFA code required') {
                throw error
            }

            const errorMessage = error.response?.data?.message || error.message || 'Login failed'
            throw new Error(errorMessage)
        }
    }

    const logout = async () => {
        try {
            // Call logout endpoint to invalidate tokens
            const refreshToken = localStorage.getItem('refreshToken')

            if (refreshToken) {
                await axios.post<LogoutResponse>(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/v1/users/logout`,
                    { refresh_token: refreshToken },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        },
                    }
                )
            }
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            // Clear local storage
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('tokenExpiresAt')
            localStorage.removeItem('user')
            setUser(null)
            setMfaRequired(false)

            // Redirect to login
            router.push('/login')
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated,
                mfaRequired,
                login,
                logout,
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

