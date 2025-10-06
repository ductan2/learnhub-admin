"use client"

import { useState, useEffect } from "react"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"
import { api } from "@/lib/api/exports"

export function DashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsersToday: 0,
    totalLessons: 0,
    publishedLessons: 0,
    totalEnrollments: 0,
    avgCompletionRate: 0,
    totalMediaStorage: 0,
    avgQuizScore: 0,
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await api.analytics.getDashboardStats()
      setStats(data)
    } catch (error) {
      console.error("[v0] Failed to load dashboard stats:", error)
    }
  }

  return (
    <div className="p-6">
      <AnalyticsDashboard stats={stats} />
    </div>
  )
}
