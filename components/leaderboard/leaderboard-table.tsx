"use client"

import { Trophy, Medal, Award, TrendingUp, Flame } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { User } from "@/lib/types"

interface LeaderboardTableProps {
  users: User[]
  period: string
}

export function LeaderboardTable({ users, period }: LeaderboardTableProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">1st Place</Badge>
    }
    if (rank === 2) {
      return <Badge className="bg-gray-400/10 text-gray-400 hover:bg-gray-400/20">2nd Place</Badge>
    }
    if (rank === 3) {
      return <Badge className="bg-amber-600/10 text-amber-600 hover:bg-amber-600/20">3rd Place</Badge>
    }
    return null
  }

  return (
    <div className="space-y-4">
      {/* Top 3 Podium */}
      {users.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* 2nd Place */}
          <Card className="p-6 text-center border-2 border-gray-400/20">
            <div className="flex justify-center mb-3">
              <Medal className="h-12 w-12 text-gray-400" />
            </div>
            <Avatar className="h-20 w-20 mx-auto mb-3">
              <AvatarImage src={users[1].avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="text-xl">{getInitials(users[1].full_name)}</AvatarFallback>
            </Avatar>
            <h3 className="font-bold text-lg mb-1">{users[1].full_name}</h3>
            <p className="text-sm text-muted-foreground mb-2">@{users[1].username}</p>
            <div className="text-2xl font-bold text-gray-400">{users[1].total_points.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">points</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">{users[1].current_streak} day streak</span>
            </div>
          </Card>

          {/* 1st Place */}
          <Card className="p-6 text-center border-2 border-yellow-500/50 bg-yellow-500/5 relative -mt-4">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">Champion</Badge>
            </div>
            <div className="flex justify-center mb-3 mt-2">
              <Trophy className="h-16 w-16 text-yellow-500" />
            </div>
            <Avatar className="h-24 w-24 mx-auto mb-3 ring-4 ring-yellow-500/20">
              <AvatarImage src={users[0].avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl">{getInitials(users[0].full_name)}</AvatarFallback>
            </Avatar>
            <h3 className="font-bold text-xl mb-1">{users[0].full_name}</h3>
            <p className="text-sm text-muted-foreground mb-2">@{users[0].username}</p>
            <div className="text-3xl font-bold text-yellow-500">{users[0].total_points.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">points</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">{users[0].current_streak} day streak</span>
            </div>
          </Card>

          {/* 3rd Place */}
          <Card className="p-6 text-center border-2 border-amber-600/20">
            <div className="flex justify-center mb-3">
              <Award className="h-12 w-12 text-amber-600" />
            </div>
            <Avatar className="h-20 w-20 mx-auto mb-3">
              <AvatarImage src={users[2].avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="text-xl">{getInitials(users[2].full_name)}</AvatarFallback>
            </Avatar>
            <h3 className="font-bold text-lg mb-1">{users[2].full_name}</h3>
            <p className="text-sm text-muted-foreground mb-2">@{users[2].username}</p>
            <div className="text-2xl font-bold text-amber-600">{users[2].total_points.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">points</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">{users[2].current_streak} day streak</span>
            </div>
          </Card>
        </div>
      )}

      {/* Full Rankings Table */}
      <Card>
        <div className="border-b border-border px-6 py-4">
          <h3 className="font-semibold">Full Rankings - {period}</h3>
        </div>

        <div className="divide-y divide-border">
          {users.map((user, index) => {
            const rank = index + 1
            return (
              <div key={user.id} className="px-6 py-4 flex items-center gap-4 hover:bg-accent/50">
                <div className="w-12 flex justify-center">{getRankIcon(rank)}</div>

                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{user.full_name}</h4>
                    {getRankBadge(rank)}
                  </div>
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold">{user.total_points.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>

                <div className="flex items-center gap-2 min-w-[120px]">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <div>
                    <div className="text-sm font-medium">{user.current_streak} days</div>
                    <p className="text-xs text-muted-foreground">streak</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 min-w-[100px]">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-sm font-medium">{user.longest_streak}</div>
                    <p className="text-xs text-muted-foreground">best</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
