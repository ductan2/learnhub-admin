"use client"

import { useState } from "react"
import { GripVertical, Trash2, ImageIcon, Video, FileText, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { LessonSection } from "@/types/lesson"

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

  const isReadOnly = disabled || isLoading

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
                      <div className="space-y-3">
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
                        )}

                        {section.type === "image" && (
                          <div className="space-y-2">
                            <Label>Image Media ID</Label>
                            <Select
                              value={section.media_id || ""}
                              onValueChange={(value) => updateSection(section.id, { media_id: value })}
                              disabled={isReadOnly}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select image from media library" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">math-intro.jpg</SelectItem>
                                <SelectItem value="2">python-basics.jpg</SelectItem>
                              </SelectContent>
                            </Select>
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

                    {!isEditing && section.content && (
                      <div className="text-sm text-muted-foreground line-clamp-2">{section.content}</div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
