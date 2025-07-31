import { type NextRequest, NextResponse } from "next/server"
import { geminiService } from "@/src/services/ai/gemini.service"

export async function POST(request: NextRequest) {
  try {
    const { contentList, topic, answers } = await request.json()
    console.log("API /api/content/filter: Received request with payload:", {
      contentList,
      topic,
      answers,
    })

    if (!contentList || !Array.isArray(contentList) || !topic || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const approvedContentIds = await geminiService.filterContent(contentList, topic, answers)

    console.log("API /api/content/filter: Gemini service returned approved IDs:", approvedContentIds)

    return NextResponse.json({
      success: true,
      approvedContentIds,
    })
  } catch (error) {
    console.error("Error filtering content:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}