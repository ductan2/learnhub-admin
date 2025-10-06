"use client"

import { useState, useEffect } from "react"
import { LessonList } from "@/components/lessons/lesson-list"
import { LessonFormDialog } from "@/components/lessons/lesson-form-dialog"
import { LessonEditorDialog } from "@/components/lessons/lesson-editor-dialog"
import { api } from "@/lib/api/exports"
import type { Lesson, Topic, Level, CreateLessonDto, LessonSection } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [topicFilter, setTopicFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [publishedFilter, setPublishedFilter] = useState("all")
  const [formDialog, setFormDialog] = useState<{ open: boolean; lesson: Lesson | null }>({
    open: false,
    lesson: null,
  })
  const [editorDialog, setEditorDialog] = useState<{ open: boolean; lesson: Lesson | null }>({
    open: false,
    lesson: null,
  })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; lessonId: string | null }>({
    open: false,
    lessonId: null,
  })

  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterLessons()
  }, [lessons, searchQuery, topicFilter, levelFilter, publishedFilter])

  const loadData = async () => {
    try {
      const [lessonsData, topicsData, levelsData] = await Promise.all([
        api.lessons.getAll(),
        api.topics.getAll(),
        api.levels.getAll(),
      ])
      setLessons(lessonsData)
      setTopics(topicsData)
      setLevels(levelsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load lessons",
        variant: "destructive",
      })
    }
  }

  const filterLessons = () => {
    let filtered = [...lessons]

    if (searchQuery) {
      filtered = filtered.filter(
        (l) =>
          l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (topicFilter !== "all") {
      filtered = filtered.filter((l) => l.topic_id === topicFilter)
    }

    if (levelFilter !== "all") {
      filtered = filtered.filter((l) => l.level_id === levelFilter)
    }

    if (publishedFilter === "published") {
      filtered = filtered.filter((l) => l.is_published)
    } else if (publishedFilter === "draft") {
      filtered = filtered.filter((l) => !l.is_published)
    }

    setFilteredLessons(filtered)
  }

  const handleCreateLesson = async (data: CreateLessonDto) => {
    try {
      await api.lessons.create(data)
      toast({
        title: "Success",
        description: "Lesson created successfully",
      })
      setFormDialog({ open: false, lesson: null })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create lesson",
        variant: "destructive",
      })
    }
  }

  const handleUpdateLesson = async (data: CreateLessonDto) => {
    if (!formDialog.lesson) return

    try {
      await api.lessons.update(formDialog.lesson.id, data)
      toast({
        title: "Success",
        description: "Lesson updated successfully",
      })
      setFormDialog({ open: false, lesson: null })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lesson",
        variant: "destructive",
      })
    }
  }

  const handleDeleteLesson = async () => {
    if (!deleteDialog.lessonId) return

    try {
      await api.lessons.delete(deleteDialog.lessonId)
      toast({
        title: "Success",
        description: "Lesson deleted successfully",
      })
      setDeleteDialog({ open: false, lessonId: null })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete lesson",
        variant: "destructive",
      })
    }
  }

  const handleTogglePublish = async (lessonId: string, published: boolean) => {
    try {
      await api.lessons.publish(lessonId, published)
      toast({
        title: "Success",
        description: published ? "Lesson published successfully" : "Lesson unpublished successfully",
      })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lesson status",
        variant: "destructive",
      })
    }
  }

  const handleSaveSections = (sections: LessonSection[]) => {
    toast({
      title: "Success",
      description: "Lesson sections saved successfully",
    })
  }

  return (
    <div className="p-6">
      <LessonList
        lessons={filteredLessons}
        topics={topics}
        levels={levels}
        onCreateLesson={() => setFormDialog({ open: true, lesson: null })}
        onEditLesson={(lesson) => setEditorDialog({ open: true, lesson })}
        onDeleteLesson={(lessonId) => setDeleteDialog({ open: true, lessonId })}
        onTogglePublish={handleTogglePublish}
        onPreviewLesson={(lesson) => setEditorDialog({ open: true, lesson })}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        topicFilter={topicFilter}
        onTopicFilterChange={setTopicFilter}
        levelFilter={levelFilter}
        onLevelFilterChange={setLevelFilter}
        publishedFilter={publishedFilter}
        onPublishedFilterChange={setPublishedFilter}
      />

      <LessonFormDialog
        open={formDialog.open}
        onClose={() => setFormDialog({ open: false, lesson: null })}
        onSubmit={formDialog.lesson ? handleUpdateLesson : handleCreateLesson}
        lesson={formDialog.lesson}
        topics={topics}
        levels={levels}
      />

      <LessonEditorDialog
        open={editorDialog.open}
        onClose={() => setEditorDialog({ open: false, lesson: null })}
        lesson={editorDialog.lesson}
        onSave={handleSaveSections}
      />

      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && setDeleteDialog({ open: false, lessonId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lesson? This action cannot be undone and will remove all associated
              sections and student progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLesson}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
