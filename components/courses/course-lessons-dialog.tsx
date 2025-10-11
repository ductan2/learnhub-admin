"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api/exports"
import { Plus, Search, GripVertical, X, BookOpen } from "lucide-react"
import type { Course, CourseLesson } from "@/types/course"
import type { Lesson } from "@/types/lesson"
import type { Topic, Level } from "@/types/common"

interface CourseLessonsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: Course
  onSuccess: () => void
}

export function CourseLessonsDialog({ open, onOpenChange, course, onSuccess }: CourseLessonsDialogProps) {
  const { toast } = useToast()
  const [courseLessons, setCourseLessons] = useState<CourseLesson[]>([])
  const [availableLessons, setAvailableLessons] = useState<Lesson[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [showAddLesson, setShowAddLesson] = useState(false)

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open, course.id])

  const loadData = async () => {
    try {
      setLoading(true)
      const [courseLessonsData, allLessons, topicsData, levelsData] = await Promise.all([
        api.courses.getLessons(course.id),
        api.lessons.getAll({ is_published: true }),
        api.topics.getAll(),
        api.levels.getAll(),
      ])
      setCourseLessons(courseLessonsData)
      const assignedIds = new Set(courseLessonsData.map((lesson) => lesson.lesson_id))
      setAvailableLessons(allLessons.filter((lesson) => lesson.is_published && !assignedIds.has(lesson.id)))
      setTopics(topicsData)
      setLevels(levelsData)
    } catch (error) {
      console.error("Failed to load lessons:", error)
      toast({
        title: "Error",
        description: "Failed to load lessons",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddLesson = async (lessonId: string) => {
    try {
      await api.courses.addLesson({
        course_id: course.id,
        lesson_id: lessonId,
        ord: courseLessons.length + 1,
      })
      toast({
        title: "Success",
        description: "Lesson added to course",
      })
      await loadData()
      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add lesson",
        variant: "destructive",
      })
    }
  }

  const handleRemoveLesson = async (courseLessonId: string) => {
    try {
      await api.courses.removeLesson(courseLessonId)
      toast({
        title: "Success",
        description: "Lesson removed from course",
      })
      await loadData()
      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove lesson",
        variant: "destructive",
      })
    }
  }

  const getTopicName = (topicId?: string | null) => topics.find((t) => t.id === topicId)?.name || "Unknown"
  const getLevelName = (levelId?: string | null) => levels.find((l) => l.id === levelId)?.name || "Unknown"

  const filteredAvailableLessons = availableLessons.filter(
    (l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Course Lessons - {course.title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Current Lessons */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Course Curriculum ({courseLessons.length})</h3>
              <Button size="sm" variant="outline" onClick={() => setShowAddLesson(!showAddLesson)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Lesson
              </Button>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : courseLessons.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-lg">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground">No lessons added yet</p>
                <p className="text-sm text-muted-foreground mt-1">Click "Add Lesson" to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {courseLessons.map((courseLesson, index) => (
                  <div
                    key={courseLesson.id}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                  >
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {courseLesson.lesson?.title || "Untitled lesson"}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getTopicName(courseLesson.lesson?.topic?.id)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {getLevelName(courseLesson.lesson?.level?.id)}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveLesson(courseLesson.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Lessons Section */}
          {showAddLesson && (
            <div className="space-y-3 pt-6 border-t border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">Available Lessons</h3>
                <Button size="sm" variant="ghost" onClick={() => setShowAddLesson(false)}>
                  Close
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search lessons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filteredAvailableLessons.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    {searchQuery ? "No lessons found matching your search" : "No available lessons"}
                  </div>
                ) : (
                  filteredAvailableLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 p-3 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground truncate mb-1">{lesson.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getTopicName(lesson.topic_id)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {getLevelName(lesson.level_id)}
                          </Badge>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleAddLesson(lesson.id)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
