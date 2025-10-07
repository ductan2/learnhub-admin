"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Submission } from "@/types/submission"

interface GradeDialogProps {
  submission: Submission | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onGrade: (submissionId: string, score: number, feedback: string, status: "graded" | "needs_revision") => void
}

export function GradeDialog({ submission, open, onOpenChange, onGrade }: GradeDialogProps) {
  const [score, setScore] = useState(submission?.teacher_score?.toString() || "")
  const [feedback, setFeedback] = useState(submission?.teacher_feedback || "")
  const [status, setStatus] = useState<"graded" | "needs_revision">("graded")

  const handleSubmit = () => {
    if (!submission) return
    const numScore = Number.parseInt(score)
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      alert("Please enter a valid score between 0 and 100")
      return
    }
    onGrade(submission.id, numScore, feedback, status)
    onOpenChange(false)
  }

  if (!submission) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Grade Submission</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Assignment</h4>
            <p className="text-sm text-muted-foreground">{submission.assignment_title}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Student</h4>
            <p className="text-sm text-muted-foreground">{submission.user?.full_name || "Unknown"}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Type</h4>
            <p className="text-sm text-muted-foreground capitalize">{submission.type}</p>
          </div>

          {submission.type === "writing" && submission.content && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Content</h4>
              <div className="p-4 bg-muted rounded-lg text-sm text-foreground max-h-48 overflow-y-auto">
                {submission.content}
              </div>
            </div>
          )}

          {submission.type === "speaking" && submission.audio_url && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Audio Recording</h4>
              <audio controls className="w-full">
                <source src={submission.audio_url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {submission.ai_score && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">AI Score</h4>
              <p className="text-sm text-muted-foreground">{submission.ai_score}/100</p>
            </div>
          )}

          {submission.ai_feedback && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">AI Feedback</h4>
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-sm text-foreground">
                {submission.ai_feedback}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="score">Teacher Score (0-100)</Label>
            <Input
              id="score"
              type="number"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Enter score"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: "graded" | "needs_revision") => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="graded">Graded</SelectItem>
                <SelectItem value="needs_revision">Needs Revision</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Teacher Feedback</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide detailed feedback for the student..."
              rows={6}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit Grade</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
