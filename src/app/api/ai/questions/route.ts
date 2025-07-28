import { type NextRequest, NextResponse } from "next/server"
import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { z } from "zod"
import type { APIResponse } from "@/types"

const model = google("gemini-1.5-pro")

// Schema para validar a resposta do Gemini
const QuestionsSchema = z.object({
  topic: z.string(),
  questions: z.array(
    z.object({
      id: z.number(),
      question: z.string(),
      description: z.string(),
      options: z.array(
        z.object({
          id: z.string(),
          text: z.string(),
          description: z.string(),
        }),
      ),
    }),
  ),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic } = body

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
Você é um especialista em educação e personalização de aprendizado. Um usuário quer aprender sobre "${topic}".

Gere EXATAMENTE 3 perguntas para personalizar a experiência de aprendizado dele. Cada pergunta deve ter EXATAMENTE 3 opções de resposta.

As perguntas devem descobrir:
1. Nível de experiência/conhecimento prévio
2. Estilo de aprendizado preferido  
3. Objetivo/aplicação prática

REGRAS IMPORTANTES:
- Seja específico para o tópico "${topic}"
- Perguntas claras e diretas
- Opções distintas e relevantes
- Linguagem em português brasileiro
- Foque na personalização da trilha de aprendizado

Formato JSON obrigatório:
{
  "topic": "${topic}",
  "questions": [
    {
      "id": 1,
      "question": "Pergunta sobre nível de experiência",
      "description": "Explicação breve do porquê desta pergunta",
      "options": [
        {
          "id": "beginner",
          "text": "Opção para iniciantes",
          "description": "Descrição da opção"
        },
        {
          "id": "intermediate", 
          "text": "Opção para intermediários",
          "description": "Descrição da opção"
        },
        {
          "id": "advanced",
          "text": "Opção para avançados", 
          "description": "Descrição da opção"
        }
      ]
    },
    {
      "id": 2,
      "question": "Pergunta sobre estilo de aprendizado",
      "description": "Explicação breve",
      "options": [
        {
          "id": "visual",
          "text": "Opção visual/prática",
          "description": "Descrição"
        },
        {
          "id": "theoretical",
          "text": "Opção teórica/conceitual", 
          "description": "Descrição"
        },
        {
          "id": "hands_on",
          "text": "Opção prática/projetos",
          "description": "Descrição"
        }
      ]
    },
    {
      "id": 3,
      "question": "Pergunta sobre objetivo/aplicação",
      "description": "Explicação breve",
      "options": [
        {
          "id": "career",
          "text": "Opção focada em carreira",
          "description": "Descrição"
        },
        {
          "id": "personal",
          "text": "Opção para interesse pessoal",
          "description": "Descrição"
        },
        {
          "id": "academic",
          "text": "Opção acadêmica/certificação",
          "description": "Descrição"
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
