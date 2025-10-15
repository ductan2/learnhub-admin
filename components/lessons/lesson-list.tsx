"use client"
import {
  BookOpen,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Globe,
  GlobeLock,
  Loader2,
  ListChecks,
} from "lucide-react"
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
import type { Lesson } from "@/types/lesson"
import type { Topic, Level } from "@/types/common"

interface LessonListProps {
  lessons: Lesson[]
  topics: Topic[]
  levels: Level[]
  onCreateLesson: () => void
  onEditLesson: (lesson: Lesson) => void
  onEditLessonSections: (lesson: Lesson) => void
  onDeleteLesson: (lessonId: string) => void
  onTogglePublish: (lessonId: string, published: boolean) => void
  onPreviewLesson: (lesson: Lesson) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  topicFilter: string
  onTopicFilterChange: (topicId: string) => void
  levelFilter: string
  onLevelFilterChange: (levelId: string) => void
  publishedFilter: string
  onPublishedFilterChange: (filter: string) => void
  isLoading?: boolean
}

export function LessonList({
  lessons,
  topics,
  levels,
  onCreateLesson,
  onEditLesson,
  onEditLessonSections,
  onDeleteLesson,
  onTogglePublish,
  onPreviewLesson,
  searchQuery,
  onSearchChange,
  topicFilter,
  onTopicFilterChange,
  levelFilter,
  onLevelFilterChange,
  publishedFilter,
  onPublishedFilterChange,
  isLoading = false,
}: LessonListProps) {
  const getTopicName = (topicId: string) => topics.find((t) => t.id === topicId)?.name || "Unknown"
  const getLevelName = (levelId: string) => levels.find((l) => l.id === levelId)?.name || "Unknown"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search lessons..."
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

          <Select value={publishedFilter} onValueChange={onPublishedFilterChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={onCreateLesson}>
          <Plus className="h-4 w-4 mr-2" />
          New Lesson
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-muted px-4 py-3 grid grid-cols-12 gap-4 text-sm font-medium">
          <div className="col-span-4">Title</div>
          <div className="col-span-2">Topic</div>
          <div className="col-span-2">Level</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2">Enrollments</div>
          <div className="col-span-1"></div>
        </div>

        <div className="divide-y divide-border">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Loading lessons...</p>
            </div>
          ) : lessons.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No lessons found</p>
              <Button variant="link" onClick={onCreateLesson} className="mt-2">
                Create your first lesson
              </Button>
            </div>
          ) : (
            lessons.map((lesson) => (
              <div key={lesson.id} className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-accent/50">
                <div className="col-span-4">
                  <div className="font-medium">{lesson.title}</div>
                  {lesson.description && (
                    <div className="text-sm text-muted-foreground line-clamp-1">{lesson.description}</div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">Version {lesson.version}</div>
                </div>

                <div className="col-span-2 text-sm">{getTopicName(lesson.topic_id)}</div>

                <div className="col-span-2">
                  <Badge variant="outline">{getLevelName(lesson.level_id)}</Badge>
                </div>

                <div className="col-span-1">
                  {lesson.is_published ? (
                    <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                      <Globe className="h-3 w-3 mr-1" />
                      Published
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <GlobeLock className="h-3 w-3 mr-1" />
                      Draft
                    </Badge>
                  )}
                </div>

                <div className="col-span-2 text-sm">
                  <div>{lesson.enrollment_count || 0} students</div>
                  <div className="text-xs text-muted-foreground">{lesson.completion_rate || 0}% completion</div>
                </div>

                <div className="col-span-1 flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onPreviewLesson(lesson)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditLesson(lesson)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Lesson
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditLessonSections(lesson)}>
                        <ListChecks className="h-4 w-4 mr-2" />
                        Edit Sections
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTogglePublish(lesson.id, !lesson.is_published)}>
                        {lesson.is_published ? (
                          <>
                            <GlobeLock className="h-4 w-4 mr-2" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Globe className="h-4 w-4 mr-2" />
                            Publish
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDeleteLesson(lesson.id)} className="text-destructive">
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
