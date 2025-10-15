"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import {
  Plus,
  Search,
  BookOpen,
  Users,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Star,
  MessageCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api/exports"
import { CourseFormDialog } from "@/components/courses/course-form-dialog"
import { CourseLessonsDialog } from "@/components/courses/course-lessons-dialog"
import { CourseReviewsDialog } from "@/components/courses/course-reviews-dialog"
import type { Course } from "@/types/course"
import type { Topic, Level } from "@/types/common"

export function CoursesPage() {
  const { toast } = useToast()
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [topicFilter, setTopicFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [showLessonsDialog, setShowLessonsDialog] = useState(false)
  const [showReviewsDialog, setShowReviewsDialog] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>()
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterCourses()
  }, [courses, searchQuery, topicFilter, levelFilter, statusFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      const [coursesData, topicsData, levelsData] = await Promise.all([
        api.courses.getAll(),
        api.topics.getAll({ pageSize: 1000 }),
        api.levels.getAll({ pageSize: 1000 }),
      ])
      setCourses(coursesData)
      setTopics(topicsData.items)
      setLevels(levelsData.items)
    } catch (error) {
      console.error("Failed to load courses:", error)
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterCourses = () => {
    let filtered = [...courses]

    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (topicFilter !== "all") {
      filtered = filtered.filter((c) => c.topic_id === topicFilter)
    }

    if (levelFilter !== "all") {
      filtered = filtered.filter((c) => c.level_id === levelFilter)
    }

    if (statusFilter === "published") {
      filtered = filtered.filter((c) => c.is_published)
    } else if (statusFilter === "draft") {
      filtered = filtered.filter((c) => !c.is_published)
    } else if (statusFilter === "featured") {
      filtered = filtered.filter((c) => c.is_featured)
    }

    setFilteredCourses(filtered)
  }

  const handleCreateCourse = () => {
    setSelectedCourse(undefined)
    setShowFormDialog(true)
  }

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course)
    setShowFormDialog(true)
  }

  const handleManageLessons = (course: Course) => {
    setSelectedCourse(course)
    setShowLessonsDialog(true)
  }

  const handleViewReviews = (course: Course) => {
    setSelectedCourse(course)
    setShowReviewsDialog(true)
  }

  const handleTogglePublish = async (course: Course) => {
    try {
      await api.courses.publish(course.id, !course.is_published)
      toast({
        title: "Success",
        description: `Course ${course.is_published ? "unpublished" : "published"} successfully`,
      })
      await loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update course status",
        variant: "destructive",
      })
    }
  }

  const handleDuplicateCourse = async (course: Course) => {
    try {
      await api.courses.duplicate(course.id)
      toast({
        title: "Success",
        description: "Course duplicated successfully",
      })
      await loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate course",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return
    try {
      await api.courses.delete(courseToDelete.id)
      toast({
        title: "Success",
        description: "Course deleted successfully",
      })
      await loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      })
    } finally {
      setCourseToDelete(null)
    }
  }

  const getTopicName = (topicId?: string | null) => {
    if (!topicId) return "No topic"
    return topics.find((t) => t.id === topicId)?.name || "Unknown"
  }

  const getLevelName = (levelId?: string | null) => {
    if (!levelId) return "No level"
    return levels.find((l) => l.id === levelId)?.name || "Unknown"
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Courses</h2>
          <p className="text-sm text-muted-foreground mt-1">Create and manage comprehensive learning courses</p>
        </div>
        <Button onClick={handleCreateCourse}>
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={topicFilter} onValueChange={setTopicFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
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
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-full" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">No courses found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or create a new course</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg leading-tight line-clamp-2">{course.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="shrink-0">
                        {getLevelName(course.level_id)}
                      </Badge>
                      {course.is_featured && (
                        <Badge variant="default" className="shrink-0">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {!course.is_published && (
                        <Badge variant="outline" className="shrink-0">
                          Draft
                        </Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditCourse(course)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleManageLessons(course)}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Manage Lessons
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTogglePublish(course)}>
                        {course.is_published ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Publish
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicateCourse(course)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewReviews(course)}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        View Reviews
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setCourseToDelete(course)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="line-clamp-2">
                  {course.description || "No description available"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-normal">
                    {getTopicName(course.topic_id ?? undefined)}
                  </Badge>
                  {course.price && course.price > 0 && (
                    <Badge variant="outline" className="font-normal">
                      ${course.price.toFixed(2)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className={`h-4 w-4 ${course.review_count > 0 ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} />
                  {course.review_count > 0 ? (
                    <span>
                      {course.average_rating ? course.average_rating.toFixed(1) : "0.0"} · {course.review_count}{" "}
                      {course.review_count === 1 ? "review" : "reviews"}
                    </span>
                  ) : (
                    <span>No reviews yet</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.lesson_ids.length} lessons</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{course.enrollment_count || 0} enrolled</span>
                  </div>
                </div>
                {course.duration_hours && course.duration_hours > 0 && (
                  <div className="text-sm text-muted-foreground">Duration: {course.duration_hours}h</div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2 mt-auto">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent text-xs sm:text-sm"
                  onClick={() => handleManageLessons(course)}
                >
                  <span className="hidden sm:inline">Manage Lessons</span>
                  <span className="sm:hidden">Lessons</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-xs sm:text-sm"
                  onClick={() => handleViewReviews(course)}
                >
                  Reviews
                </Button>
                <Button
                  className="flex-1 text-xs sm:text-sm"
                  onClick={() => handleEditCourse(course)}
                >
                  <span className="hidden sm:inline">Edit Course</span>
                  <span className="sm:hidden">Edit</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {!loading && filteredCourses.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing {filteredCourses.length} of {courses.length} courses
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>
                {filteredCourses.reduce((sum, c) => sum + (c.enrollment_count || 0), 0)} total enrollments
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>{filteredCourses.reduce((sum, c) => sum + c.lesson_ids.length, 0)} total lessons</span>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <CourseFormDialog
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        course={selectedCourse}
        onSuccess={loadData}
      />

      {selectedCourse && (
        <CourseLessonsDialog
          open={showLessonsDialog}
          onOpenChange={setShowLessonsDialog}
          course={selectedCourse}
          onSuccess={loadData}
        />
      )}

      {selectedCourse && (
        <CourseReviewsDialog
          open={showReviewsDialog}
          onOpenChange={setShowReviewsDialog}
          course={selectedCourse}
          onRefresh={loadData}
        />
      )}

      <AlertDialog open={!!courseToDelete} onOpenChange={() => setCourseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{courseToDelete?.title}"? This action cannot be undone and will remove
              all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourse}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
