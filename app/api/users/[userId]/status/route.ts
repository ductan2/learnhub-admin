import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: { userId: string } }) {
  const { status } = await request.json()

  // In a real app, update the database
  console.log(`[v0] Updating user ${params.userId} status to ${status}`)

  return NextResponse.json({ success: true })
}
