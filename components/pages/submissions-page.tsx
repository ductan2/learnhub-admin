"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, FileText, Mic, CheckCircle2, XCircle, Clock, MessageSquare } from "lucide-react"
import { api } from "@/lib/api/exports"
import type { Submission, SubmissionStats } from "@/lib/types"
import { SubmissionStatsCards, SubmissionStatsDetails } from "@/components/submissions/submission-stats"
import { GradeDialog } from "@/components/submissions/grade-dialog"
import { BulkGradeDialog } from "@/components/submissions/bulk-grade-dialog"

export function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [stats, setStats] = useState<SubmissionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "speaking" | "writing">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "graded" | "needs_revision" | "rejected">("all")
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<string>>(new Set())
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false)
  const [bulkGradeDialogOpen, setBulkGradeDialogOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)

  useEffect(() => {
    loadData()
  }, [typeFilter, statusFilter, searchQuery])

  const loadData = async () => {
    setLoading(true)
    try {
      const [submissionsData, statsData] = await Promise.all([
        api.submissions.getAll({
          type: typeFilter !== "all" ? typeFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: searchQuery || undefined,
        }),
        api.submissions.getStats(),
      ])
      setSubmissions(submissionsData)
      setStats(statsData)
    } catch (error) {
      console.error("Failed to load submissions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGrade = async (
    submissionId: string,
    score: number,
    feedback: string,
    status: "graded" | "needs_revision",
  ) => {
    try {
      await api.submissions.grade({
        submission_id: submissionId,
        teacher_score: score,
        teacher_feedback: feedback,
        status,
      })
      await loadData()
      setSelectedSubmissions(new Set())
    } catch (error) {
      console.error("Failed to grade submission:", error)
    }
  }

  const handleBulkGrade = async (score: number, feedback: string, status: "graded" | "needs_revision") => {
    try {
      await api.submissions.bulkGrade({
        submission_ids: Array.from(selectedSubmissions),
        teacher_score: score,
        teacher_feedback: feedback,
        status,
      })
      await loadData()
      setSelectedSubmissions(new Set())
    } catch (error) {
      console.error("Failed to bulk grade submissions:", error)
    }
  }

  const toggleSubmissionSelection = (id: string) => {
    const newSelection = new Set(selectedSubmissions)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedSubmissions(newSelection)
  }

  const toggleSelectAll = () => {
    if (selectedSubmissions.size === submissions.length) {
      setSelectedSubmissions(new Set())
    } else {
      setSelectedSubmissions(new Set(submissions.map((s) => s.id)))
    }
  }

  const getStatusBadge = (status: Submission["status"]) => {
    const variants = {
      pending: { variant: "secondary" as const, icon: Clock, color: "text-yellow-600" },
      graded: { variant: "default" as const, icon: CheckCircle2, color: "text-green-600" },
      needs_revision: { variant: "outline" as const, icon: MessageSquare, color: "text-orange-600" },
      rejected: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" },
    }
    const config = variants[status]
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status.replace("_", " ")}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading submissions...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Submissions Review</h2>
        <p className="text-muted-foreground mt-2">Review and grade student speaking and writing submissions</p>
      </div>

      {stats && (
        <>
          <SubmissionStatsCards stats={stats} />
          <SubmissionStatsDetails stats={stats} />
        </>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search submissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="speaking">Speaking</SelectItem>
            <SelectItem value="writing">Writing</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="graded">Graded</SelectItem>
            <SelectItem value="needs_revision">Needs Revision</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedSubmissions.size > 0 && (
        <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-lg">
          <span className="text-sm font-medium text-foreground">{selectedSubmissions.size} submission(s) selected</span>
          <Button size="sm" onClick={() => setBulkGradeDialogOpen(true)}>
            Bulk Grade
          </Button>
          <Button size="sm" variant="outline" onClick={() => setSelectedSubmissions(new Set())}>
            Clear Selection
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {submissions.length > 0 && (
          <div className="flex items-center gap-2 px-4">
            <Checkbox
              checked={selectedSubmissions.size === submissions.length && submissions.length > 0}
              onCheckedChange={toggleSelectAll}
            />
            <span className="text-sm text-muted-foreground">Select All</span>
          </div>
        )}

        {submissions.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No submissions found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || typeFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Submissions will appear here when students submit their work"}
            </p>
          </Card>
        ) : (
          submissions.map((submission) => (
            <Card key={submission.id} className="p-6">
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={selectedSubmissions.has(submission.id)}
                  onCheckedChange={() => toggleSubmissionSelection(submission.id)}
                />

                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {submission.type === "speaking" ? (
                          <Mic className="h-5 w-5 text-blue-600" />
                        ) : (
                          <FileText className="h-5 w-5 text-purple-600" />
                        )}
                        <h3 className="text-lg font-semibold text-foreground">{submission.assignment_title}</h3>
                        {getStatusBadge(submission.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Student: {submission.user?.full_name || "Unknown"}</span>
                        <span>•</span>
                        <span>Submitted: {new Date(submission.submitted_at).toLocaleDateString()}</span>
                        {submission.graded_at && (
                          <>
                            <span>•</span>
                            <span>Graded: {new Date(submission.graded_at).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {submission.type === "writing" && submission.content && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-foreground line-clamp-3">{submission.content}</p>
                    </div>
                  )}

                  {submission.type === "speaking" && submission.audio_url && (
                    <audio controls className="w-full">
                      <source src={submission.audio_url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    {submission.ai_score && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-foreground">AI Score</span>
                          <span className="text-lg font-bold text-blue-600">{submission.ai_score}/100</span>
                        </div>
                        {submission.ai_feedback && (
                          <p className="text-sm text-muted-foreground">{submission.ai_feedback}</p>
                        )}
                      </div>
                    )}

                    {submission.teacher_score && (
                      <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-foreground">Teacher Score</span>
                          <span className="text-lg font-bold text-green-600">{submission.teacher_score}/100</span>
                        </div>
                        {submission.teacher_feedback && (
                          <p className="text-sm text-muted-foreground">{submission.teacher_feedback}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedSubmission(submission)
                        setGradeDialogOpen(true)
                      }}
                    >
                      {submission.status === "graded" ? "Edit Grade" : "Grade Submission"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <GradeDialog
        submission={selectedSubmission}
        open={gradeDialogOpen}
        onOpenChange={setGradeDialogOpen}
        onGrade={handleGrade}
      />

      <BulkGradeDialog
        selectedCount={selectedSubmissions.size}
        open={bulkGradeDialogOpen}
        onOpenChange={setBulkGradeDialogOpen}
        onBulkGrade={handleBulkGrade}
      />
    </div>
  )
}
