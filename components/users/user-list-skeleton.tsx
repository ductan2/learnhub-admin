"use client"

import { Users, Search, Shield } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

export function UserListSkeleton() {
    return (
        <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Skeleton className="h-10 w-full pl-9" />
                    </div>

                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-10 w-40" />
                </div>
            </div>

            {/* Table */}
            <div className="border border-border rounded-lg overflow-hidden">
                {/* Header */}
                <div className="bg-muted px-4 py-3 grid grid-cols-12 gap-4 text-sm font-medium">
                    <div className="col-span-4">User</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Points</div>
                    <div className="col-span-2">Joined</div>
                    <div className="col-span-1">Streak</div>
                    <div className="col-span-1"></div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-border">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="px-4 py-3 grid grid-cols-12 gap-4 items-center">
                            {/* User Column */}
                            <div className="col-span-4 flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-48" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>

                            {/* Status Column */}
                            <div className="col-span-2">
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>

                            {/* Points Column */}
                            <div className="col-span-2">
                                <Skeleton className="h-4 w-20" />
                            </div>

                            {/* Joined Column */}
                            <div className="col-span-2">
                                <Skeleton className="h-4 w-24" />
                            </div>

                            {/* Streak Column */}
                            <div className="col-span-1">
                                <Skeleton className="h-6 w-8 rounded-full" />
                            </div>

                            {/* Actions Column */}
                            <div className="col-span-1 flex justify-end">
                                <Skeleton className="h-8 w-8 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
