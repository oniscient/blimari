import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { z } from "zod"

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set")
}

const model = google("gemini-1.5-pro")

export class GeminiService {
  static async generateQuestions(topic: string, difficulty: string, count = 3) {
    try {
      const { object } = await generateObject({
        model,
        schema: z.object({
          questions: z.array(
            z.object({
              question: z.string(),
              type: z.enum(["multiple_choice", "open_ended", "preference"]),
              options: z.array(z.string()).optional(),
              context: z.string(),
            }),
          ),
        }),
        prompt: `Generate ${count} personalization questions for someone wanting to learn "${topic}" at ${difficulty} level. 
        Questions should help understand their learning style, background, and preferences.
        Make questions engaging and relevant to the topic.`,
      })

      return {
        success: true,
        data: object.questions,
      }
    } catch (error) {
      console.error("Error generating questions:", error)
      return {
        success: false,
        error: "Failed to generate questions",
      }
    }
  }

  static async generateLearningPath(topic: string, userAnswers: any[], culturalContext: any) {
    try {
      const { object } = await generateObject({
        model,
        schema: z.object({
          title: z.string(),
          description: z.string(),
          estimatedHours: z.number(),
          difficulty: z.enum(["beginner", "intermediate", "advanced"]),
          outline: z.array(
            z.object({
              title: z.string(),
              description: z.string(),
              contentTypes: z.array(z.string()),
              estimatedTime: z.number(),
            }),
          ),
        }),
        prompt: `Create a comprehensive learning path for "${topic}" based on these user preferences:
        ${JSON.stringify(userAnswers)}
        
        Cultural context: ${JSON.stringify(culturalContext)}
        
        Structure the path with clear progression and varied content types.`,
      })

      return {
        success: true,
        data: object,
      }
    } catch (error) {
      console.error("Error generating learning path:", error)
      return {
        success: false,
        error: "Failed to generate learning path",
      }
    }
  }

  static async generateQuiz(pathContent: any[], culturalProfile: any) {
    try {
      const { object } = await generateObject({
        model,
        schema: z.object({
          questions: z.array(
            z.object({
              question: z.string(),
              options: z.array(z.string()),
              correctAnswer: z.number(),
              explanation: z.string(),
              culturalContext: z.string().optional(),
            }),
          ),
        }),
        prompt: `Generate a quiz based on this learning content:
        ${JSON.stringify(pathContent)}
        
        Adapt questions for this cultural profile: ${JSON.stringify(culturalProfile)}
        
        Create 5-10 questions that test understanding and practical application.`,
      })

      return {
        success: true,
        data: object.questions,
      }
    } catch (error) {
      console.error("Error generating quiz:", error)
      return {
        success: false,
        error: "Failed to generate quiz",
      }
    }
  }
}
