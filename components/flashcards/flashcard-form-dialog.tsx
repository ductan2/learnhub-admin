"use client"

import { useEffect, useState } from "react"

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface FlashcardFormState {
  frontText: string
  backText: string
  hintsText: string
}

interface FlashcardFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: { frontText: string; backText: string; hints?: string[] }) => Promise<void> | void
}

const defaultState: FlashcardFormState = {
  frontText: "",
  backText: "",
  hintsText: "",
}

export function FlashcardFormDialog({ open, onOpenChange, onSubmit }: FlashcardFormDialogProps) {
  const { toast } = useToast()
  const [formState, setFormState] = useState<FlashcardFormState>(defaultState)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setFormState(defaultState)
      setIsSubmitting(false)
    }
  }, [open])

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedFront = formState.frontText.trim()
    const trimmedBack = formState.backText.trim()

    if (!trimmedFront || !trimmedBack) {
      toast({
        title: "Front and back text are required",
        description: "Please provide both sides of the flashcard.",
        variant: "destructive",
      })
      return
    }

    const hints = formState.hintsText
      .split("\n")
      .map((hint) => hint.trim())
      .filter((hint) => hint.length > 0)

    try {
      setIsSubmitting(true)
      await onSubmit({ frontText: trimmedFront, backText: trimmedBack, hints: hints.length > 0 ? hints : undefined })
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to submit flashcard form", error)
      toast({
        title: "Unable to add flashcard",
        description: "Something went wrong while saving the flashcard. Please try again.",
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
          <DialogTitle>Add flashcard</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="flashcard-front">
              Front text <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="flashcard-front"
              value={formState.frontText}
              onChange={(event) => setFormState((state) => ({ ...state, frontText: event.target.value }))}
              placeholder="Prompt or question"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="flashcard-back">
              Back text <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="flashcard-back"
              value={formState.backText}
              onChange={(event) => setFormState((state) => ({ ...state, backText: event.target.value }))}
              placeholder="Answer or explanation"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="flashcard-hints">Hints</Label>
            <Textarea
              id="flashcard-hints"
              value={formState.hintsText}
              onChange={(event) => setFormState((state) => ({ ...state, hintsText: event.target.value }))}
              placeholder="Add optional hints, one per line"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-3">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
