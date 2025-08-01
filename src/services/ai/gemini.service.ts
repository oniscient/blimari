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
    language: string,
    model: GeminiModel = "flash",
  ): Promise<any[]> {
    const prompt = `
    Generate exactly 3 personalized questions for someone who wants to learn about "${topic}".
    The questions should be in ${language}.
    
    The questions should help to understand:
    1. Current experience level
    2. Preferred learning style
    3. Specific goal with the topic
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
    language: string,
    model: GeminiModel = "lite",
    qlooProfile?: QlooProfile, // Added optional qlooProfile
  ) {
    let qlooContext = ""
    if (qlooProfile && qlooProfile.preferences) {
      qlooContext = `
      Based on the user's Qloo cultural profile, which includes preferences like: ${JSON.stringify(qlooProfile.preferences)},
      and communication style: ${JSON.stringify(qlooProfile.communicationStyle)}.
      `
    }

    const prompt = `
    Based on the following answers about learning "${topic}" and the available content sources (youtube, github, web, books):
    
    Answer 1: ${answers[0] || "Not answered"}
    Answer 2: ${answers[1] || "Not answered"}
    Answer 3: ${answers[2] || "Not answered"}
    
    ${qlooContext}
    
    Generate a personalized insight about the user's learning profile and recommend the 2 or 3 most suitable research sources for them to learn about "${topic}".
    The insight should be very short, direct, and useful to the user. Do not state the obvious.
    The response should be in ${language}.
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
    language: string,
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
      Also consider the user's Qloo cultural profile, which includes preferences like: ${JSON.stringify(qlooProfile.preferences)},
      and communication style: ${JSON.stringify(qlooProfile.communicationStyle)}.
      `
    }

    const contentDescriptions = contentList
      .map((item) => `- ID: ${item.id}\n  Title: ${item.title}\n  Description: ${item.description}`)
      .join("\n\n")

    const prompt = `
    You are an AI agent specialized in filtering educational content.
    Based on the topic "${topic}" and the following user answers about their learning preferences:
    ${answers.map((ans, i) => `Answer ${i + 1}: ${ans}`).join("\n")}
    
    ${qlooContext}

    Analyze the following list of content and identify which are relevant and of high quality for the user.
    Consider the relevance to the topic, the description, and the suitability for the learning profile inferred from the answers.
    There must be at least one piece of content from each available source (e.g., Video, Article, Tutorial, etc.).
    The response should be in ${language}.

    Content List:
    ${contentDescriptions}

    Return a JSON object containing only a list of the IDs of the content you approve.
    Example:
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
    language: string,
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
      Also consider the user's Qloo cultural profile, which includes preferences like: ${JSON.stringify(qlooProfile.preferences)},
      and communication style: ${JSON.stringify(qlooProfile.communicationStyle)}.
      `
    }

    const contentDescriptions = contentList
      .map((item) => `- ID: ${item.id}\n  Title: ${item.title}\n  Description: ${item.description || "No description provided."}`)
      .join("\n\n")

    const prompt = `
    You are an AI agent specialized in organizing learning paths.
    Based on the topic "${topic}", the following user answers about their learning preferences:
    ${answers.map((ans, i) => `Answer ${i + 1}: ${ans}`).join("\n")}
    
    ${qlooContext}

    And the following list of filtered content:
    ${contentDescriptions}

    Organize this content into a logical and sequential learning path.
    Divide the path into sections (e.g., "Introduction", "Fundamental Concepts", "Advanced Topics", "Practical Projects") and list the content item IDs within each section, along with a new concise and optimized description for the path.
    The order of items within each section and the order of the sections should be optimized for progressive and effective learning.
    The response should be in ${language}.
    Return a JSON with the organized path structure.

    Example of output format:
    {
      "organizedTrail": [
        {
          "sectionTitle": "Introduction",
          "items": [
            { "id": "item_id_1", "organizedDescription": "New description for item 1" },
            { "id": "item_id_2", "organizedDescription": "New description for item 2" }
          ]
        },
        {
          "sectionTitle": "Fundamental Concepts",
          "items": [
            { "id": "item_id_3", "organizedDescription": "New description for item 3" }
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
