"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QuestionEditor } from "./question-editor"
import type { Quiz, QuizQuestion } from "@/types/quiz"
import { Eye, Save, Check, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { api } from "@/lib/api/exports"
import { useToast } from "@/hooks/use-toast"

interface QuizEditorDialogProps {
  open: boolean
  onClose: () => void
  quiz: Quiz | null
  onSave: (quiz: Quiz, questions: QuizQuestion[]) => Promise<void>
}

export function QuizEditorDialog({ open, onClose, quiz, onSave }: QuizEditorDialogProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [activeTab, setActiveTab] = useState("edit")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    let isMounted = true

    const loadQuestions = async () => {
      if (!quiz || !open) {
        if (isMounted) {
          setQuestions([])
          setIsLoading(false)
        }
        return
      }

      setIsLoading(true)

      try {
        if (quiz.questions && quiz.questions.length > 0) {
          if (isMounted) {
            setQuestions(quiz.questions)
          }
          return
        }

        const detailedQuiz = await api.quizzes.getById(quiz.id)
        if (!isMounted) return

        setQuestions(detailedQuiz.questions ?? [])
      } catch (error) {
        console.error("Failed to load quiz questions", error)
        if (isMounted) {
          setQuestions([])
          toast({
            title: "Error",
            description: "Failed to load quiz questions",
            variant: "destructive",
          })
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadQuestions()

    return () => {
      isMounted = false
    }
  }, [quiz, open, toast])

  useEffect(() => {
    if (open) {
      setActiveTab("edit")
    }
  }, [open])

  const handleSave = async () => {
    if (!quiz) return

    setIsSaving(true)
    try {
      await onSave(quiz, questions)
      onClose()
    } catch (error) {
      console.error("Failed to save quiz questions", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!quiz) return null

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) {
        onClose()
      }
    }}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{quiz.title}</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setActiveTab(activeTab === "edit" ? "preview" : "edit")}>
                <Eye className="h-4 w-4 mr-2" />
                {activeTab === "edit" ? "Preview" : "Edit"}
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {isSaving ? "Saving..." : "Save Questions"}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Edit Questions</TabsTrigger>
            <TabsTrigger value="preview">Preview Quiz</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="flex-1 overflow-y-auto mt-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mb-2" />
                <p>Loading questions...</p>
              </div>
            ) : (
              <QuestionEditor quizId={quiz.id} questions={questions} onQuestionsChange={setQuestions} />
            )}
          </TabsContent>

          <TabsContent value="preview" className="flex-1 overflow-y-auto mt-4">
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
                {quiz.description && <p className="text-muted-foreground">{quiz.description}</p>}
                <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                  <span>
                    {isLoading ? "Loading questions..." : `${questions.length} questions`}
                  </span>
                  {quiz.time_limit && <span>{quiz.time_limit} minutes</span>}
                  {quiz.passing_score && <span>Pass: {quiz.passing_score}%</span>}
                </div>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mb-2" />
                  <p>Loading questions...</p>
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No questions to preview yet</p>
                </div>
              ) : (
                questions.map((question, index) => (
                  <Card key={question.id} className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium">
                          {index + 1}. {question.question_text}
                        </h3>
                        <span className="text-sm text-muted-foreground">{question.points} pts</span>
                      </div>

                      {question.type === "multiple_choice" && (
                        <div className="space-y-2">
                          {question.answers?.map((answer) => (
                            <div
                              key={answer.id}
                              className={`p-3 border rounded ${answer.is_correct ? "border-green-500 bg-green-500/10" : "border-border"}`}
                            >
                              {answer.answer_text}
                              {answer.is_correct && <Check className="inline h-4 w-4 ml-2 text-green-500" />}
                            </div>
                          ))}
                        </div>
                      )}

                      {question.type === "true_false" && (
                        <div className="space-y-2">
                          <div
                            className={`p-3 border rounded ${question.correct_answer === "true" ? "border-green-500 bg-green-500/10" : "border-border"}`}
                          >
                            True
                            {question.correct_answer === "true" && (
                              <Check className="inline h-4 w-4 ml-2 text-green-500" />
                            )}
                          </div>
                          <div
                            className={`p-3 border rounded ${question.correct_answer === "false" ? "border-green-500 bg-green-500/10" : "border-border"}`}
                          >
                            False
                            {question.correct_answer === "false" && (
                              <Check className="inline h-4 w-4 ml-2 text-green-500" />
                            )}
                          </div>
                        </div>
                      )}

                      {question.type === "short_answer" && (
                        <div className="p-3 border border-border rounded bg-muted">
                          <p className="text-sm text-muted-foreground">Correct answer: {question.correct_answer}</p>
                        </div>
                      )}

                      {question.explanation && (
                        <div className="text-sm text-muted-foreground italic">
                          <strong>Explanation:</strong> {question.explanation}
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
