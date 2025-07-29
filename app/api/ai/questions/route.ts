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

Crie EXATAMENTE 3 perguntas estratégicas para personalizar completamente a trilha de aprendizado sobre "${topic}".

ESTRUTURA OBRIGATÓRIA:

**PERGUNTA 1 - EXPERIÊNCIA** (category: "experience")
- Descobrir o nível atual de conhecimento sobre "${topic}"
- 3 opções: Iniciante, Intermediário, Avançado
- Cada opção deve ter weight de 1 a 5 (1=iniciante, 5=expert)

**PERGUNTA 2 - ESTILO DE APRENDIZADO** (category: "learning_style")
- Identificar como a pessoa aprende melhor
- 3 opções: Visual/Prático, Teórico/Conceitual, Hands-on/Projetos
- Weight baseado na intensidade do estilo (1-5)

**PERGUNTA 3 - OBJETIVO** (category: "goal")
- Entender a motivação e aplicação do conhecimento
- 3 opções: Carreira/Profissional, Interesse Pessoal, Acadêmico/Certificação
- Weight baseado na urgência/intensidade do objetivo (1-5)

REGRAS CRÍTICAS:
1. Seja ESPECÍFICO para "${topic}" - não genérico
2. Perguntas diretas e envolventes
3. Opções bem distintas e relevantes
4. Descrições claras e motivadoras
5. Português brasileiro natural
6. Foque na PERSONALIZAÇÃO da trilha

EXEMPLO DE ESTRUTURA:
{
  "topic": "${topic}",
  "questions": [
    {
      "id": 1,
      "question": "Qual é sua experiência atual com ${topic}?",
      "description": "Isso nos ajuda a calibrar o nível de complexidade do conteúdo",
      "category": "experience",
      "options": [
        {
          "id": "beginner",
          "text": "Nunca trabalhei com isso",
          "description": "Vou começar do zero, preciso dos fundamentos",
          "weight": 1
        },
        {
          "id": "intermediate",
          "text": "Tenho alguma experiência",
          "description": "Já vi sobre o assunto, mas quero aprofundar",
          "weight": 3
        },
        {
          "id": "advanced",
          "text": "Já trabalho com isso",
          "description": "Quero me especializar e dominar técnicas avançadas",
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