"use client"

import { Card } from "@/components/ui/card"
import { FileText, CheckCircle, XCircle, Clock, MessageSquare } from "lucide-react"
import type { SubmissionStats } from "@/types/submission"

interface SubmissionStatsProps {
  stats: SubmissionStats
}

export function SubmissionStatsCards({ stats }: SubmissionStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 rounded-lg">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
            <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Graded</p>
            <p className="text-2xl font-bold text-foreground">{stats.graded}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 rounded-lg">
            <MessageSquare className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Needs Revision</p>
            <p className="text-2xl font-bold text-foreground">{stats.needs_revision}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-lg">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Rejected</p>
            <p className="text-2xl font-bold text-foreground">{stats.rejected}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export function SubmissionStatsDetails({ stats }: SubmissionStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Submissions by Type</h3>
        <div className="space-y-3">
          {Object.entries(stats.by_type).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground capitalize">{type}</span>
              <span className="text-sm font-semibold text-foreground">{count}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Average Scores</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">AI Score</span>
            <span className="text-sm font-semibold text-foreground">{stats.average_ai_score.toFixed(1)}/100</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Teacher Score</span>
            <span className="text-sm font-semibold text-foreground">
              {stats.average_teacher_score > 0 ? `${stats.average_teacher_score.toFixed(1)}/100` : "N/A"}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
