"use client"

import { useEffect, useState } from "react"

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { TopicSelect } from "@/components/ui/topic-select"
import { LevelSelect } from "@/components/ui/level-select"
import { useToast } from "@/hooks/use-toast"
import type { CreateFlashcardSetDto } from "@/types/flashcard"

interface FlashcardSetFormState {
  title: string
  description: string
  topicId: string | null
  levelId: string | null
}

interface FlashcardSetFormDialogProps {
  open: boolean
  mode?: "create" | "edit"
  initialValues?: {
    title?: string
    description?: string | null
    topicId?: string | null
    levelId?: string | null
  }
  onOpenChange: (open: boolean) => void
  onSubmit: (values: CreateFlashcardSetDto) => Promise<void> | void
}

const defaultState: FlashcardSetFormState = {
  title: "",
  description: "",
  topicId: null,
  levelId: null,
}

export function FlashcardSetFormDialog({
  open,
  mode = "create",
  initialValues,
  onOpenChange,
  onSubmit,
}: FlashcardSetFormDialogProps) {
  const { toast } = useToast()
  const [formState, setFormState] = useState<FlashcardSetFormState>(defaultState)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setFormState({
        title: initialValues?.title ?? "",
        description: initialValues?.description ?? "",
        topicId: initialValues?.topicId ?? null,
        levelId: initialValues?.levelId ?? null,
      })
      setIsSubmitting(false)
    }
  }, [initialValues?.description, initialValues?.levelId, initialValues?.title, initialValues?.topicId, open])

  const isEditMode = mode === "edit"
  const dialogTitle = isEditMode ? "Edit flashcard set" : "Create flashcard set"
  const submitLabel = isSubmitting ? "Saving..." : isEditMode ? "Save changes" : "Create set"

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedTitle = formState.title.trim()
    if (!trimmedTitle) {
      toast({
        title: "Title is required",
        description: "Please provide a title for the flashcard set.",
        variant: "destructive",
      })
      return
    }

    const payload: CreateFlashcardSetDto = {
      title: trimmedTitle,
      description: (() => {
        const trimmed = formState.description.trim()
        return trimmed.length > 0 ? trimmed : null
      })(),
      topicId: formState.topicId,
      levelId: formState.levelId,
    }

    try {
      setIsSubmitting(true)
      await onSubmit(payload)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to submit flashcard set form", error)
      toast({
        title: isEditMode ? "Unable to update flashcard set" : "Unable to save flashcard set",
        description: "Something went wrong while saving the flashcard set. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="flashcard-set-title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="flashcard-set-title"
              value={formState.title}
              onChange={(event) => setFormState((state) => ({ ...state, title: event.target.value }))}
              placeholder="e.g. Basic greetings"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="flashcard-set-description">Description</Label>
            <Textarea
              id="flashcard-set-description"
              value={formState.description}
              onChange={(event) => setFormState((state) => ({ ...state, description: event.target.value }))}
              placeholder="Describe the focus of this set"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="flashcard-set-topic">Topic</Label>
              <TopicSelect
                value={formState.topicId ?? undefined}
                onChange={(value) => setFormState((state) => ({ ...state, topicId: (value as string | null) || null }))}
                placeholder="Select topic"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flashcard-set-level">Level</Label>
              <LevelSelect
                value={formState.levelId ?? undefined}
                onChange={(value) => setFormState((state) => ({ ...state, levelId: (value as string | null) || null }))}
                placeholder="Select level"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-3">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
