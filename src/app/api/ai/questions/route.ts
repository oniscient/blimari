import { type NextRequest, NextResponse } from "next/server"
import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { z } from "zod"
import type { APIResponse } from "@/src/types"

const model = google("gemini-2.5-flash-lite")

// Schema para validar a resposta do Gemini
const QuestionsSchema = z.object({
  topic: z.string(),
  questions: z.array(
    z.object({
      id: z.number(),
      question: z.string(),
      description: z.string(),
      category: z.enum(["experience", "learning_style", "goal"]),
      options: z.array(
        z.object({
          id: z.string(),
          text: z.string(),
          description: z.string(),
          weight: z.number().min(1).max(5),
        }),
      ),
    }),
  ),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, language } = body

    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return NextResponse.json<APIResponse>(
        {
          success: false,
          error: "Tópico é obrigatório",
        },
        { status: 400 },
      )
    }

    const { object } = await generateObject({
      model,
      schema: QuestionsSchema,
      prompt: `
      You are an expert in education and learning personalization. A user wants to learn about "${topic}".
      The user's language is ${language}.

      Create EXACTLY 3 strategic questions to completely personalize the learning path about "${topic}".

      REQUIRED STRUCTURE:

      **QUESTION 1 - EXPERIENCE** (category: "experience")
      - Discover the current level of knowledge about "${topic}"
      - 3 options: Beginner, Intermediate, Advanced
      - Each option must have a weight from 1 to 5 (1=beginner, 5=expert)

      **QUESTION 2 - LEARNING STYLE** (category: "learning_style")
      - Identify how the person learns best
      - 3 options: Visual/Practical, Theoretical/Conceptual, Hands-on/Projects
      - Weight based on the intensity of the style (1-5)

      **QUESTION 3 - GOAL** (category: "goal")
      - Understand the motivation and application of the knowledge
      - 3 options: Career/Professional, Personal Interest, Academic/Certification
      - Weight based on the urgency/intensity of the goal (1-5)

      CRITICAL RULES:
      1. Be SPECIFIC to "${topic}" - not generic
      2. Direct and engaging questions
      3. Very distinct and relevant options
      4. Clear and motivating descriptions
      5. The questions and options should be in ${language}
      6. Focus on PERSONALIZING the path

      EXAMPLE STRUCTURE:
      {
        "topic": "${topic}",
        "questions": [
          {
            "id": 1,
            "question": "What is your current experience with ${topic}?",
            "description": "This helps us calibrate the complexity of the content",
            "category": "experience",
            "options": [
              {
                "id": "beginner",
                "text": "I have never worked with this",
                "description": "I will start from scratch, I need the fundamentals",
                "weight": 1
              },
              {
                "id": "intermediate",
                "text": "I have some experience",
                "description": "I have seen the subject before, but I want to go deeper",
                "weight": 3
              },
              {
                "id": "advanced",
                "text": "I already work with this",
                "description": "I want to specialize and master advanced techniques",
                "weight": 5
              }
            ]
          }
        ]
      }
      `,
      temperature: 0.7,
    })

    return NextResponse.json<APIResponse>({
      success: true,
      data: object,
    })
  } catch (error) {
    console.error("Erro ao gerar perguntas:", error)
    return NextResponse.json<APIResponse>(
      {
        success: false,
        error: "Falha ao gerar perguntas personalizadas",
      },
      { status: 500 },
    )
  }
}
