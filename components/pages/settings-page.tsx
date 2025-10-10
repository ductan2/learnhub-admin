"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileSettings } from '@/components/settings/profile-settings'
import { SecuritySettings } from '@/components/settings/security-settings'
import { SessionsSettings } from '@/components/settings/sessions-settings'
import { User, Shield, Monitor } from 'lucide-react'

export function SettingsPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings, security preferences, and active sessions.
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="sessions" className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        Sessions
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                    <ProfileSettings />
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                    <SecuritySettings />
                </TabsContent>

                <TabsContent value="sessions" className="space-y-6">
                    <SessionsSettings />
                </TabsContent>
            </Tabs>
        </div>
    )
}
