import { NextResponse } from "next/server"
import { stackServerApp } from "@/src/stack"
import { db } from "@/src/lib/database/neon"

export async function POST(req: Request) {
  try {
    const user = await stackServerApp.getUser({ or: "throw" })

    const { learningPathId, contentId, isCompleted } = await req.json()

    if (!learningPathId || !contentId || isCompleted === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      )
    }

    // 1. Update the specific content item's completion status
    await db.updateContentItemCompletion(contentId, isCompleted)

    // 2. Recalculate the overall progress for the learning path
    const contentItems = await db.getContentItemsByPathId(learningPathId)
    const totalContent = contentItems.length
    const completedContent = contentItems.filter(item => item.isCompleted).length
    const progress = totalContent > 0 ? Math.round((completedContent / totalContent) * 100) : 0

    // 3. Update the learning path with the new progress
    await db.updateLearningPathProgress(
      learningPathId,
      progress,
      completedContent
    )

    // 4. Fetch the full, updated learning path to return to the client
    const fullLearningPath = await db.getLearningPathById(learningPathId);

    return NextResponse.json({
      success: true,
      message: "Progress updated successfully.",
      data: fullLearningPath,
    })
  } catch (error: any) {
    if (error.message === "Unauthenticated") {
      return NextResponse.json(
        { success: false, message: "User not authenticated." },
        { status: 401 }
      )
    }
    console.error("Error updating learning path progress:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update progress." },
      { status: 500 }
    )
  }
}