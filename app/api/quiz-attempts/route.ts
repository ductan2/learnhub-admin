import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get("userId")

  // Mock quiz attempt data
  const mockAttempts = [
    {
      id: "1",
      user_id: userId,
      quiz_id: "quiz-1",
      started_at: "2024-12-10T10:00:00Z",
      completed_at: "2024-12-10T10:25:00Z",
      score: 85,
      max_score: 100,
    },
    {
      id: "2",
      user_id: userId,
      quiz_id: "quiz-2",
      started_at: "2024-12-25T14:00:00Z",
      completed_at: "2024-12-25T14:30:00Z",
      score: 92,
      max_score: 100,
    },
    {
      id: "3",
      user_id: userId,
      quiz_id: "quiz-3",
      started_at: "2025-01-08T09:00:00Z",
      completed_at: null,
      score: 0,
      max_score: 100,
    },
  ]

  return NextResponse.json(mockAttempts)
}
