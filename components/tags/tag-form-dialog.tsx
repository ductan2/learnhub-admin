"use client"

import { useEffect, useMemo, useState } from "react"

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api/exports"
import type { CreateTagDto, Tag, UpdateTagDto } from "@/types/common"
import { convertToSlug } from "@/utils/convert"

interface TagFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tag?: Tag | null
  onSuccess?: (tag: Tag) => void
  existingSlugs?: string[]
}

interface TagFormState {
  name: string
  slug: string
}

const defaultState: TagFormState = {
  name: "",
  slug: "",
}

export function TagFormDialog({ open, onOpenChange, tag, onSuccess, existingSlugs = [] }: TagFormDialogProps) {
  const { toast } = useToast()
  const [formState, setFormState] = useState<TagFormState>(defaultState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSlugEdited, setIsSlugEdited] = useState(false)

  useEffect(() => {
    if (open) {
      if (tag) {
        setFormState({
          name: tag.name,
          slug: tag.slug,
        })
        setIsSlugEdited(true)
      } else {
        setFormState(defaultState)
        setIsSlugEdited(false)
      }
    }
  }, [open, tag])

  const normalisedExistingSlugs = useMemo(() => existingSlugs.map((slug) => slug.toLowerCase()), [existingSlugs])

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false)
    }
  }

  const handleNameChange = (value: string) => {
    setFormState((state) => ({
      ...state,
      name: value,
      slug: isSlugEdited ? state.slug : convertToSlug(value),
    }))
  }

  const handleSlugChange = (value: string) => {
    setIsSlugEdited(true)
    setFormState((state) => ({ ...state, slug: convertToSlug(value) }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = formState.name.trim()
    const trimmedSlug = formState.slug.trim()
    const normalisedSlug = trimmedSlug.toLowerCase()
    const currentSlug = tag?.slug ? tag.slug.toLowerCase() : undefined

    if (!trimmedName) {
      toast({
        title: "Name is required",
        description: "Please provide a name for the tag.",
        variant: "destructive",
      })
      return
    }

    if (!trimmedSlug) {
      toast({
        title: "Slug is required",
        description: "Slugs help generate shareable URLs and must be unique.",
        variant: "destructive",
      })
      return
    }

    const isSlugDuplicate = normalisedExistingSlugs.includes(normalisedSlug) && currentSlug !== normalisedSlug

    if (isSlugDuplicate) {
      toast({
        title: "Slug already exists",
        description: "Choose a different slug to avoid conflicts with other tags.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const payloadBase = {
        name: trimmedName,
        slug: trimmedSlug,
      }

      if (tag) {
        const payload: UpdateTagDto = payloadBase
        const updatedTag = await api.tags.update(tag.id, payload)
        toast({
          title: "Tag updated",
          description: `\"${updatedTag.name}\" has been updated successfully.`,
        })
        onSuccess?.(updatedTag)
      } else {
        const payload: CreateTagDto = payloadBase
        const createdTag = await api.tags.create(payload)
        toast({
          title: "Tag created",
          description: `\"${createdTag.name}\" is now available.`,
        })
        onSuccess?.(createdTag)
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to submit tag form", error)
      toast({
        title: tag ? "Unable to update tag" : "Unable to create tag",
        description: "Something went wrong while saving the tag. Please try again.",
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
          <DialogTitle>{tag ? "Edit tag" : "Create tag"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="tag-name">
              Tag name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tag-name"
              value={formState.name}
              onChange={(event) => handleNameChange(event.target.value)}
              placeholder="e.g. Certification"
              required
              autoFocus
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tag-slug">
              URL slug <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tag-slug"
              value={formState.slug}
              onChange={(event) => handleSlugChange(event.target.value)}
              placeholder="e.g. certification"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Slugs are used in URLs and API filters. Keep them lowercase and use hyphens between words.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-3">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : tag ? "Save changes" : "Create tag"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

