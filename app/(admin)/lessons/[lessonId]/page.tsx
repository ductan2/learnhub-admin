import { LessonDetailPage } from "@/components/pages/lesson-detail-page"

interface LessonDetailPageProps {
  params: {
    lessonId: string
  }
  searchParams?: {
    view?: string
  }
}

export default function LessonDetailRoute({ params, searchParams }: LessonDetailPageProps) {
  const initialView = searchParams?.view === "preview" ? "preview" : "edit"

  return <LessonDetailPage lessonId={params.lessonId} initialView={initialView} />
}
