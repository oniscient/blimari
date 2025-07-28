import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database/neon"
import { nanoid } from "nanoid"
import type { LearningPath, APIResponse } from "@/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json<APIResponse>(
        {
          success: false,
          error: "User ID is required",
        },
        { status: 400 },
      )
    }

    const paths = await db.getLearningPathsByUserId(userId)

    return NextResponse.json<APIResponse<LearningPath[]>>({
      success: true,
      data: paths,
    })
  } catch (error) {
    console.error("Error fetching learning paths:", error)
    return NextResponse.json<APIResponse>(
      {
        success: false,
        error: "Failed to fetch learning paths",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, description, topic, difficulty, estimatedDuration, culturalProfileId } = body

    if (!userId || !title || !topic) {
      return NextResponse.json<APIResponse>(
        {
          success: false,
          error: "Missing required fields: userId, title, topic",
        },
        { status: 400 },
      )
    }

    const pathData: Partial<LearningPath> = {
      id: nanoid(),
      userId,
      title,
      description: description || null, // Use null for optional fields
      topic,
      difficulty: difficulty || "beginner",
      estimatedDuration: estimatedDuration || null,
      culturalProfileId: culturalProfileId || null,
      status: "draft",
      totalContent: 0,
      completedContent: 0,
      progress: 0,
    }

    const newPath = await db.createLearningPath(pathData)

    return NextResponse.json<APIResponse<LearningPath>>(
      {
        success: true,
        data: newPath,
        message: "Learning path created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating learning path:", error)
    return NextResponse.json<APIResponse>(
      {
        success: false,
        error: "Failed to create learning path",
      },
      { status: 500 },
    )
  }
}
