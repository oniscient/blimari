import { GoogleGenerativeAI, GenerativeModel, Part } from "@google/generative-ai"
import { Schema, SchemaType } from "@google/generative-ai/server"
import { ContentItem, OrganizedTrail, QlooProfile } from "@/src/types"

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
    model: GeminiModel = "lite",
    qlooProfile?: QlooProfile, // Added optional qlooProfile
  ) {
    let qlooContext = ""
    if (qlooProfile && qlooProfile.preferences) {
      qlooContext = `
      Com base no perfil cultural Qloo do usuário, que inclui preferências como: ${JSON.stringify(qlooProfile.preferences)},
      e estilo de comunicação: ${JSON.stringify(qlooProfile.communicationStyle)}.
      `
    }

    const prompt = `
    Com base nas seguintes respostas sobre aprendizado de "${topic}" e nas fontes de conteúdo disponíveis (youtube, github, web, books):
    
    Resposta 1: ${answers[0] || "Não respondida"}
    Resposta 2: ${answers[1] || "Não respondida"}
    Resposta 3: ${answers[2] || "Não respondida"}
    
    ${qlooContext}
    
    Gere um insight personalizado sobre o perfil de aprendizado do usuário e recomende as 2 ou 3 fontes de pesquisa mais adequadas para ele aprender sobre "${topic}".
    O Insight deve ser muito curto e directo e útil ao usuário. Não diga o óbvio.
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

  async filterContent(
    contentList: { id: string; title: string; description: string }[],
    topic: string,
    answers: string[],
    model: GeminiModel = "pro",
    qlooProfile?: QlooProfile, // Added optional qlooProfile
  ): Promise<string[]> {
    console.log("GEMINI SERVICE filterContent: Received data:", {
      contentListCount: contentList.length,
      topic,
      answers,
    })

    if (!contentList || contentList.length === 0) {
      console.warn("GEMINI SERVICE filterContent: Received empty or no content list. Returning empty array.")
      return []
    }

    let qlooContext = ""
    if (qlooProfile && qlooProfile.preferences) {
      qlooContext = `
      Considere também o perfil cultural Qloo do usuário, que inclui preferências como: ${JSON.stringify(qlooProfile.preferences)},
      e estilo de comunicação: ${JSON.stringify(qlooProfile.communicationStyle)}.
      `
    }

    const contentDescriptions = contentList
      .map((item) => `- ID: ${item.id}\n  Title: ${item.title}\n  Description: ${item.description}`)
      .join("\n\n")

    const prompt = `
    Você é um agente de IA especializado em filtrar conteúdo educacional.
    Com base no tópico "${topic}" e nas seguintes respostas do usuário sobre suas preferências de aprendizado:
    ${answers.map((ans, i) => `Resposta ${i + 1}: ${ans}`).join("\n")}
    
    ${qlooContext}

    Analise a seguinte lista de conteúdos e identifique quais são relevantes e de qualidade para o usuário.
    Considere a relevância para o tópico, a descrição e a adequação ao perfil de aprendizado inferido pelas respostas.
    Deve ter pelo menos um conteúdo de cada fonte disponibilizada (ex: Video, Article, Tutorial, etc)

    Lista de Conteúdos:
    ${contentDescriptions}

    Retorne um JSON contendo apenas uma lista dos IDs dos conteúdos que você aprova.
    Exemplo:
    {
      "approvedContentIds": ["id1", "id3", "id5"]
    }
    `

    try {
      const result = await this.models[model].generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              approvedContentIds: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
              },
            },
            required: ["approvedContentIds"],
          },
        },
      })
      const response = await result.response
      const text = response.text()
      const parsedResponse = JSON.parse(text)
      return parsedResponse.approvedContentIds || []
    } catch (error) {
      console.error("Error filtering content:", error)
      throw error
    }
  }

  async organizeTrail(
    contentList: ContentItem[],
    topic: string,
    answers: string[],
    model: GeminiModel = "flash",
    qlooProfile?: QlooProfile, // Added optional qlooProfile
  ): Promise<OrganizedTrail> {
    console.log("GEMINI SERVICE organizeTrail: Received data:", {
      contentListCount: contentList.length,
      topic,
      answers,
    })

    if (!contentList || contentList.length === 0) {
      console.warn("GEMINI SERVICE organizeTrail: Received empty or no content list. Returning empty trail.")
      return { organizedTrail: [] }
    }

    let qlooContext = ""
    if (qlooProfile && qlooProfile.preferences) {
      qlooContext = `
      Considere também o perfil cultural Qloo do usuário, que inclui preferências como: ${JSON.stringify(qlooProfile.preferences)},
      e estilo de comunicação: ${JSON.stringify(qlooProfile.communicationStyle)}.
      `
    }

    const contentDescriptions = contentList
      .map((item) => `- ID: ${item.id}\n  Title: ${item.title}\n  Description: ${item.description || "No description provided."}`)
      .join("\n\n")

    const prompt = `
    Você é um agente de IA especializado em organizar trilhas de aprendizado.
    Com base no tópico "${topic}", nas seguintes respostas do usuário sobre suas preferências de aprendizado:
    ${answers.map((ans, i) => `Resposta ${i + 1}: ${ans}`).join("\n")}
    
    ${qlooContext}

    E na seguinte lista de conteúdos filtrados:
    ${contentDescriptions}

    Organize este conteúdo em uma trilha de aprendizado lógica e sequencial.
    Divida a trilha em seções (ex: "Introdução", "Conceitos Fundamentais", "Tópicos Avançados", "Projetos Práticos") e liste os IDs dos itens de conteúdo dentro de cada seção, juntamente com uma nova descrição concisa e otimizada para a trilha.
    A ordem dos itens dentro de cada seção e a ordem das seções devem ser otimizadas para um aprendizado progressivo e eficaz.
    Retorne um JSON com a estrutura da trilha organizada.

    Exemplo de formato de saída:
    {
      "organizedTrail": [
        {
          "sectionTitle": "Introdução",
          "items": [
            { "id": "id_do_item1", "organizedDescription": "Nova descrição para o item 1" },
            { "id": "id_do_item2", "organizedDescription": "Nova descrição para o item 2" }
          ]
        },
        {
          "sectionTitle": "Conceitos Fundamentais",
          "items": [
            { "id": "id_do_item3", "organizedDescription": "Nova descrição para o item 3" }
          ]
        }
      ]
    }
    `

    try {
      const result = await this.models[model].generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              organizedTrail: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    sectionTitle: { type: SchemaType.STRING },
                    items: {
                      type: SchemaType.ARRAY,
                      items: {
                        type: SchemaType.OBJECT,
                        properties: {
                          id: { type: SchemaType.STRING },
                          organizedDescription: { type: SchemaType.STRING }, // Nova propriedade
                        },
                        required: ["id", "organizedDescription"], // Requerido
                      },
                    },
                  },
                  required: ["sectionTitle", "items"],
                },
              },
            },
            required: ["organizedTrail"],
          },
        },
      })
      const response = await result.response
      const text = response.text()
      const parsedResponse = JSON.parse(text)
      return parsedResponse as OrganizedTrail
    } catch (error) {
      console.error("Error organizing trail:", error)
      throw error
    }
  }
}

export const geminiService = new GeminiService()
