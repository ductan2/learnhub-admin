"use client"

import { useEffect, useState } from "react"

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import type { CreateLevelDto, Level, UpdateLevelDto } from "@/lib/types"

interface LevelFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  level?: Level | null
  onSuccess?: (level: Level) => void
  nextOrder?: number
}

interface LevelFormState {
  name: string
  order: string
}

const defaultState: LevelFormState = {
  name: "",
  order: "1",
}

export function LevelFormDialog({ open, onOpenChange, level, onSuccess, nextOrder }: LevelFormDialogProps) {
  const { toast } = useToast()
  const [formState, setFormState] = useState<LevelFormState>(defaultState)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      if (level) {
        setFormState({
          name: level.name,
          order: String(level.order),
        })
      } else {
        setFormState({
          name: "",
          order: String(nextOrder ?? 1),
        })
      }
    }
  }, [level, nextOrder, open])

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = formState.name.trim()
    if (!trimmedName) {
      toast({
        title: "Name is required",
        description: "Please provide a name for the level.",
        variant: "destructive",
      })
      return
    }

    const parsedOrder = Number.parseInt(formState.order, 10)
    if (Number.isNaN(parsedOrder) || parsedOrder < 1) {
      toast({
        title: "Order must be a positive number",
        description: "Levels are displayed in ascending order.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      if (level) {
        const payload: UpdateLevelDto = {
          name: trimmedName,
          order: parsedOrder,
        }
        const updatedLevel = await api.levels.update(level.id, payload)
        toast({
          title: "Level updated",
          description: `\"${updatedLevel.name}\" has been updated successfully.`,
        })
        onSuccess?.(updatedLevel)
      } else {
        const payload: CreateLevelDto = {
          name: trimmedName,
          order: parsedOrder,
        }
        const createdLevel = await api.levels.create(payload)
        toast({
          title: "Level created",
          description: `\"${createdLevel.name}\" is now available.`,
        })
        onSuccess?.(createdLevel)
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to submit level form", error)
      toast({
        title: level ? "Unable to update level" : "Unable to create level",
        description: "Something went wrong while saving the level. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{level ? "Edit level" : "Create level"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="level-name">
              Level name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="level-name"
              value={formState.name}
              onChange={(event) => setFormState((state) => ({ ...state, name: event.target.value }))}
              placeholder="e.g. Beginner"
              required
              autoFocus
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="level-order">
              Display order <span className="text-destructive">*</span>
            </Label>
            <Input
              id="level-order"
              type="number"
              min={1}
              value={formState.order}
              onChange={(event) => setFormState((state) => ({ ...state, order: event.target.value }))}
              placeholder="1"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Levels are shown from lowest to highest order.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-3">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : level ? "Save changes" : "Create level"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

