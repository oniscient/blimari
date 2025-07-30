import { GoogleGenerativeAI, GenerativeModel, Part } from "@google/generative-ai"
import { Schema, SchemaType } from "@google/generative-ai/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

type GeminiModel = "flash" | "lite" | "pro"

export class GeminiService {
  private models: Record<GeminiModel, GenerativeModel> = {
    flash: genAI.getGenerativeModel({ model: "gemini-2.5-flash" }),
    lite: genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" }),
    pro: genAI.getGenerativeModel({ model: "gemini-2.5-pro" }),
  }

  async generateQuestions(
    topic: string,
    model: GeminiModel = "flash",
  ): Promise<any[]> {
    const prompt = `
    Gere exatamente 3 perguntas personalizadas para alguém que quer aprender sobre "${topic}".
    
    As perguntas devem ajudar a entender:
    1. Nível de experiência atual
    2. Estilo de aprendizado preferido
    3. Objetivo específico com o tópico
    `

    try {
      const result = await this.models[model].generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                id: { type: SchemaType.NUMBER },
                question: { type: SchemaType.STRING },
                options: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                },
              },
              required: ["id", "question", "options"],
            },
          },
        },
      })
      const response = await result.response
      const text = response.text()

      return JSON.parse(text)
    } catch (error) {
      console.error("Error generating questions:", error)
      throw error
    }
  }

  async generateInsights(
    answers: string[],
    topic: string,
    model: GeminiModel = "flash",
  ) {
    const prompt = `
    Com base nas seguintes respostas sobre aprendizado de "${topic}" e nas fontes de conteúdo disponíveis (youtube, github, web, books):
    
    Resposta 1: ${answers[0] || "Não respondida"}
    Resposta 2: ${answers[1] || "Não respondida"}
    Resposta 3: ${answers[2] || "Não respondida"}
    
    Gere um insight personalizado sobre o perfil de aprendizado do usuário e recomende as 2 ou 3 fontes de pesquisa mais adequadas para ele aprender sobre "${topic}".
    O Insight deve ser curto e directo e útil ao usuário. Não diga o óbvio.
    `

    try {
      const result = await this.models[model].generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              insightText: { type: SchemaType.STRING },
              recommendedSources: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
              },
            },
            required: ["insightText", "recommendedSources"],
          },
        },
      })
      const response = await result.response
      const text = response.text()

      return JSON.parse(text)
    } catch (error) {
      console.error("Error generating insights:", error)
      throw error
    }
  }
}

export const geminiService = new GeminiService()
