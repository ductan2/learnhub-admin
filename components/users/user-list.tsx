"use client"

import { Users, Search, Shield, ShieldAlert, ShieldCheck, Mail, MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import type { User } from "@/types/user"

interface UserListProps {
  users: User[]
  onViewUser: (user: User) => void
  onUpdateStatus: (userId: string, status: User["status"]) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  verifiedFilter: string
  onVerifiedFilterChange: (filter: string) => void
}

export function UserList({
  users,
  onViewUser,
  onUpdateStatus,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  verifiedFilter,
  onVerifiedFilterChange,
}: UserListProps) {
  const getStatusBadge = (status: User["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case "suspended":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
            <ShieldAlert className="h-3 w-3 mr-1" />
            Suspended
          </Badge>
        )
      case "banned":
        return (
          <Badge variant="destructive">
            <Shield className="h-3 w-3 mr-1" />
            Banned
          </Badge>
        )
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>

          <Select value={verifiedFilter} onValueChange={onVerifiedFilterChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-muted px-4 py-3 grid grid-cols-12 gap-4 text-sm font-medium">
          <div className="col-span-4">User</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Points</div>
          <div className="col-span-2">Joined</div>
          <div className="col-span-1">Streak</div>
          <div className="col-span-1"></div>
        </div>

        <div className="divide-y divide-border">
          {users.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No users found</p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-accent/50 cursor-pointer"
                onClick={() => onViewUser(user)}
              >
                <div className="col-span-4 flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {user.full_name}
                      {user.email_verified ? (
                        <MailCheck className="h-3 w-3 text-green-500" />
                      ) : (
                        <Mail className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="text-xs text-muted-foreground">@{user.username}</div>
                  </div>
                </div>

                <div className="col-span-2">{getStatusBadge(user.status)}</div>

                <div className="col-span-2 text-sm font-medium">{user.total_points.toLocaleString()} pts</div>

                <div className="col-span-2 text-sm text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </div>

                <div className="col-span-1">
                  <Badge variant="outline">{user.current_streak}d</Badge>
                </div>

                <div className="col-span-1 flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onViewUser(user)
                        }}
                      >
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {user.status !== "active" && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onUpdateStatus(user.id, "active")
                          }}
                        >
                          <ShieldCheck className="h-4 w-4 mr-2" />
                          Activate
                        </DropdownMenuItem>
                      )}
                      {user.status !== "suspended" && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onUpdateStatus(user.id, "suspended")
                          }}
                        >
                          <ShieldAlert className="h-4 w-4 mr-2" />
                          Suspend
                        </DropdownMenuItem>
                      )}
                      {user.status !== "banned" && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onUpdateStatus(user.id, "banned")
                          }}
                          className="text-destructive"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Ban User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
