"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, ArrowRight, CheckCircle, Sparkles, Target, BookOpen, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion";
import Loader from "@/components/ui/loading";

interface Question {
  id: number
  question: string
  description: string
  category: "experience" | "learning_style" | "goal"
  options: Array<{
    id: string
    text: string
    description: string
    weight: number
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
  const [isTransitioning, setIsTransitioning] = useState(false)

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
    setIsTransitioning(true)
    
    setTimeout(() => {
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
      setIsTransitioning(false)
    }, 300)
  }

  const prevQuestion = () => {
    setIsTransitioning(true)
    
    setTimeout(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
      setIsTransitioning(false)
    }, 300)
  }

  const goBack = () => {
    router.push("/")
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "experience":
        return <Target className="w-5 h-5" />
      case "learning_style":
        return <BookOpen className="w-5 h-5" />
      case "goal":
        return <Zap className="w-5 h-5" />
      default:
        return <Sparkles className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "experience":
        return "from-blue-500 to-blue-600"
      case "learning_style":
        return "from-green-500 to-green-600"
      case "goal":
        return "from-purple-500 to-purple-600"
      default:
        return "from-orange-500 to-orange-600"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center">
            <Loader />
          </div>
          <h2 className="text-xl font-medium text-[#2D3748] mb-2 mt-8">Gerando perguntas personalizadas</h2>
          <p className="text-[#718096]">Analisando <strong>"{topic}"</strong> para criar a melhor experiência...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <span className="text-2xl text-red-500">⚠️</span>
          </motion.div>
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
  const isLastQuestion = currentQuestion === questionsData.questions.length - 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-white">
      {/* Header */}
      <header className="px-6 py-6 border-b border-[#F1F5F9]/50 backdrop-blur-sm bg-white/80">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-[#718096] hover:text-[#2D3748] transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Voltar</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-[#718096]">
              {currentQuestion + 1} de {questionsData.questions.length}
            </div>
            <div className="flex gap-1">
              {questionsData.questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index <= currentQuestion ? "bg-[#FF6B35]" : "bg-[#E2E8F0]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-[#F1F5F9] h-1.5">
        <motion.div
          className="bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] h-1.5 shadow-sm"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <AnimatePresence mode="wait">
          {!isTransitioning && (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {/* Category Badge */}
              <div className="flex items-center gap-4 mb-8">
                <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${getCategoryColor(question.category)} text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg`}>
                  {getCategoryIcon(question.category)}
                  <span className="capitalize">{question.category.replace('_', ' ')}</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-[#FFE5D9] text-[#FF6B35] px-3 py-1 rounded-full text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span>{questionsData.topic}</span>
                </div>
              </div>

              {/* Question */}
              <div className="mb-12">
                <h1 className="text-4xl font-bold text-[#2D3748] mb-6 leading-tight">
                  {question.question}
                </h1>
                <p className="text-[#718096] text-xl leading-relaxed">{question.description}</p>
              </div>

              {/* Options */}
              <div className="space-y-6 mb-16">
                {question.options.map((option, index) => (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.15, duration: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(option.id)}
                    className={`group w-full p-8 text-left rounded-3xl border-2 transition-all duration-300 ${
                      currentAnswer === option.id
                        ? "border-[#FF6B35] bg-gradient-to-r from-[#FFE5D9] to-[#FFF0E6] shadow-[0_8px_32px_rgba(255,107,53,0.25)] transform scale-[1.02]"
                        : "border-[#E2E8F0] hover:border-[#FF6B35] hover:bg-gradient-to-r hover:from-[#F7FAFC] hover:to-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                    }`}
                  >
                    <div className="flex items-start gap-6">
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mt-1 transition-all duration-300 ${
                          currentAnswer === option.id 
                            ? "border-[#FF6B35] bg-[#FF6B35] shadow-lg" 
                            : "border-[#A0ADB8] bg-white group-hover:border-[#FF6B35] group-hover:bg-[#FF6B35]/10"
                        }`}
                      >
                        {currentAnswer === option.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <CheckCircle className="w-5 h-5 text-white" />
                          </motion.div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-[#2D3748] mb-3 text-lg group-hover:text-[#FF6B35] transition-colors">
                          {option.text}
                        </h3>
                        <p className="text-[#718096] leading-relaxed">{option.description}</p>
                        
                        {/* Weight indicator */}
                        <div className="flex items-center gap-2 mt-4">
                          <span className="text-xs text-[#A0ADB8] font-medium">Intensidade:</span>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < option.weight ? "bg-[#FF6B35]" : "bg-[#E2E8F0]"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <motion.div 
          className="flex justify-between items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 px-6 py-3 text-[#718096] hover:text-[#2D3748] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Anterior</span>
          </button>

          <motion.button
            onClick={nextQuestion}
            disabled={!currentAnswer}
            whileHover={{ scale: currentAnswer ? 1.05 : 1 }}
            whileTap={{ scale: currentAnswer ? 0.95 : 1 }}
            className="flex items-center gap-3 bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] hover:from-[#E55A2B] hover:to-[#D14D1F] disabled:from-[#A0ADB8] disabled:to-[#A0ADB8] text-white px-10 py-4 rounded-full font-bold transition-all duration-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            <span className="text-lg">{isLastQuestion ? "Criar Trilha" : "Próxima"}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </main>
    </div>
  )
}
