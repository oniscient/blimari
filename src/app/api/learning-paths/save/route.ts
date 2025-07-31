import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/src/lib/database/neon"
import { LearningPath, OrganizedTrail, TrailSection } from "@/src/types"
import { stackServerApp } from "@/src/stack"

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, topic, difficulty, description, organizedTrail, content } = await request.json()

    if (!title || !topic || !difficulty || !description || !organizedTrail || !content) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const newLearningPath = await db.createLearningPath({
      userId: user.id,
      title,
      topic,
      difficulty,
      description,
      totalContent: content.length,
      completedContent: 0,
      progress: 0,
      status: "active",
      organizedTrail: organizedTrail,
      content: content,
    })

    return NextResponse.json({
      success: true,
      learningPath: newLearningPath,
    })
  } catch (error) {
    console.error("Error saving learning path:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}