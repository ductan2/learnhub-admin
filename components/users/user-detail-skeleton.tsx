"use client"

import { ArrowLeft, Trophy, BookOpen, HelpCircle, TrendingUp, Shield, Lock, Unlock, Trash2, RotateCcw, KeyRound, Calendar, Globe, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export function UserDetailSkeleton() {
    return (
        <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" className="gap-2" disabled>
                    <ArrowLeft className="h-4 w-4" />
                    Back to users
                </Button>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">User ID</p>
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>

            {/* User Profile Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-start gap-4">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-5 w-5 rounded" />
                            </div>
                            <Skeleton className="h-4 w-64" />
                            <Skeleton className="h-4 w-32" />
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-16 rounded-full" />
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-6 w-24 rounded-full" />
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Trophy className="h-4 w-4" />
                            <span className="text-sm">Total Points</span>
                        </div>
                        <Skeleton className="h-8 w-16" />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-sm">Current Streak</span>
                        </div>
                        <Skeleton className="h-8 w-20" />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <BookOpen className="h-4 w-4" />
                            <span className="text-sm">Enrollments</span>
                        </div>
                        <Skeleton className="h-8 w-12" />
                        <Skeleton className="h-3 w-24 mt-1" />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <HelpCircle className="h-4 w-4" />
                            <span className="text-sm">Quiz Attempts</span>
                        </div>
                        <Skeleton className="h-8 w-12" />
                        <Skeleton className="h-3 w-20 mt-1" />
                    </CardContent>
                </Card>
            </div>

            {/* Admin Actions Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin Actions
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">User Role</span>
                            </div>
                            <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-3 w-64 mt-2" />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-8 w-28" />
                        <Skeleton className="h-8 w-36" />
                    </div>
                </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i}>
                                <div className="flex items-center gap-2 mb-1">
                                    <Skeleton className="h-3 w-3" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                                <Skeleton className="h-4 w-32" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Tabs Section */}
            <Tabs defaultValue="enrollments" className="mt-4">
                <TabsList>
                    <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
                    <TabsTrigger value="quizzes">Quiz Attempts</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="enrollments" className="space-y-3 mt-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-32" />
                                    </div>
                                    <div className="text-right space-y-1">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-5 w-20 rounded-full" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="quizzes" className="space-y-3 mt-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-3 w-28" />
                                    </div>
                                    <div className="text-right space-y-1">
                                        <Skeleton className="h-6 w-12" />
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-5 w-20 rounded-full" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="activity" className="space-y-3 mt-4">
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                            <Skeleton className="h-12 w-12 mx-auto mb-4 rounded" />
                            <Skeleton className="h-4 w-32 mx-auto" />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
