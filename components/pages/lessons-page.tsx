"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { LessonList } from "@/components/lessons/lesson-list"
import { LessonFormDialog } from "@/components/lessons/lesson-form-dialog"
import { LessonEditorDialog } from "@/components/lessons/lesson-editor-dialog"
import { api } from "@/lib/api/exports"
import type { Lesson, CreateLessonDto, LessonSection, LessonFilters } from "@/types/lesson"
import type { Topic, Level } from "@/types/common"
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
  const [topics, setTopics] = useState<Topic[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [topicFilter, setTopicFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [publishedFilter, setPublishedFilter] = useState("all")
  const [isLoadingLessons, setIsLoadingLessons] = useState(false)
  const isMountedRef = useRef(false)
  const [formDialog, setFormDialog] = useState<{ open: boolean; lesson: Lesson | null }>({
    open: false,
    lesson: null,
  })
  const [editorDialog, setEditorDialog] = useState<{
    open: boolean
    lesson: Lesson | null
    initialTab: "edit" | "preview"
  }>({
    open: false,
    lesson: null,
    initialTab: "edit",
  })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; lessonId: string | null }>({
    open: false,
    lessonId: null,
  })

  const { toast } = useToast()

  const buildLessonFilters = useCallback((): LessonFilters | undefined => {
    const filters: LessonFilters = {}

    const trimmedSearch = searchQuery.trim()
    if (trimmedSearch) {
      filters.search = trimmedSearch
    }

    if (topicFilter !== "all") {
      filters.topic_id = topicFilter
    }

    if (levelFilter !== "all") {
      filters.level_id = levelFilter
    }

    if (publishedFilter === "published") {
      filters.is_published = true
    } else if (publishedFilter === "draft") {
      filters.is_published = false
    }

    if (Object.keys(filters).length === 0) {
      return undefined
    }

    return filters
  }, [levelFilter, publishedFilter, searchQuery, topicFilter])

  const loadLessons = useCallback(async () => {
    if (isMountedRef.current) {
      setIsLoadingLessons(true)
    }

    try {
      const filters = buildLessonFilters()
      const lessonsData = await api.lessons.getAll(filters)

      if (isMountedRef.current) {
        setLessons(lessonsData)
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error("Failed to load lessons", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load lessons",
          variant: "destructive",
        })
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingLessons(false)
      }
    }
  }, [buildLessonFilters, toast])

  const loadMetadata = useCallback(async () => {
    try {
      const [topicsData, levelsData] = await Promise.all([
        api.topics.getAll({ pageSize: 1000 }),
        api.levels.getAll({ pageSize: 1000 }),
      ])

      if (isMountedRef.current) {
        setTopics(topicsData.items)
        setLevels(levelsData.items)
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error("Failed to load lesson metadata", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load lesson metadata",
          variant: "destructive",
        })
      }
    }
  }, [toast])

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    loadMetadata()
  }, [loadMetadata])

  useEffect(() => {
    loadLessons()
  }, [loadLessons])

  const handleCreateLesson = async (data: CreateLessonDto) => {
    try {
      await api.lessons.create(data)
      toast({
        title: "Success",
        description: "Lesson created successfully",
      })
      setFormDialog({ open: false, lesson: null })
      await loadLessons()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create lesson",
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
      await loadLessons()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update lesson",
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
      await loadLessons()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete lesson",
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
      await loadLessons()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update lesson status",
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
        lessons={lessons}
        topics={topics}
        levels={levels}
        onCreateLesson={() => setFormDialog({ open: true, lesson: null })}
        onEditLesson={(lesson) => setFormDialog({ open: true, lesson })}
        onEditLessonSections={(lesson) =>
          setEditorDialog({ open: true, lesson, initialTab: "edit" })
        }
        onDeleteLesson={(lessonId) => setDeleteDialog({ open: true, lessonId })}
        onTogglePublish={handleTogglePublish}
        onPreviewLesson={(lesson) =>
          setEditorDialog({ open: true, lesson, initialTab: "preview" })
        }
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        topicFilter={topicFilter}
        onTopicFilterChange={setTopicFilter}
        levelFilter={levelFilter}
        onLevelFilterChange={setLevelFilter}
        publishedFilter={publishedFilter}
        onPublishedFilterChange={setPublishedFilter}
        isLoading={isLoadingLessons}
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
        onClose={() => setEditorDialog({ open: false, lesson: null, initialTab: "edit" })}
        lesson={editorDialog.lesson}
        onSave={handleSaveSections}
        initialTab={editorDialog.initialTab}
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
