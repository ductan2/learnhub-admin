"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api/exports"
import type { Course, CourseReview } from "@/types/course"
import { Star } from "lucide-react"

interface CourseReviewsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: Course
  onRefresh?: () => void
}

const PAGE_SIZE = 10

export function CourseReviewsDialog({ open, onOpenChange, course, onRefresh }: CourseReviewsDialogProps) {
  const { toast } = useToast()
  const [reviews, setReviews] = useState<CourseReview[]>([])
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [averageRating, setAverageRating] = useState<number | null>(course.average_rating ?? null)
  const [reviewCount, setReviewCount] = useState<number>(course.review_count ?? 0)

  useEffect(() => {
    if (!open) return
    setPage(1)
    void loadReviews(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, course.id])

  const loadReviews = async (targetPage: number) => {
    try {
      setIsLoading(true)
      const collection = await api.courses.getReviews(course.id, targetPage, PAGE_SIZE)
      setReviews(collection.items)
      setPage(collection.page)
      setTotalCount(collection.total_count)
      setAverageRating(collection.average_rating ?? course.average_rating ?? null)
      setReviewCount(collection.review_count ?? course.review_count ?? collection.items.length)
    } catch (error) {
      console.error("Failed to load course reviews", error)
      toast({
        title: "Unable to load reviews",
        description: "We couldn't fetch the latest reviews for this course.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    await loadReviews(page)
    onRefresh?.()
  }

  const handlePrevious = () => {
    if (page === 1) return
    void loadReviews(page - 1)
  }

  const handleNext = () => {
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
    if (page >= totalPages) return
    void loadReviews(page + 1)
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const formattedAverage = averageRating ? averageRating.toFixed(1) : "0.0"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Course Reviews - {course.title}</DialogTitle>
          <DialogDescription>
            Monitor learner feedback and keep track of how this course is performing.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-border px-4 py-2">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <div>
                  <div className="text-lg font-semibold text-foreground">{formattedAverage}</div>
                  <div className="text-xs text-muted-foreground">Average rating</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border px-4 py-2">
                <Badge variant="secondary" className="px-2 py-0">
                  {reviewCount}
                </Badge>
                <div className="text-xs text-muted-foreground">Total reviews</div>
              </div>
            </div>
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              Refresh
            </Button>
          </div>

          <Separator />

          <ScrollArea className="max-h-[420px] pr-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-3">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-muted-foreground">
                <Star className="h-8 w-8 text-muted-foreground mb-3" />
                No reviews yet. Encourage learners to share their experience once the course is live.
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-lg border border-border p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <span className="font-medium text-foreground">{review.rating} / 5</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleString()}
                      </div>
                    </div>
                    {review.comment ? (
                      <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{review.comment}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">No written feedback provided.</p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Reviewer ID: <span className="font-mono">{review.user_id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>
              Showing {reviews.length} of {totalCount} reviews
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevious} disabled={page === 1 || isLoading}>
                Previous
              </Button>
              <span>
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={page >= totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
