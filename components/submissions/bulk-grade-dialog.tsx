"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BulkGradeDialogProps {
  selectedCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onBulkGrade: (score: number, feedback: string, status: "graded" | "needs_revision") => void
}

export function BulkGradeDialog({ selectedCount, open, onOpenChange, onBulkGrade }: BulkGradeDialogProps) {
  const [score, setScore] = useState("")
  const [feedback, setFeedback] = useState("")
  const [status, setStatus] = useState<"graded" | "needs_revision">("graded")

  const handleSubmit = () => {
    const numScore = Number.parseInt(score)
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      alert("Please enter a valid score between 0 and 100")
      return
    }
    onBulkGrade(numScore, feedback, status)
    setScore("")
    setFeedback("")
    setStatus("graded")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Grade Submissions</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              You are about to grade <span className="font-semibold text-foreground">{selectedCount}</span>{" "}
              submission(s) with the same score and feedback.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bulk-score">Score (0-100)</Label>
            <Input
              id="bulk-score"
              type="number"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Enter score"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bulk-status">Status</Label>
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
            <Label htmlFor="bulk-feedback">Feedback</Label>
            <Textarea
              id="bulk-feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide feedback that applies to all selected submissions..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Grade {selectedCount} Submission(s)</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
