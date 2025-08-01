import { type NextRequest, NextResponse } from "next/server"
import { geminiService } from "@/src/services/ai/gemini.service"
import { ContentItem } from "@/src/types"

export async function POST(request: NextRequest) {
  try {
    const { contentList, topic, answers, language } = await request.json()

    if (!contentList || !Array.isArray(contentList) || !topic || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const organizedTrail = await geminiService.organizeTrail(contentList, topic, answers, language)

    console.log("API /api/content/organize: Gemini service returned organized trail:", organizedTrail)

    return NextResponse.json({
      success: true,
      organizedTrail,
    })
  } catch (error) {
    console.error("Error organizing content:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}