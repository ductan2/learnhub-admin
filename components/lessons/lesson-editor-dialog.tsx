"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LessonSectionsEditor } from "./lesson-sections-editor"
import type { Lesson, LessonSection } from "@/types/lesson"
import { Eye, Save } from "lucide-react"

interface LessonEditorDialogProps {
  open: boolean
  onClose: () => void
  lesson: Lesson | null
  onSave: (sections: LessonSection[]) => void
}

export function LessonEditorDialog({ open, onClose, lesson, onSave }: LessonEditorDialogProps) {
  const [sections, setSections] = useState<LessonSection[]>([])
  const [activeTab, setActiveTab] = useState("edit")

  useEffect(() => {
    if (lesson) {
      // In real app, would load sections from API
      setSections([])
    }
  }, [lesson])

  const handleSave = () => {
    onSave(sections)
    onClose()
  }

  if (!lesson) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{lesson.title}</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setActiveTab(activeTab === "edit" ? "preview" : "edit")}>
                <Eye className="h-4 w-4 mr-2" />
                {activeTab === "edit" ? "Preview" : "Edit"}
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Edit Sections</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="flex-1 overflow-y-auto mt-4">
            <LessonSectionsEditor lessonId={lesson.id} sections={sections} onSectionsChange={setSections} />
          </TabsContent>

          <TabsContent value="preview" className="flex-1 overflow-y-auto mt-4">
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
                {lesson.description && <p className="text-muted-foreground">{lesson.description}</p>}
              </div>

              {sections.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No sections to preview yet</p>
                </div>
              ) : (
                sections.map((section) => (
                  <div key={section.id} className="border border-border rounded-lg p-6">
                    {section.type === "text" && <div className="prose prose-sm max-w-none">{section.content}</div>}
                    {section.type === "video" && (
                      <div className="aspect-video bg-muted rounded flex items-center justify-center">
                        <p className="text-muted-foreground">Video Player</p>
                      </div>
                    )}
                    {section.type === "image" && (
                      <div className="aspect-video bg-muted rounded flex items-center justify-center">
                        <p className="text-muted-foreground">Image Preview</p>
                      </div>
                    )}
                    {section.type === "quiz" && (
                      <div className="bg-muted rounded p-6 text-center">
                        <p className="text-muted-foreground">Quiz Component</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
