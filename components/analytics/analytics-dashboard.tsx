"use client"

import { Card } from "@/components/ui/card"
import { Users, BookOpen, TrendingUp, Award } from "lucide-react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const userActivityData = [
  { date: "Mon", users: 45 },
  { date: "Tue", users: 52 },
  { date: "Wed", users: 48 },
  { date: "Thu", users: 61 },
  { date: "Fri", users: 55 },
  { date: "Sat", users: 38 },
  { date: "Sun", users: 42 },
]

const enrollmentData = [
  { month: "Jan", enrollments: 120 },
  { month: "Feb", enrollments: 145 },
  { month: "Mar", enrollments: 168 },
  { month: "Apr", enrollments: 192 },
  { month: "May", enrollments: 215 },
  { month: "Jun", enrollments: 238 },
]

const topicDistribution = [
  { name: "Mathematics", value: 35, color: "#3b82f6" },
  { name: "Programming", value: 28, color: "#8b5cf6" },
  { name: "Science", value: 22, color: "#10b981" },
  { name: "Languages", value: 15, color: "#f59e0b" },
]

const quizPerformanceData = [
  { level: "Beginner", avgScore: 85 },
  { level: "Intermediate", avgScore: 72 },
  { level: "Advanced", avgScore: 68 },
  { level: "Expert", avgScore: 61 },
]

interface AnalyticsDashboardProps {
  stats: {
    totalUsers: number
    activeUsersToday: number
    totalLessons: number
    publishedLessons: number
    totalEnrollments: number
    avgCompletionRate: number
    totalMediaStorage: number
    avgQuizScore: number
  }
}

export function AnalyticsDashboard({ stats }: AnalyticsDashboardProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Users</p>
              <p className="text-3xl font-bold mt-2 text-foreground">{stats.totalUsers}</p>
              <p className="text-xs text-primary mt-2 font-medium">+{stats.activeUsersToday} active today</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg hover:shadow-chart-2/5 transition-all duration-200 border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Lessons</p>
              <p className="text-3xl font-bold mt-2 text-foreground">{stats.totalLessons}</p>
              <p className="text-xs text-muted-foreground mt-2">{stats.publishedLessons} published</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-chart-2/10 flex items-center justify-center ring-1 ring-chart-2/20">
              <BookOpen className="h-6 w-6 text-chart-2" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg hover:shadow-chart-3/5 transition-all duration-200 border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Enrollments</p>
              <p className="text-3xl font-bold mt-2 text-foreground">{stats.totalEnrollments}</p>
              <p className="text-xs text-muted-foreground mt-2">{stats.avgCompletionRate}% completion</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-chart-3/10 flex items-center justify-center ring-1 ring-chart-3/20">
              <TrendingUp className="h-6 w-6 text-chart-3" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg hover:shadow-chart-4/5 transition-all duration-200 border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Avg Quiz Score</p>
              <p className="text-3xl font-bold mt-2 text-foreground">{stats.avgQuizScore}%</p>
              <p className="text-xs text-muted-foreground mt-2">{formatBytes(stats.totalMediaStorage)} storage</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-chart-4/10 flex items-center justify-center ring-1 ring-chart-4/20">
              <Award className="h-6 w-6 text-chart-4" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* User Activity */}
        <Card className="p-6 border-border/50">
          <h3 className="font-semibold text-foreground mb-4">Daily Active Users</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={userActivityData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.3} />
              <XAxis
                dataKey="date"
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar dataKey="users" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Enrollment Trend */}
        <Card className="p-6 border-border/50">
          <h3 className="font-semibold text-foreground mb-4">Enrollment Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={enrollmentData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.3} />
              <XAxis
                dataKey="month"
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Line
                type="monotone"
                dataKey="enrollments"
                stroke="hsl(var(--chart-2))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--chart-2))", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Topic Distribution */}
        <Card className="p-6 border-border/50">
          <h3 className="font-semibold text-foreground mb-4">Topic Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={topicDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {topicDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Quiz Performance */}
        <Card className="p-6 border-border/50">
          <h3 className="font-semibold text-foreground mb-4">Quiz Performance by Level</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={quizPerformanceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.3} />
              <XAxis
                type="number"
                domain={[0, 100]}
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                dataKey="level"
                type="category"
                className="text-xs"
                width={100}
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar dataKey="avgScore" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}
