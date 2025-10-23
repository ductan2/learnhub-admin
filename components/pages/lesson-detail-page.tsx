"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Eye, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LessonSectionsEditor } from "@/components/lessons/lesson-sections-editor"
import type { Lesson, LessonSection } from "@/types/lesson"
import { api } from "@/lib/api/exports"
import { useToast } from "@/hooks/use-toast"

interface LessonDetailPageProps {
  lessonId: string
  initialView?: "edit" | "preview"
}

export function LessonDetailPage({ lessonId, initialView = "edit" }: LessonDetailPageProps) {
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [sections, setSections] = useState<LessonSection[]>([])
  const [initialSections, setInitialSections] = useState<LessonSection[]>([])
  const [activeTab, setActiveTab] = useState<"edit" | "preview">(initialView)
  const [isLoadingLesson, setIsLoadingLesson] = useState(true)
  const [isLoadingSections, setIsLoadingSections] = useState(true)
  const [isSavingSections, setIsSavingSections] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    setActiveTab(initialView)
  }, [initialView])

  const loadLesson = useCallback(async () => {
    setIsLoadingLesson(true)
    try {
      const data = await api.lessons.getById(lessonId)
      setLesson(data)
    } catch (error) {
      console.error("Failed to load lesson", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load lesson",
        variant: "destructive",
      })
      setLesson(null)
    } finally {
      setIsLoadingLesson(false)
    }
  }, [lessonId, toast])

  const loadSections = useCallback(async () => {
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
  }, [lessonId, toast])

  useEffect(() => {
    loadLesson()
    loadSections()
  }, [loadLesson, loadSections])

  const handleSaveSections = async () => {
    if (!lesson) return

    setIsSavingSections(true)
    try {
      const updated = await api.lessonSections.sync(lesson.id, sections, initialSections)
      setSections(updated)
      setInitialSections(updated)
      toast({
        title: "Success",
        description: "Lesson sections saved successfully",
      })
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

  const pageTitle = useMemo(() => lesson?.title ?? "Lesson Sections", [lesson])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/lessons")}> 
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to lessons
          </Button>
          <div>
            <h1 className="text-2xl font-semibold leading-tight">{pageTitle}</h1>
            {lesson?.description && (
              <p className="text-sm text-muted-foreground mt-1 max-w-3xl">{lesson.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setActiveTab((prev) => (prev === "edit" ? "preview" : "edit"))}
          >
            <Eye className="h-4 w-4 mr-2" />
            {activeTab === "edit" ? "Preview" : "Edit"}
          </Button>
          <Button onClick={handleSaveSections} disabled={isSavingSections || isLoadingSections || !lesson}>
            {isSavingSections ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {isSavingSections ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {isLoadingLesson ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading lesson...
        </div>
      ) : !lesson ? (
        <div className="border border-dashed border-destructive/50 rounded-lg p-12 text-center text-muted-foreground">
          <p>Lesson not found.</p>
          <Button className="mt-4" variant="secondary" onClick={() => router.push("/lessons")}>
            Return to lessons list
          </Button>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "edit" | "preview")}>
          <TabsList className="grid grid-cols-2 w-full md:w-auto">
            <TabsTrigger value="edit">Edit Sections</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="mt-6">
            <LessonSectionsEditor
              lessonId={lesson.id}
              sections={sections}
              onSectionsChange={setSections}
              isLoading={isLoadingSections}
              disabled={isSavingSections}
            />
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            <div className="max-w-4xl space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">{lesson.title}</h2>
                {lesson.description && <p className="text-muted-foreground">{lesson.description}</p>}
              </div>

              {sections.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-lg">
                  <p>No sections to preview yet</p>
                </div>
              ) : (
                sections.map((section) => (
                  <div key={section.id} className="border border-border rounded-lg p-6 space-y-4">
                    {section.type === "text" && section.content && (
                      <div className="prose prose-sm max-w-none whitespace-pre-wrap">{section.content}</div>
                    )}
                    {section.type === "video" && section.content && section.content.trim().startsWith("<") && (
                      <div className="aspect-video w-full overflow-hidden rounded-lg border border-border" dangerouslySetInnerHTML={{ __html: section.content }} />
                    )}
                    {section.type === "video" && section.content && !section.content.trim().startsWith("<") && (
                      <video controls className="w-full max-h-[480px] rounded-lg">
                        <source src={section.content} />
                      </video>
                    )}
                    {section.type === "image" && section.content && (
                      <div className="w-full overflow-hidden rounded-lg">
                        <img src={section.content} alt={lesson.title} className="w-full h-auto" />
                      </div>
                    )}
                    {section.type === "quiz" && (
                      <div className="bg-muted rounded p-6 text-center">
                        <p className="text-muted-foreground">Quiz Component (ID: {section.quiz_id || "Not selected"})</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
