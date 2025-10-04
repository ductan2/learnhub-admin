import { NextResponse } from "next/server"

export async function GET() {
  // Mock analytics data
  const stats = {
    totalUsers: 1247,
    activeUsersToday: 342,
    totalLessons: 156,
    publishedLessons: 142,
    totalEnrollments: 4521,
    avgCompletionRate: 68,
    totalMediaStorage: 2847362048, // ~2.65 GB
    avgQuizScore: 76,
  }

  return NextResponse.json(stats)
}
