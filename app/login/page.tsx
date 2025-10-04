"use client"

import { Suspense } from 'react'
import { LoginPage } from '@/components/login/login-page'
import { Spinner } from '@/components/ui/spinner'

export default function Login() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Spinner className="h-8 w-8" />
            </div>
        }>
            <LoginPage />
        </Suspense>
    )
}

