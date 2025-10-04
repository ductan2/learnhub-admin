"use client"

import { Card } from "@/components/ui/card"
import { Bell, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react"
import type { NotificationStats } from "@/lib/types"

interface NotificationStatsProps {
  stats: NotificationStats
}

export function NotificationStatsCards({ stats }: NotificationStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Notifications</p>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Bell className="h-6 w-6 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Read</p>
            <p className="text-2xl font-bold mt-1">{stats.read}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Unread</p>
            <p className="text-2xl font-bold mt-1">{stats.unread}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-orange-500" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Read Rate</p>
            <p className="text-2xl font-bold mt-1">{stats.read_rate.toFixed(1)}%</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-blue-500" />
          </div>
        </div>
      </Card>
    </div>
  )
}
