"use client"

import { useEffect, useRef, useState, type ChangeEvent } from "react"
import {
  GripVertical,
  Trash2,
  ImageIcon,
  Video,
  FileText,
  HelpCircle,
  Upload,
  FolderOpen,
  X,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { LessonSection } from "@/types/lesson"
import type { MediaAsset } from "@/types/media"
import { MediaPickerDialog } from "@/components/media/media-picker-dialog"
import { api } from "@/lib/api/exports"
import { useToast } from "@/hooks/use-toast"

interface LessonSectionsEditorProps {
  lessonId: string
  sections: LessonSection[]
  onSectionsChange: (sections: LessonSection[]) => void
  isLoading?: boolean
  disabled?: boolean
}

export function LessonSectionsEditor({
  lessonId,
  sections,
  onSectionsChange,
  isLoading = false,
  disabled = false,
}: LessonSectionsEditorProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [mediaPicker, setMediaPicker] = useState<{
    open: boolean
    sectionId: string | null
    type: "image" | "video"
  }>({ open: false, sectionId: null, type: "image" })
  const [uploadingSectionId, setUploadingSectionId] = useState<string | null>(null)
  const [mediaNames, setMediaNames] = useState<Record<string, string>>({})
  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({})
  const { toast } = useToast()

  const isReadOnly = disabled || isLoading

  useEffect(() => {
    setMediaNames((prev) => {
      const next: Record<string, string> = {}
      sections.forEach((section) => {
        if (prev[section.id]) {
          next[section.id] = prev[section.id]
        } else if ((section.type === "image" || section.type === "video") && section.media_id) {
          next[section.id] = section.media_id
        }
      })
      return next
    })
  }, [sections])

  const addSection = (type: LessonSection["type"]) => {
    if (isReadOnly) return
    const newSection: LessonSection = {
      id: `temp-${Date.now()}`,
      lesson_id: lessonId,
      type,
      content: "",
      order: sections.length + 1,
    }
    onSectionsChange([...sections, newSection])
    setEditingSection(newSection.id)
  }

  const updateSection = (id: string, updates: Partial<LessonSection>) => {
    if (isReadOnly) return
    onSectionsChange(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  const deleteSection = (id: string) => {
    if (isReadOnly) return
    onSectionsChange(sections.filter((s) => s.id !== id).map((s, index) => ({ ...s, order: index + 1 })))
  }

  const moveSection = (id: string, direction: "up" | "down") => {
    if (isReadOnly) return
    const index = sections.findIndex((s) => s.id === id)
    if ((direction === "up" && index === 0) || (direction === "down" && index === sections.length - 1)) return

    const newSections = [...sections]
    const targetIndex = direction === "up" ? index - 1 : index + 1
      ;[newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]]

    onSectionsChange(newSections.map((s, i) => ({ ...s, order: i + 1 })))
  }

  const handleOpenFileDialog = (sectionId: string) => {
    if (isReadOnly) return
    fileInputsRef.current[sectionId]?.click()
  }

  const handleUploadForSection = async (section: LessonSection, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file || isReadOnly) {
      return
    }

    const isImageSection = section.type === "image"
    const isVideoSection = section.type === "video"

    if (isImageSection && !file.type.startsWith("image/")) {
      toast({
        title: "Unsupported file",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    if (isVideoSection && !file.type.startsWith("video/")) {
      toast({
        title: "Unsupported file",
        description: "Please select a video file",
        variant: "destructive",
      })
      return
    }

    setUploadingSectionId(section.id)

    try {
      const asset = await api.media.upload(file, isImageSection ? "IMAGE" : "VIDEO")
      updateSection(section.id, {
        media_id: asset.id,
        content: asset.downloadURL,
      })
      setMediaNames((prev) => ({ ...prev, [section.id]: asset.originalName }))
      toast({
        title: "Upload successful",
        description: `${asset.originalName} uploaded successfully`,
      })
    } catch (error) {
      console.error("Failed to upload media", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      })
    } finally {
      setUploadingSectionId(null)
    }
  }

  const openMediaLibrary = (sectionId: string, type: "image" | "video") => {
    if (isReadOnly) return
    setMediaPicker({ open: true, sectionId, type })
  }

  const handleSelectAsset = (asset: MediaAsset) => {
    if (!mediaPicker.sectionId) return
    const sectionId = mediaPicker.sectionId
    updateSection(sectionId, {
      media_id: asset.id,
      content: asset.downloadURL,
    })
    setMediaNames((prev) => ({ ...prev, [sectionId]: asset.originalName }))
    setMediaPicker({ open: false, sectionId: null, type: "image" })
  }

  const handleClearMedia = (sectionId: string) => {
    if (isReadOnly) return
    updateSection(sectionId, { media_id: undefined, content: undefined })
    setMediaNames((prev) => {
      const { [sectionId]: _, ...rest } = prev
      return rest
    })
  }

  const getMediaLabel = (section: LessonSection) => {
    const label = mediaNames[section.id]
    if (label) return label
    if (section.media_id) return section.media_id
    if (section.content) return section.content
    return "No media selected"
  }

  const getSectionIcon = (type: LessonSection["type"]) => {
    switch (type) {
      case "text":
        return FileText
      case "video":
        return Video
      case "image":
        return ImageIcon
      case "quiz":
        return HelpCircle
    }
  }

  const getSectionLabel = (type: LessonSection["type"]) => {
    switch (type) {
      case "text":
        return "Text Content"
      case "video":
        return "Video Embed"
      case "image":
        return "Image"
      case "quiz":
        return "Quiz"
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Lesson Sections</h3>
          <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => addSection("text")} disabled={isReadOnly}>
            <FileText className="h-4 w-4 mr-2" />
            Text
          </Button>
          <Button variant="outline" size="sm" onClick={() => addSection("video")} disabled={isReadOnly}>
            <Video className="h-4 w-4 mr-2" />
            Video
          </Button>
          <Button variant="outline" size="sm" onClick={() => addSection("image")} disabled={isReadOnly}>
            <ImageIcon className="h-4 w-4 mr-2" />
            Image
          </Button>
          <Button variant="outline" size="sm" onClick={() => addSection("quiz")} disabled={isReadOnly}>
            <HelpCircle className="h-4 w-4 mr-2" />
            Quiz
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card className="p-12 text-center text-muted-foreground">
          <p>Loading sections...</p>
        </Card>
      ) : sections.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <p>No sections yet. Add your first section to get started.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sections.map((section, index) => {
            const Icon = getSectionIcon(section.type)
            const isEditing = editingSection === section.id

            return (
              <Card key={section.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-1 pt-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 cursor-move"
                      onClick={() => moveSection(section.id, "up")}
                      disabled={index === 0 || isReadOnly}
                    >
                      <GripVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <span className="font-medium">{getSectionLabel(section.type)}</span>
                        <span className="text-sm text-muted-foreground">#{section.order}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingSection(isEditing ? null : section.id)}
                          disabled={isReadOnly}
                        >
                          {isEditing ? "Done" : "Edit"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => deleteSection(section.id)}
                          disabled={isReadOnly}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="space-y-4">
                        {section.type === "text" && (
                          <div className="space-y-2">
                            <Label>Content</Label>
                            <Textarea
                              value={section.content || ""}
                              onChange={(e) => updateSection(section.id, { content: e.target.value })}
                              disabled={isReadOnly}
                              placeholder="Enter text content..."
                              rows={6}
                            />
                          </div>
                        )}

                        {section.type === "video" && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Video source</Label>
                              <div className="flex flex-wrap items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenFileDialog(section.id)}
                                  disabled={isReadOnly || uploadingSectionId === section.id}
                                >
                                  {uploadingSectionId === section.id ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Upload className="h-4 w-4 mr-2" />
                                  )}
                                  {uploadingSectionId === section.id ? "Uploading..." : "Upload video"}
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => openMediaLibrary(section.id, "video")}
                                  disabled={isReadOnly || uploadingSectionId === section.id}
                                >
                                  <FolderOpen className="h-4 w-4 mr-2" /> Choose from library
                                </Button>
                                {section.media_id && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleClearMedia(section.id)}
                                    disabled={isReadOnly || uploadingSectionId === section.id}
                                  >
                                    <X className="h-4 w-4 mr-2" /> Remove
                                  </Button>
                                )}
                                <input
                                  ref={(ref) => {
                                    if (!ref) {
                                      delete fileInputsRef.current[section.id]
                                    } else {
                                      fileInputsRef.current[section.id] = ref
                                    }
                                  }}
                                  type="file"
                                  accept="video/*"
                                  className="hidden"
                                  onChange={(event) => handleUploadForSection(section, event)}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">Selected: {getMediaLabel(section)}</p>
                            </div>

                            {section.content && !section.content.trim().startsWith("<") && (
                              <div className="rounded-lg border border-dashed border-border overflow-hidden bg-black max-w-2xl">
                                <video controls className="w-full max-h-[320px]">
                                  <source src={section.content} />
                                </video>
                              </div>
                            )}

                            {section.content && section.content.trim().startsWith("<") && (
                              <div
                                className="rounded-lg border border-dashed border-border overflow-hidden max-w-2xl"
                                dangerouslySetInnerHTML={{ __html: section.content }}
                              />
                            )}

                            <div className="space-y-2">
                              <Label>Video URL or Embed Code</Label>
                              <Textarea
                                value={section.content || ""}
                                onChange={(e) => updateSection(section.id, { content: e.target.value })}
                                disabled={isReadOnly}
                                placeholder="Enter video URL or embed code..."
                                rows={3}
                              />
                            </div>
                          </div>
                        )}

                        {section.type === "image" && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Image source</Label>
                              <div className="flex flex-wrap items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenFileDialog(section.id)}
                                  disabled={isReadOnly || uploadingSectionId === section.id}
                                >
                                  {uploadingSectionId === section.id ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Upload className="h-4 w-4 mr-2" />
                                  )}
                                  {uploadingSectionId === section.id ? "Uploading..." : "Upload image"}
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => openMediaLibrary(section.id, "image")}
                                  disabled={isReadOnly || uploadingSectionId === section.id}
                                >
                                  <FolderOpen className="h-4 w-4 mr-2" /> Choose from library
                                </Button>
                                {section.media_id && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleClearMedia(section.id)}
                                    disabled={isReadOnly || uploadingSectionId === section.id}
                                  >
                                    <X className="h-4 w-4 mr-2" /> Remove
                                  </Button>
                                )}
                                <input
                                  ref={(ref) => {
                                    if (!ref) {
                                      delete fileInputsRef.current[section.id]
                                    } else {
                                      fileInputsRef.current[section.id] = ref
                                    }
                                  }}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(event) => handleUploadForSection(section, event)}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">Selected: {getMediaLabel(section)}</p>
                            </div>

                            {section.content && (
                              <div className="rounded-lg border border-dashed border-border overflow-hidden max-w-md">
                                <img src={section.content} alt={getMediaLabel(section)} className="w-full h-auto object-cover" />
                              </div>
                            )}
                          </div>
                        )}

                        {section.type === "quiz" && (
                          <div className="space-y-2">
                            <Label>Quiz</Label>
                            <Select
                              value={section.quiz_id || ""}
                              onValueChange={(value) => updateSection(section.id, { quiz_id: value })}
                              disabled={isReadOnly}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select quiz" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Algebra Basics Quiz</SelectItem>
                                <SelectItem value="2">Python Syntax Test</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    )}

                    {!isEditing && (
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {section.type === "text" && (
                          <p className="line-clamp-3 whitespace-pre-wrap">{section.content || "No content yet"}</p>
                        )}

                        {section.type === "video" && section.content && !section.content.trim().startsWith("<") && (
                          <div className="rounded-lg border border-border overflow-hidden bg-black">
                            <video controls className="w-full max-h-[240px]">
                              <source src={section.content} />
                            </video>
                          </div>
                        )}

                        {section.type === "video" && section.content && section.content.trim().startsWith("<") && (
                          <div
                            className="rounded-lg border border-border overflow-hidden"
                            dangerouslySetInnerHTML={{ __html: section.content }}
                          />
                        )}

                        {section.type === "image" && section.content && (
                          <div className="rounded-lg border border-border overflow-hidden max-w-md">
                            <img src={section.content} alt={getMediaLabel(section)} className="w-full h-auto object-cover" />
                          </div>
                        )}

                        {section.type === "quiz" && (
                          <p>Quiz: {section.quiz_id || "Not selected"}</p>
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
      <MediaPickerDialog
        open={mediaPicker.open}
        onClose={() => setMediaPicker({ open: false, sectionId: null, type: "image" })}
        onSelect={handleSelectAsset}
        type={mediaPicker.type}
      />
    </>
  )
}
