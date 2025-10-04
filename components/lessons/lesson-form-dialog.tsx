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
import type { Lesson, Topic, Level, CreateLessonDto } from "@/lib/types"

interface LessonFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateLessonDto) => void
  lesson?: Lesson | null
  topics: Topic[]
  levels: Level[]
}

export function LessonFormDialog({ open, onClose, onSubmit, lesson, topics, levels }: LessonFormDialogProps) {
  const [formData, setFormData] = useState<CreateLessonDto>({
    title: "",
    description: "",
    topic_id: "",
    level_id: "",
    is_published: false,
  })

  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title,
        description: lesson.description || "",
        topic_id: lesson.topic_id,
        level_id: lesson.level_id,
        is_published: lesson.is_published,
      })
    } else {
      setFormData({
        title: "",
        description: "",
        topic_id: topics[0]?.id || "",
        level_id: levels[0]?.id || "",
        is_published: false,
      })
    }
  }, [lesson, open, topics, levels])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{lesson ? "Edit Lesson" : "Create New Lesson"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter lesson title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter lesson description"
                rows={4}
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

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <Label htmlFor="published" className="text-base">
                  Publish Lesson
                </Label>
                <p className="text-sm text-muted-foreground">Make this lesson visible to students</p>
              </div>
              <Switch
                id="published"
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.title || !formData.topic_id || !formData.level_id}>
              {lesson ? "Update Lesson" : "Create Lesson"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
