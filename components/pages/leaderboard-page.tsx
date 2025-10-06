"use client"

import { useState, useEffect } from "react"
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import { api } from "@/lib/api/exports"
import type { User } from "@/lib/types"

export function LeaderboardPage() {
  const [period, setPeriod] = useState<"all-time" | "monthly" | "weekly">("all-time")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [period])

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      const data = await api.leaderboard.getByPeriod(period)
      setUsers(data)
    } catch (error) {
      console.error("[v0] Failed to load leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getPeriodLabel = () => {
    switch (period) {
      case "all-time":
        return "All Time"
      case "monthly":
        return "This Month"
      case "weekly":
        return "This Week"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Leaderboard</h2>
            <p className="text-sm text-muted-foreground">Top performers across the platform</p>
          </div>
        </div>

        <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <TabsList>
            <TabsTrigger value="all-time">All Time</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <Card className="p-12 text-center text-muted-foreground">Loading leaderboard...</Card>
      ) : users.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No users found for this period</p>
        </Card>
      ) : (
        <LeaderboardTable users={users} period={getPeriodLabel()} />
      )}
    </div>
  )
}
