"use client"

import { useState, useEffect } from "react"
import { QuizList } from "@/components/quizzes/quiz-list"
import { QuizFormDialog } from "@/components/quizzes/quiz-form-dialog"
import { QuizEditorDialog } from "@/components/quizzes/quiz-editor-dialog"
import { api } from "@/lib/api"
import type { Quiz, Topic, Level, CreateQuizDto, QuizQuestion } from "@/lib/types"
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

export function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [topicFilter, setTopicFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [formDialog, setFormDialog] = useState<{ open: boolean; quiz: Quiz | null }>({
    open: false,
    quiz: null,
  })
  const [editorDialog, setEditorDialog] = useState<{ open: boolean; quiz: Quiz | null }>({
    open: false,
    quiz: null,
  })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; quizId: string | null }>({
    open: false,
    quizId: null,
  })

  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterQuizzes()
  }, [quizzes, searchQuery, topicFilter, levelFilter])

  const loadData = async () => {
    try {
      const [quizzesData, topicsData, levelsData] = await Promise.all([
        api.quizzes.getAll(),
        api.topics.getAll(),
        api.levels.getAll(),
      ])
      setQuizzes(quizzesData)
      setTopics(topicsData)
      setLevels(levelsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load quizzes",
        variant: "destructive",
      })
    }
  }

  const filterQuizzes = () => {
    let filtered = [...quizzes]

    if (searchQuery) {
      filtered = filtered.filter(
        (q) =>
          q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (topicFilter !== "all") {
      filtered = filtered.filter((q) => q.topic_id === topicFilter)
    }

    if (levelFilter !== "all") {
      filtered = filtered.filter((q) => q.level_id === levelFilter)
    }

    setFilteredQuizzes(filtered)
  }

  const handleCreateQuiz = async (data: CreateQuizDto) => {
    try {
      const newQuiz = await api.quizzes.create(data)
      toast({
        title: "Success",
        description: "Quiz created successfully",
      })
      setFormDialog({ open: false, quiz: null })
      loadData()
      // Open editor for new quiz
      setEditorDialog({ open: true, quiz: newQuiz })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create quiz",
        variant: "destructive",
      })
    }
  }

  const handleUpdateQuiz = async (data: CreateQuizDto) => {
    if (!formDialog.quiz) return

    try {
      await api.quizzes.update(formDialog.quiz.id, data)
      toast({
        title: "Success",
        description: "Quiz updated successfully",
      })
      setFormDialog({ open: false, quiz: null })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quiz",
        variant: "destructive",
      })
    }
  }

  const handleDeleteQuiz = async () => {
    if (!deleteDialog.quizId) return

    try {
      await api.quizzes.delete(deleteDialog.quizId)
      toast({
        title: "Success",
        description: "Quiz deleted successfully",
      })
      setDeleteDialog({ open: false, quizId: null })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete quiz",
        variant: "destructive",
      })
    }
  }

  const handleDuplicateQuiz = async (quiz: Quiz) => {
    try {
      await api.quizzes.duplicate(quiz.id)
      toast({
        title: "Success",
        description: "Quiz duplicated successfully",
      })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate quiz",
        variant: "destructive",
      })
    }
  }

  const handleSaveQuestions = (questions: QuizQuestion[]) => {
    toast({
      title: "Success",
      description: "Quiz questions saved successfully",
    })
  }

  return (
    <div className="p-6">
      <QuizList
        quizzes={filteredQuizzes}
        topics={topics}
        levels={levels}
        onCreateQuiz={() => setFormDialog({ open: true, quiz: null })}
        onEditQuiz={(quiz) => setEditorDialog({ open: true, quiz })}
        onDeleteQuiz={(quizId) => setDeleteDialog({ open: true, quizId })}
        onDuplicateQuiz={handleDuplicateQuiz}
        onPreviewQuiz={(quiz) => setEditorDialog({ open: true, quiz })}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        topicFilter={topicFilter}
        onTopicFilterChange={setTopicFilter}
        levelFilter={levelFilter}
        onLevelFilterChange={setLevelFilter}
      />

      <QuizFormDialog
        open={formDialog.open}
        onClose={() => setFormDialog({ open: false, quiz: null })}
        onSubmit={formDialog.quiz ? handleUpdateQuiz : handleCreateQuiz}
        quiz={formDialog.quiz}
        topics={topics}
        levels={levels}
      />

      <QuizEditorDialog
        open={editorDialog.open}
        onClose={() => setEditorDialog({ open: false, quiz: null })}
        quiz={editorDialog.quiz}
        onSave={handleSaveQuestions}
      />

      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && setDeleteDialog({ open: false, quizId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quiz? This action cannot be undone and will remove all associated
              questions and student attempts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQuiz}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
