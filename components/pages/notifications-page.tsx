"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Send, Trash2, Search, CheckCircle2, Circle, AlertTriangle } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { NotificationStatsCards } from "@/components/notifications/notification-stats"
import { BroadcastDialog } from "@/components/notifications/broadcast-dialog"
import type { Notification, NotificationStats, User } from "@/lib/types"
import { cn } from "@/lib/utils"

export function NotificationsPage() {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [broadcastOpen, setBroadcastOpen] = useState(false)
  const [filters, setFilters] = useState({
    type: "all",
    priority: "all",
    is_read: "all",
    search: "",
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [notificationsData, statsData, usersData] = await Promise.all([
        api.notifications.getAll({
          type: filters.type as any,
          priority: filters.priority as any,
          is_read: filters.is_read === "read" ? true : filters.is_read === "unread" ? false : undefined,
          search: filters.search || undefined,
        }),
        api.notifications.getStats(),
        api.users.getAll(),
      ])
      setNotifications(notificationsData)
      setStats(statsData)
      setUsers(usersData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [filters])

  const handleDeleteExpired = async () => {
    try {
      const count = await api.notifications.deleteExpired()
      toast({
        title: "Success",
        description: `Deleted ${count} expired notifications`,
      })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete expired notifications",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.notifications.delete(id)
      toast({
        title: "Success",
        description: "Notification deleted",
      })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500"
      case "normal":
        return "text-blue-500"
      case "low":
        return "text-gray-500"
      default:
        return "text-gray-500"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "system":
        return "bg-purple-500/10 text-purple-500"
      case "lesson":
        return "bg-blue-500/10 text-blue-500"
      case "quiz":
        return "bg-green-500/10 text-green-500"
      case "reminder":
        return "bg-orange-500/10 text-orange-500"
      case "announcement":
        return "bg-pink-500/10 text-pink-500"
      case "course":
        return "bg-cyan-500/10 text-cyan-500"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading notifications...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">Manage and broadcast notifications to users</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDeleteExpired}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clean Expired
          </Button>
          <Button onClick={() => setBroadcastOpen(true)}>
            <Send className="h-4 w-4 mr-2" />
            Broadcast
          </Button>
        </div>
      </div>

      {stats && <NotificationStatsCards stats={stats} />}

      {/* Statistics by Type and Priority */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Notifications by Type</h3>
            <div className="space-y-3">
              {Object.entries(stats.by_type).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(type)}>{type}</Badge>
                  </div>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Notifications by Priority</h3>
            <div className="space-y-3">
              {Object.entries(stats.by_priority).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={cn("h-4 w-4", getPriorityColor(priority))} />
                    <span className="capitalize">{priority}</span>
                  </div>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-9"
            />
          </div>

          <Select value={filters.type} onValueChange={(v) => setFilters({ ...filters, type: v })}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="announcement">Announcement</SelectItem>
              <SelectItem value="lesson">Lesson</SelectItem>
              <SelectItem value="quiz">Quiz</SelectItem>
              <SelectItem value="course">Course</SelectItem>
              <SelectItem value="reminder">Reminder</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.priority} onValueChange={(v) => setFilters({ ...filters, priority: v })}>
            <SelectTrigger>
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.is_read} onValueChange={(v) => setFilters({ ...filters, is_read: v })}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No notifications found</p>
          </Card>
        ) : (
          notifications.map((notification) => {
            const user = users.find((u) => u.id === notification.user_id)
            const isExpired = notification.expires_at && new Date(notification.expires_at) < new Date()

            return (
              <Card key={notification.id} className={cn("p-4", isExpired && "opacity-50")}>
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {notification.is_read ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <h3 className="font-semibold truncate">{notification.title}</h3>
                      <Badge className={getTypeColor(notification.type)}>{notification.type}</Badge>
                      <AlertTriangle className={cn("h-4 w-4 flex-shrink-0", getPriorityColor(notification.priority))} />
                      {isExpired && <Badge variant="outline">Expired</Badge>}
                    </div>

                    {notification.body && <p className="text-sm text-muted-foreground mb-2">{notification.body}</p>}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>To: {user?.full_name || "Unknown User"}</span>
                      <span>•</span>
                      <span>{new Date(notification.created_at).toLocaleString()}</span>
                      {notification.read_at && (
                        <>
                          <span>•</span>
                          <span>Read: {new Date(notification.read_at).toLocaleString()}</span>
                        </>
                      )}
                      {notification.expires_at && (
                        <>
                          <span>•</span>
                          <span>Expires: {new Date(notification.expires_at).toLocaleString()}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <Button variant="ghost" size="icon" onClick={() => handleDelete(notification.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            )
          })
        )}
      </div>

      <BroadcastDialog open={broadcastOpen} onOpenChange={setBroadcastOpen} users={users} onSuccess={loadData} />
    </div>
  )
}
