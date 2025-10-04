"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import type { Course, Topic, Level, CreateCourseDto } from "@/lib/types"

interface CourseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course?: Course
  onSuccess: () => void
}

export function CourseFormDialog({ open, onOpenChange, course, onSuccess }: CourseFormDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [topics, setTopics] = useState<Topic[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [formData, setFormData] = useState<CreateCourseDto>({
    title: "",
    description: "",
    topic_id: "",
    level_id: "",
    instructor_id: "2",
    price: 0,
    duration_hours: 0,
    is_published: false,
    is_featured: false,
  })

  useEffect(() => {
    loadMetadata()
  }, [])

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description,
        topic_id: course.topic_id,
        level_id: course.level_id,
        instructor_id: course.instructor_id,
        thumbnail_url: course.thumbnail_url,
        price: course.price,
        duration_hours: course.duration_hours,
        is_published: course.is_published,
        is_featured: course.is_featured,
      })
    } else {
      setFormData({
        title: "",
        description: "",
        topic_id: "",
        level_id: "",
        instructor_id: "2",
        price: 0,
        duration_hours: 0,
        is_published: false,
        is_featured: false,
      })
    }
  }, [course, open])

  const loadMetadata = async () => {
    try {
      const [topicsData, levelsData] = await Promise.all([api.topics.getAll(), api.levels.getAll()])
      setTopics(topicsData)
      setLevels(levelsData)
    } catch (error) {
      console.error("Failed to load metadata:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.topic_id || !formData.level_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      if (course) {
        await api.courses.update(course.id, formData)
        toast({
          title: "Success",
          description: "Course updated successfully",
        })
      } else {
        await api.courses.create(formData)
        toast({
          title: "Success",
          description: "Course created successfully",
        })
      }
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${course ? "update" : "create"} course`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{course ? "Edit Course" : "Create New Course"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter course title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter course description"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic">
                Topic <span className="text-destructive">*</span>
              </Label>
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
              <Label htmlFor="level">
                Level <span className="text-destructive">*</span>
              </Label>
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
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                value={formData.duration_hours || ""}
                onChange={(e) => setFormData({ ...formData, duration_hours: Number.parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail URL</Label>
            <Input
              id="thumbnail"
              value={formData.thumbnail_url || ""}
              onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
              placeholder="Enter thumbnail URL"
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="published">Published</Label>
              <p className="text-sm text-muted-foreground">Make this course visible to students</p>
            </div>
            <Switch
              id="published"
              checked={formData.is_published}
              onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="featured">Featured</Label>
              <p className="text-sm text-muted-foreground">Show this course on the homepage</p>
            </div>
            <Switch
              id="featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : course ? "Update Course" : "Create Course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
