import { type NextRequest, NextResponse } from "next/server"
import { geminiService } from "@/src/services/ai/gemini.service"

export async function POST(request: NextRequest) {
  try {
    const { answers, topic } = await request.json()

    if (!answers || !topic) {
      return NextResponse.json({ success: false, error: "Missing answers or topic" }, { status: 400 })
    }

    const insights = await geminiService.generateInsights(answers, topic)

    return NextResponse.json({
      success: true,
      insights,
    })
  } catch (error) {
    console.error("Erro ao gerar insights:", error)

    // Fallback insights in case of error
    return NextResponse.json({
      success: true,
      insights: {
        experience: "Perfil de aprendizado em análise",
        style: "Preferências sendo processadas",
        goal: "Objetivos sendo definidos",
      },
    })
  }
}
