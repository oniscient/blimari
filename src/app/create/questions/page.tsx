"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Question {
  id: number
  question: string
  description: string
  options: Array<{
    id: string
    text: string
    description: string
  }>
}

interface QuestionsData {
  topic: string
  questions: Question[]
}

export default function QuestionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const topic = searchParams.get("topic")

  const [questionsData, setQuestionsData] = useState<QuestionsData | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (topic) {
      generateQuestions()
    } else {
      router.push("/")
    }
  }, [topic, router])

  const generateQuestions = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/ai/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      })

      const data = await response.json()

      if (data.success) {
        setQuestionsData(data.data)
      } else {
        setError(data.error || "Erro ao gerar perguntas")
      }
    } catch (error) {
      console.error("Erro ao gerar perguntas:", error)
      setError("Falha na conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (optionId: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: optionId }))
  }

  const nextQuestion = () => {
    if (currentQuestion < (questionsData?.questions.length || 0) - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      // Todas as perguntas respondidas, prosseguir para próxima etapa
      const queryParams = new URLSearchParams({
        topic: topic || "",
        answers: JSON.stringify(answers),
      })
      router.push(`/create/sources?${queryParams}`)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const goBack = () => {
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-medium text-[#2D3748] mb-2">Gerando perguntas personalizadas</h2>
          <p className="text-[#718096]">Analisando "{topic}" para criar a melhor experiência...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-[#FFE5D9] rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-medium text-[#2D3748] mb-2">Ops! Algo deu errado</h2>
          <p className="text-[#718096] mb-6">{error}</p>
          <button
            onClick={generateQuestions}
            className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white px-6 py-3 rounded-full font-medium transition-colors duration-200"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  if (!questionsData) return null

  const question = questionsData.questions[currentQuestion]
  const currentAnswer = answers[currentQuestion]
  const progress = ((currentQuestion + 1) / questionsData.questions.length) * 100

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 py-4 border-b border-[#F1F5F9]">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-[#718096] hover:text-[#2D3748] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Voltar</span>
          </button>
          <div className="text-sm text-[#718096]">
            {currentQuestion + 1} de {questionsData.questions.length}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-[#F1F5F9] h-1">
        <motion.div
          className="bg-[#FF6B35] h-1"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Topic Badge */}
            <div className="inline-flex items-center gap-2 bg-[#FFE5D9] text-[#FF6B35] px-3 py-1 rounded-full text-sm font-medium mb-8">
              <span>{questionsData.topic}</span>
            </div>

            {/* Question */}
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-[#2D3748] mb-4 leading-tight">{question.question}</h1>
              <p className="text-[#718096] text-lg">{question.description}</p>
            </div>

            {/* Options */}
            <div className="space-y-4 mb-12">
              {question.options.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleAnswer(option.id)}
                  className={`w-full p-6 text-left rounded-2xl border-2 transition-all duration-200 ${
                    currentAnswer === option.id
                      ? "border-[#FF6B35] bg-[#FFE5D9] shadow-[0_4px_16px_rgba(255,107,53,0.2)]"
                      : "border-[#E2E8F0] hover:border-[#FF6B35] hover:bg-[#F7FAFC] shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-colors ${
                        currentAnswer === option.id ? "border-[#FF6B35] bg-[#FF6B35]" : "border-[#A0ADB8] bg-white"
                      }`}
                    >
                      {currentAnswer === option.id && <CheckCircle className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#2D3748] mb-2">{option.text}</h3>
                      <p className="text-[#718096] text-sm">{option.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 px-6 py-3 text-[#718096] hover:text-[#2D3748] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Anterior</span>
          </button>

          <button
            onClick={nextQuestion}
            disabled={!currentAnswer}
            className="flex items-center gap-2 bg-[#FF6B35] hover:bg-[#E55A2B] disabled:bg-[#A0ADB8] text-white px-8 py-3 rounded-full font-medium transition-colors duration-200 disabled:cursor-not-allowed"
          >
            <span>{currentQuestion === questionsData.questions.length - 1 ? "Finalizar" : "Próxima"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  )
}
