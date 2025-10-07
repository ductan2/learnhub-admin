"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LessonSectionsEditor } from "./lesson-sections-editor"
import type { Lesson, LessonSection } from "@/types/lesson"
import { Eye, Loader2, Save } from "lucide-react"
import { api } from "@/lib/api/exports"
import { useToast } from "@/hooks/use-toast"

interface LessonEditorDialogProps {
  open: boolean
  onClose: () => void
  lesson: Lesson | null
  onSave: (sections: LessonSection[]) => void
}

export function LessonEditorDialog({ open, onClose, lesson, onSave }: LessonEditorDialogProps) {
  const [sections, setSections] = useState<LessonSection[]>([])
  const [initialSections, setInitialSections] = useState<LessonSection[]>([])
  const [activeTab, setActiveTab] = useState("edit")
  const [isLoadingSections, setIsLoadingSections] = useState(false)
  const [isSavingSections, setIsSavingSections] = useState(false)
  const { toast } = useToast()

  const loadSections = useCallback(
    async (lessonId: string) => {
      setIsLoadingSections(true)
      try {
        const data = await api.lessonSections.getByLessonId(lessonId)
        setSections(data)
        setInitialSections(data)
      } catch (error) {
        console.error("Failed to load lesson sections", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load lesson sections",
          variant: "destructive",
        })
        setSections([])
        setInitialSections([])
      } finally {
        setIsLoadingSections(false)
      }
    },
    [toast],
  )

  useEffect(() => {
    if (!open) {
      setSections([])
      setInitialSections([])
      setActiveTab("edit")
      return
    }

    if (lesson) {
      loadSections(lesson.id)
    }
  }, [lesson, loadSections, open])

  const handleSave = async () => {
    if (!lesson) return

    setIsSavingSections(true)
    try {
      const updated = await api.lessonSections.sync(lesson.id, sections, initialSections)
      setSections(updated)
      setInitialSections(updated)
      onSave(updated)
      onClose()
    } catch (error) {
      console.error("Failed to save lesson sections", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save lesson sections",
        variant: "destructive",
      })
    } finally {
      setIsSavingSections(false)
    }
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
              <Button onClick={handleSave} disabled={isSavingSections || isLoadingSections}>
                {isSavingSections ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSavingSections ? "Saving..." : "Save Changes"}
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
            <LessonSectionsEditor
              lessonId={lesson.id}
              sections={sections}
              onSectionsChange={setSections}
              isLoading={isLoadingSections}
              disabled={isSavingSections}
            />
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
