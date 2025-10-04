import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get("userId")

  // Mock enrollment data
  const mockEnrollments = [
    {
      id: "1",
      user_id: userId,
      lesson_id: "lesson-1",
      enrolled_at: "2024-12-01T10:00:00Z",
      progress_percentage: 100,
      completed_at: "2024-12-15T14:30:00Z",
    },
    {
      id: "2",
      user_id: userId,
      lesson_id: "lesson-2",
      enrolled_at: "2024-12-20T10:00:00Z",
      progress_percentage: 65,
      completed_at: null,
    },
    {
      id: "3",
      user_id: userId,
      lesson_id: "lesson-3",
      enrolled_at: "2025-01-05T10:00:00Z",
      progress_percentage: 30,
      completed_at: null,
    },
  ]

  return NextResponse.json(mockEnrollments)
}
