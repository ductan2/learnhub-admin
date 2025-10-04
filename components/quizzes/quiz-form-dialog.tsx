"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { Quiz, Topic, Level, CreateQuizDto } from "@/lib/types"

interface QuizFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateQuizDto) => void
  quiz?: Quiz | null
  topics: Topic[]
  levels: Level[]
}

export function QuizFormDialog({ open, onClose, onSubmit, quiz, topics, levels }: QuizFormDialogProps) {
  const [formData, setFormData] = useState<CreateQuizDto>({
    title: "",
    description: "",
    topic_id: "",
    level_id: "",
    time_limit: undefined,
    passing_score: undefined,
    shuffle_questions: false,
    shuffle_answers: false,
    show_correct_answers: true,
  })

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title,
        description: quiz.description || "",
        topic_id: quiz.topic_id,
        level_id: quiz.level_id,
        time_limit: quiz.time_limit,
        passing_score: quiz.passing_score,
        shuffle_questions: quiz.shuffle_questions || false,
        shuffle_answers: quiz.shuffle_answers || false,
        show_correct_answers: quiz.show_correct_answers ?? true,
      })
    } else {
      setFormData({
        title: "",
        description: "",
        topic_id: topics[0]?.id || "",
        level_id: levels[0]?.id || "",
        time_limit: undefined,
        passing_score: undefined,
        shuffle_questions: false,
        shuffle_answers: false,
        show_correct_answers: true,
      })
    }
  }, [quiz, open, topics, levels])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{quiz ? "Edit Quiz" : "Create New Quiz"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter quiz title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter quiz description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic *</Label>
                <Select
                  value={formData.topic_id}
                  onValueChange={(value) => setFormData({ ...formData, topic_id: value })}
                >
                  <SelectTrigger id="topic">
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id}>
                        {topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Level *</Label>
                <Select
                  value={formData.level_id}
                  onValueChange={(value) => setFormData({ ...formData, level_id: value })}
                >
                  <SelectTrigger id="level">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time_limit">Time Limit (minutes)</Label>
                <Input
                  id="time_limit"
                  type="number"
                  min="1"
                  value={formData.time_limit || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, time_limit: e.target.value ? Number(e.target.value) : undefined })
                  }
                  placeholder="No limit"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passing_score">Passing Score (%)</Label>
                <Input
                  id="passing_score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.passing_score || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, passing_score: e.target.value ? Number(e.target.value) : undefined })
                  }
                  placeholder="No requirement"
                />
              </div>
            </div>

            <div className="space-y-3 border border-border rounded-lg p-4">
              <h4 className="font-medium">Quiz Settings</h4>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="shuffle_questions">Shuffle Questions</Label>
                  <p className="text-sm text-muted-foreground">Randomize question order for each attempt</p>
                </div>
                <Switch
                  id="shuffle_questions"
                  checked={formData.shuffle_questions}
                  onCheckedChange={(checked) => setFormData({ ...formData, shuffle_questions: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="shuffle_answers">Shuffle Answers</Label>
                  <p className="text-sm text-muted-foreground">Randomize answer order for each question</p>
                </div>
                <Switch
                  id="shuffle_answers"
                  checked={formData.shuffle_answers}
                  onCheckedChange={(checked) => setFormData({ ...formData, shuffle_answers: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show_correct_answers">Show Correct Answers</Label>
                  <p className="text-sm text-muted-foreground">Display correct answers after submission</p>
                </div>
                <Switch
                  id="show_correct_answers"
                  checked={formData.show_correct_answers}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_correct_answers: checked })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.title || !formData.topic_id || !formData.level_id}>
              {quiz ? "Update Quiz" : "Create Quiz"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
