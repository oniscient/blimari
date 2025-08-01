import { type NextRequest, NextResponse } from "next/server"
import { geminiService } from "@/src/services/ai/gemini.service"

export async function POST(request: NextRequest) {
  try {
    const { answers, topic, language } = await request.json()

    if (!answers || !topic) {
      return NextResponse.json({ success: false, error: "Missing answers or topic" }, { status: 400 })
    }

    const { insightText, recommendedSources } = await geminiService.generateInsights(answers, topic, language)

    return NextResponse.json({
      success: true,
      insights: {
        insightText,
        recommendedSources,
      },
    })
  } catch (error) {
    console.error("Erro ao gerar insights:", error)

    // Fallback insights in case of error
    return NextResponse.json({
      success: true,
      insights: {
        insightText: "Não foi possível gerar insights personalizados. Por favor, selecione as fontes manualmente.",
        recommendedSources: [],
      },
    })
  }
}
