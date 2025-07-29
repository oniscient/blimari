import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" })

  async generateQuestions(topic: string): Promise<any[]> {
    const prompt = `
    Gere exatamente 3 perguntas personalizadas para alguém que quer aprender sobre "${topic}".
    
    As perguntas devem ajudar a entender:
    1. Nível de experiência atual
    2. Estilo de aprendizado preferido  
    3. Objetivo específico com o tópico
    
    Responda APENAS em formato JSON válido:
    [
      {
        "id": 1,
        "question": "pergunta aqui",
        "options": ["opção 1", "opção 2", "opção 3", "opção 4"]
      },
      {
        "id": 2, 
        "question": "pergunta aqui",
        "options": ["opção 1", "opção 2", "opção 3", "opção 4"]
      },
      {
        "id": 3,
        "question": "pergunta aqui", 
        "options": ["opção 1", "opção 2", "opção 3", "opção 4"]
      }
    ]
    `

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      return JSON.parse(text)
    } catch (error) {
      console.error("Error generating questions:", error)
      throw error
    }
  }

  async generateInsights(answers: string[], topic: string) {
    const prompt = `
    Com base nas seguintes respostas sobre aprendizado de "${topic}":
    
    Resposta 1: ${answers[0] || "Não respondida"}
    Resposta 2: ${answers[1] || "Não respondida"}  
    Resposta 3: ${answers[2] || "Não respondida"}
    
    Gere insights personalizados e sucintos (máximo 15 palavras cada) para:
    
    1. experience: Análise do nível de experiência do usuário
    2. style: Estilo de aprendizado preferido identificado
    3. goal: Objetivo principal da jornada de aprendizado
    
    Responda APENAS em formato JSON válido:
    {
      "experience": "texto aqui",
      "style": "texto aqui", 
      "goal": "texto aqui"
    }
    `

    try {
      const result = await this.model.generateContent(prompt)
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
