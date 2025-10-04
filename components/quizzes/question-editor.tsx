"use client"

import { useState } from "react"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import type { QuizQuestion, QuizAnswer } from "@/lib/types"

interface QuestionEditorProps {
  quizId: string
  questions: QuizQuestion[]
  onQuestionsChange: (questions: QuizQuestion[]) => void
}

export function QuestionEditor({ quizId, questions, onQuestionsChange }: QuestionEditorProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `temp-${Date.now()}`,
      quiz_id: quizId,
      type: "multiple_choice",
      question_text: "",
      points: 1,
      order: questions.length + 1,
      answers: [],
    }
    onQuestionsChange([...questions, newQuestion])
    setExpandedQuestion(newQuestion.id)
  }

  const updateQuestion = (id: string, updates: Partial<QuizQuestion>) => {
    onQuestionsChange(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)))
  }

  const deleteQuestion = (id: string) => {
    onQuestionsChange(questions.filter((q) => q.id !== id).map((q, index) => ({ ...q, order: index + 1 })))
  }

  const addAnswer = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId)
    if (!question) return

    const newAnswer: QuizAnswer = {
      id: `temp-${Date.now()}`,
      question_id: questionId,
      answer_text: "",
      is_correct: false,
      order: (question.answers?.length || 0) + 1,
    }

    updateQuestion(questionId, {
      answers: [...(question.answers || []), newAnswer],
    })
  }

  const updateAnswer = (questionId: string, answerId: string, updates: Partial<QuizAnswer>) => {
    const question = questions.find((q) => q.id === questionId)
    if (!question) return

    updateQuestion(questionId, {
      answers: question.answers?.map((a) => (a.id === answerId ? { ...a, ...updates } : a)),
    })
  }

  const deleteAnswer = (questionId: string, answerId: string) => {
    const question = questions.find((q) => q.id === questionId)
    if (!question) return

    updateQuestion(questionId, {
      answers: question.answers?.filter((a) => a.id !== answerId).map((a, index) => ({ ...a, order: index + 1 })),
    })
  }

  const setCorrectAnswer = (questionId: string, answerId: string, isMultiple: boolean) => {
    const question = questions.find((q) => q.id === questionId)
    if (!question) return

    if (isMultiple) {
      // For multiple choice, toggle the answer
      updateAnswer(questionId, answerId, {
        is_correct: !question.answers?.find((a) => a.id === answerId)?.is_correct,
      })
    } else {
      // For single choice, set only this answer as correct
      updateQuestion(questionId, {
        answers: question.answers?.map((a) => ({ ...a, is_correct: a.id === answerId })),
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Questions</h3>
        <Button onClick={addQuestion}>
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <p>No questions yet. Add your first question to get started.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {questions.map((question, index) => {
            const isExpanded = expandedQuestion === question.id

            return (
              <Card key={question.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="pt-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-muted-foreground">Question {index + 1}</span>
                          <Select
                            value={question.type}
                            onValueChange={(value) =>
                              updateQuestion(question.id, { type: value as QuizQuestion["type"] })
                            }
                          >
                            <SelectTrigger className="w-48 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                              <SelectItem value="true_false">True/False</SelectItem>
                              <SelectItem value="short_answer">Short Answer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {isExpanded ? (
                          <Textarea
                            value={question.question_text}
                            onChange={(e) => updateQuestion(question.id, { question_text: e.target.value })}
                            placeholder="Enter your question..."
                            rows={3}
                          />
                        ) : (
                          <p
                            className="text-sm cursor-pointer hover:text-primary"
                            onClick={() => setExpandedQuestion(question.id)}
                          >
                            {question.question_text || "Click to edit question..."}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedQuestion(isExpanded ? null : question.id)}
                        >
                          {isExpanded ? "Collapse" : "Expand"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => deleteQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Points</Label>
                            <Input
                              type="number"
                              min="1"
                              value={question.points}
                              onChange={(e) => updateQuestion(question.id, { points: Number(e.target.value) })}
                            />
                          </div>

                          {question.explanation !== undefined && (
                            <div className="space-y-2">
                              <Label>Explanation (optional)</Label>
                              <Input
                                value={question.explanation || ""}
                                onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
                                placeholder="Explain the correct answer..."
                              />
                            </div>
                          )}
                        </div>

                        {question.type === "multiple_choice" && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label>Answer Options</Label>
                              <Button variant="outline" size="sm" onClick={() => addAnswer(question.id)}>
                                <Plus className="h-3 w-3 mr-1" />
                                Add Answer
                              </Button>
                            </div>

                            <div className="space-y-2">
                              {question.answers?.map((answer) => (
                                <div key={answer.id} className="flex items-center gap-2">
                                  <Checkbox
                                    checked={answer.is_correct}
                                    onCheckedChange={() => setCorrectAnswer(question.id, answer.id, true)}
                                  />
                                  <Input
                                    value={answer.answer_text}
                                    onChange={(e) =>
                                      updateAnswer(question.id, answer.id, { answer_text: e.target.value })
                                    }
                                    placeholder="Enter answer option..."
                                    className="flex-1"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => deleteAnswer(question.id, answer.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {question.type === "true_false" && (
                          <div className="space-y-3">
                            <Label>Correct Answer</Label>
                            <RadioGroup
                              value={question.correct_answer || "true"}
                              onValueChange={(value) => updateQuestion(question.id, { correct_answer: value })}
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="true" id={`${question.id}-true`} />
                                <Label htmlFor={`${question.id}-true`}>True</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="false" id={`${question.id}-false`} />
                                <Label htmlFor={`${question.id}-false`}>False</Label>
                              </div>
                            </RadioGroup>
                          </div>
                        )}

                        {question.type === "short_answer" && (
                          <div className="space-y-2">
                            <Label>Correct Answer</Label>
                            <Input
                              value={question.correct_answer || ""}
                              onChange={(e) => updateQuestion(question.id, { correct_answer: e.target.value })}
                              placeholder="Enter the correct answer..."
                            />
                            <p className="text-xs text-muted-foreground">
                              Student answers will be compared case-insensitively
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
