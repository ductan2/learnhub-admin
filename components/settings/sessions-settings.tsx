"use client"

import { useState, useEffect } from 'react'
import { settings } from '@/lib/api/modules/settings'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Monitor, Smartphone, Tablet, Globe, MapPin, Clock, LogOut, Shield, AlertTriangle } from 'lucide-react'
import type { SessionsResponse, UserSession } from '@/types/settings'

function getDeviceIcon(device: string): React.ReactNode {
    const deviceLower = device.toLowerCase()
    if (deviceLower.includes('iphone') || deviceLower.includes('android')) {
        return <Smartphone className="h-4 w-4" />
    } else if (deviceLower.includes('ipad') || deviceLower.includes('tablet')) {
        return <Tablet className="h-4 w-4" />
    }
    return <Monitor className="h-4 w-4" />
}

function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
        return 'Just now'
    } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    } else {
        const diffInDays = Math.floor(diffInHours / 24)
        if (diffInDays < 7) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
        } else {
            return date.toLocaleDateString()
        }
    }
}

function formatDateTime(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleString()
}

export function SessionsSettings() {
    const [sessionsData, setSessionsData] = useState<SessionsResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [terminatingSession, setTerminatingSession] = useState<string | null>(null)
    const [terminatingAll, setTerminatingAll] = useState(false)

    const fetchSessions = async () => {
        try {
            setIsLoading(true)
            const data = await settings.getSessions()
            setSessionsData(data)
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load sessions',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchSessions()
    }, [])

    const handleTerminateSession = async (sessionId: string) => {
        setTerminatingSession(sessionId)
        try {
            const response = await settings.terminateSession(sessionId)

            if (response.status === 'success') {
                toast({
                    title: 'Session terminated',
                    description: 'The session has been terminated successfully.',
                })
                // Refresh sessions list
                await fetchSessions()
            } else {
                toast({
                    title: 'Error',
                    description: response.message || 'Failed to terminate session',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'An unexpected error occurred',
                variant: 'destructive',
            })
        } finally {
            setTerminatingSession(null)
        }
    }

    const handleTerminateAllSessions = async () => {
        setTerminatingAll(true)
        try {
            const response = await settings.terminateAllSessions()

            if (response.status === 'success') {
                toast({
                    title: 'Sessions terminated',
                    description: 'All other sessions have been terminated successfully.',
                })
                // Refresh sessions list
                await fetchSessions()
            } else {
                toast({
                    title: 'Error',
                    description: response.message || 'Failed to terminate sessions',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'An unexpected error occurred',
                variant: 'destructive',
            })
        } finally {
            setTerminatingAll(false)
        }
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Sessions & Security
                    </CardTitle>
                    <CardDescription>
                        Manage your active sessions and view login history
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!sessionsData) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center text-muted-foreground">
                        Failed to load sessions data
                    </div>
                </CardContent>
            </Card>
        )
    }

    const { sessions, last_login } = sessionsData
    const otherSessions = sessions.filter(session => !session.is_current)

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Sessions & Security
                </CardTitle>
                <CardDescription>
                    Manage your active sessions and view login history
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Last Login Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Last Login
                    </h3>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Date & Time</span>
                            <span className="text-sm text-muted-foreground">
                                {formatDateTime(last_login.date)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Device</span>
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                {getDeviceIcon(last_login.device)}
                                {last_login.device}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Location</span>
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                <MapPin className="h-3 w-3" />
                                {last_login.location}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">IP Address</span>
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                <Globe className="h-3 w-3" />
                                {last_login.ip_address}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Active Sessions */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            Active Sessions ({sessions.length})
                        </h3>
                        {otherSessions.length > 0 && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm" disabled={terminatingAll}>
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Terminate All Others
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Terminate All Other Sessions</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will log you out of all other devices and browsers. You will remain logged in on this device.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleTerminateAllSessions}
                                            disabled={terminatingAll}
                                        >
                                            {terminatingAll && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Terminate All Others
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>

                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Device</TableHead>
                                    <TableHead>Browser</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Last Active</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sessions.map((session) => (
                                    <TableRow key={session.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getDeviceIcon(session.device)}
                                                <span className="text-sm">{session.device}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{session.browser}</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-sm">{session.location}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-sm">{formatDate(session.last_active)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {session.is_current ? (
                                                <Badge variant="default" className="bg-green-100 text-green-800">
                                                    Current
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">Active</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {!session.is_current && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={terminatingSession === session.id}
                                                        >
                                                            {terminatingSession === session.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <LogOut className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Terminate Session</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to terminate this session? The user will be logged out from this device.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleTerminateSession(session.id)}
                                                                disabled={terminatingSession === session.id}
                                                            >
                                                                {terminatingSession === session.id && (
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                )}
                                                                Terminate Session
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Security Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-amber-800">Security Notice</h4>
                            <p className="text-xs text-amber-700">
                                If you notice any suspicious activity or unrecognized sessions, terminate them immediately and consider changing your password.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
