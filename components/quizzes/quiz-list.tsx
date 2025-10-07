"use client"

import { HelpCircle, Plus, Search, Eye, Edit, Trash2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import type { Quiz } from "@/types/quiz"
import type { Topic, Level } from "@/types/common"

interface QuizListProps {
  quizzes: Quiz[]
  topics: Topic[]
  levels: Level[]
  onCreateQuiz: () => void
  onEditQuiz: (quiz: Quiz) => void
  onDeleteQuiz: (quizId: string) => void
  onDuplicateQuiz: (quiz: Quiz) => void
  onPreviewQuiz: (quiz: Quiz) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  topicFilter: string
  onTopicFilterChange: (topicId: string) => void
  levelFilter: string
  onLevelFilterChange: (levelId: string) => void
}

export function QuizList({
  quizzes,
  topics,
  levels,
  onCreateQuiz,
  onEditQuiz,
  onDeleteQuiz,
  onDuplicateQuiz,
  onPreviewQuiz,
  searchQuery,
  onSearchChange,
  topicFilter,
  onTopicFilterChange,
  levelFilter,
  onLevelFilterChange,
}: QuizListProps) {
  const getTopicName = (topicId: string) => topics.find((t) => t.id === topicId)?.name || "Unknown"
  const getLevelName = (levelId: string) => levels.find((l) => l.id === levelId)?.name || "Unknown"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={topicFilter} onValueChange={onTopicFilterChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Topics" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              {topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={levelFilter} onValueChange={onLevelFilterChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {levels.map((level) => (
                <SelectItem key={level.id} value={level.id}>
                  {level.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={onCreateQuiz}>
          <Plus className="h-4 w-4 mr-2" />
          New Quiz
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-muted px-4 py-3 grid grid-cols-12 gap-4 text-sm font-medium">
          <div className="col-span-4">Title</div>
          <div className="col-span-2">Topic</div>
          <div className="col-span-2">Level</div>
          <div className="col-span-1">Questions</div>
          <div className="col-span-2">Avg Score</div>
          <div className="col-span-1"></div>
        </div>

        <div className="divide-y divide-border">
          {quizzes.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No quizzes found</p>
              <Button variant="link" onClick={onCreateQuiz} className="mt-2">
                Create your first quiz
              </Button>
            </div>
          ) : (
            quizzes.map((quiz) => (
              <div key={quiz.id} className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-accent/50">
                <div className="col-span-4">
                  <div className="font-medium">{quiz.title}</div>
                  {quiz.description && (
                    <div className="text-sm text-muted-foreground line-clamp-1">{quiz.description}</div>
                  )}
                  <div className="flex gap-2 mt-1">
                    {quiz.time_limit && (
                      <Badge variant="outline" className="text-xs">
                        {quiz.time_limit}min
                      </Badge>
                    )}
                    {quiz.passing_score && (
                      <Badge variant="outline" className="text-xs">
                        Pass: {quiz.passing_score}%
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="col-span-2 text-sm">{getTopicName(quiz.topic_id)}</div>

                <div className="col-span-2">
                  <Badge variant="outline">{getLevelName(quiz.level_id)}</Badge>
                </div>

                <div className="col-span-1 text-sm">{quiz.question_count || 0}</div>

                <div className="col-span-2 text-sm">
                  <div>{quiz.average_score || 0}%</div>
                  <div className="text-xs text-muted-foreground">{quiz.attempt_count || 0} attempts</div>
                </div>

                <div className="col-span-1 flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onPreviewQuiz(quiz)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditQuiz(quiz)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicateQuiz(quiz)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDeleteQuiz(quiz.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
