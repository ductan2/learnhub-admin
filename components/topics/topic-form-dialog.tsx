"use client"

import { useEffect, useState } from "react"

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api/exports"
import type { CreateTopicDto, Topic, UpdateTopicDto } from "@/lib/types"
import { convertToSlug } from "@/utils/convert"

interface TopicFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  topic?: Topic | null
  onSuccess?: (topic: Topic) => void
}

interface TopicFormState {
  name: string
}

const defaultState: TopicFormState = {
  name: "", 
}

export function TopicFormDialog({ open, onOpenChange, topic, onSuccess }: TopicFormDialogProps) {
  const { toast } = useToast()
  const [formState, setFormState] = useState<TopicFormState>(defaultState)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      if (topic) {
        setFormState({
          name: topic.name,
        })
      } else {
        setFormState(defaultState)
      }
    }
  }, [open, topic])

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
        description: "Please provide a name for the topic.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      if (topic) {
        const payload: UpdateTopicDto = {
          name: trimmedName,
          slug: convertToSlug(trimmedName),
        }
        const updatedTopic = await api.topics.update(topic.id, payload)
        toast({
          title: "Topic updated",
          description: `\"${updatedTopic.name}\" has been updated successfully.`,
        })
        onSuccess?.(updatedTopic)
      } else {
        const payload: CreateTopicDto = {
          name: trimmedName,
          slug: convertToSlug(trimmedName),
        }
        const createdTopic = await api.topics.create(payload)
        toast({
          title: "Topic created",
          description: `\"${createdTopic.name}\" is now available.`,
        })
        onSuccess?.(createdTopic)
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to submit topic form", error)
      toast({
        title: topic ? "Unable to update topic" : "Unable to create topic",
        description: "Something went wrong while saving the topic. Please try again.",
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
          <DialogTitle>{topic ? "Edit topic" : "Create topic"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="topic-name">
              Topic name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="topic-name"
              value={formState.name}
              onChange={(event) => setFormState((state) => ({ ...state, name: event.target.value }))}
              placeholder="e.g. Programming"
              required
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-3">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : topic ? "Save changes" : "Create topic"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

