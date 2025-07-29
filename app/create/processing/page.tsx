"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Download,
  Filter,
  CheckCircle,
  Youtube,
  Github,
  Globe,
  FileText,
  BookOpen,
  Loader2,
  Clock,
  Users,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button" // Import Button component

interface ContentItem {
  id: string
  title: string
  description: string
  url: string
  source: string
  type: string
  duration?: string
  author?: string
  rating?: number
  thumbnail?: string
}

interface ProcessingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: "pending" | "processing" | "completed"
  progress: number
  content?: ContentItem[]
}

export default function ProcessingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [topic, setTopic] = useState<string>("")
  const [answers, setAnswers] = useState<string[]>([])
  const [sources, setSources] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [overallProgress, setOverallProgress] = useState(0)
  const [discoveredContent, setDiscoveredContent] = useState<ContentItem[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const hasStarted = useRef(false)

  const [steps, setSteps] = useState<ProcessingStep[]>([
    {
      id: "search",
      title: "Buscando Conteúdo",
      description: "Procurando os melhores recursos nas suas fontes selecionadas",
      icon: <Search className="w-6 h-6" />,
      status: "pending",
      progress: 0,
    },
    {
      id: "filter",
      title: "Filtrando Qualidade",
      description: "Analisando relevância e qualidade do conteúdo encontrado",
      icon: <Filter className="w-6 h-6" />,
      status: "pending",
      progress: 0,
    },
    {
      id: "organize",
      title: "Organizando Trilha",
      description: "Estruturando o conteúdo em uma sequência lógica de aprendizado",
      icon: <Download className="w-6 h-6" />,
      status: "pending",
      progress: 0,
    },
    {
      id: "finalize",
      title: "Finalizando",
      description: "Preparando sua trilha personalizada de aprendizado",
      icon: <CheckCircle className="w-6 h-6" />,
      status: "pending",
      progress: 0,
    },
  ])

  useEffect(() => {
    const topicParam = searchParams.get("topic")
    const answersParam = searchParams.get("answers")
    const sourcesParam = searchParams.get("sources")

    if (topicParam) setTopic(topicParam)
    if (answersParam) {
      try {
        const parsedAnswers = JSON.parse(answersParam)
        setAnswers(Array.isArray(parsedAnswers) ? parsedAnswers : Object.values(parsedAnswers))
      } catch (error) {
        console.error("Error parsing answers:", error)
      }
    }
    if (sourcesParam) {
      try {
        setSources(JSON.parse(sourcesParam))
      } catch (error) {
        console.error("Error parsing sources:", error)
      }
    }
  }, [searchParams])

  const processStep = useCallback(
    async (stepIndex: number) => {
      const step = steps[stepIndex]
      if (!step) return

      // Update step to processing
      setSteps((prev) =>
        prev.map((s, i) => (i === stepIndex ? { ...s, status: "processing" as const, progress: 0 } : s)),
      )

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200))
        setSteps((prev) => prev.map((s, i) => (i === stepIndex ? { ...s, progress } : s)))
        setOverallProgress((stepIndex * 100 + progress) / steps.length)
      }

      // If this is the search step, fetch some content
      if (step.id === "search") {
        try {
          const response = await fetch("/api/content/discover", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic, sources, answers }),
          })

          if (response.ok) {
            const data = await response.json()
            setDiscoveredContent(data.content || [])
          }
        } catch (error) {
          console.error("Error discovering content:", error)
          // Add some mock content for demo
          setDiscoveredContent([
            {
              id: "1",
              title: `Introdução ao ${topic}`,
              description: "Um guia completo para iniciantes",
              url: "#",
              source: "youtube",
              type: "video",
              duration: "15 min",
              author: "Tech Expert",
              rating: 4.8,
            },
            {
              id: "2",
              title: `${topic} - Projeto Prático`,
              description: "Repositório com exemplos práticos",
              url: "#",
              source: "github",
              type: "repository",
              author: "DevCommunity",
              rating: 4.5,
            },
          ])
        }
      }

      // Mark step as completed
      setSteps((prev) =>
        prev.map((s, i) => (i === stepIndex ? { ...s, status: "completed" as const, progress: 100 } : s)),
      )
    },
    [steps, topic, sources, answers],
  )

  const startProcessing = useCallback(async () => {
    if (hasStarted.current) return
    hasStarted.current = true

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i)
      await processStep(i)
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setIsComplete(true)

    // Removed automatic redirect
  }, [processStep, steps.length])

  useEffect(() => {
    if (topic && sources.length > 0 && !hasStarted.current) {
      startProcessing()
    }
  }, [topic, sources, startProcessing])

  const handleContinue = () => {
    router.push("/dashboard")
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "youtube":
        return <Youtube className="w-4 h-4 text-red-500" />
      case "github":
        return <Github className="w-4 h-4 text-gray-800" />
      case "web":
        return <Globe className="w-4 h-4 text-blue-500" />
      case "medium":
        return <FileText className="w-4 h-4 text-green-600" />
      case "books":
        return <BookOpen className="w-4 h-4 text-amber-600" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  if (!topic || sources.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#FF6B35]" />
          <p className="text-[#718096]">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-white">
      {/* Header */}
      <header className="px-6 py-6 border-b border-[#F1F5F9]/50 backdrop-blur-sm bg-white/80">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#2D3748]">Criando sua trilha de aprendizado</h1>
              <p className="text-[#718096] mt-1">
                Estamos organizando o melhor conteúdo sobre <strong>{topic}</strong>
              </p>
            </div>
            <div className="text-sm text-[#718096] bg-white px-3 py-1 rounded-full border border-[#E2E8F0]">
              Passo 3 de 3
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-[#F1F5F9] h-2">
        <motion.div
          className="bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] h-2"
          initial={{ width: 0 }}
          animate={{ width: `${overallProgress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Processing Steps */}
          <div>
            <h2 className="text-xl font-bold text-[#2D3748] mb-8">Progresso da Criação</h2>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                    step.status === "completed"
                      ? "border-green-200 bg-green-50"
                      : step.status === "processing"
                        ? "border-[#FF6B35] bg-orange-50"
                        : "border-[#E2E8F0] bg-white"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        step.status === "completed"
                          ? "bg-green-500 text-white"
                          : step.status === "processing"
                            ? "bg-[#FF6B35] text-white"
                            : "bg-[#F1F5F9] text-[#718096]"
                      }`}
                    >
                      {step.status === "processing" ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : step.status === "completed" ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[#2D3748] text-lg mb-1">{step.title}</h3>
                      <p className="text-[#718096] text-sm mb-3">{step.description}</p>
                      {step.status === "processing" && (
                        <div className="w-full bg-[#F1F5F9] rounded-full h-2">
                          <motion.div
                            className="bg-[#FF6B35] h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${step.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 text-center"
              >
                <div className="flex items-center justify-center gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="font-bold text-green-800 text-lg">Trilha Criada com Sucesso!</h3>
                </div>
                <p className="text-green-700 mb-4">
                  Sua trilha personalizada de <strong>{topic}</strong> está pronta.
                </p>
                <Button
                  onClick={handleContinue}
                  className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white px-6 py-3 rounded-full font-medium transition-colors duration-200"
                >
                  Continuar para o Dashboard
                </Button>
              </motion.div>
            )}
          </div>

          {/* Content Preview */}
          <div>
            <h2 className="text-xl font-bold text-[#2D3748] mb-8">Conteúdo Descoberto</h2>
            <div className="space-y-4">
              <AnimatePresence>
                {discoveredContent.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 border border-[#F1F5F9] shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#F8FAFC] rounded-xl flex items-center justify-center flex-shrink-0">
                        {getSourceIcon(item.source)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#2D3748] text-lg mb-2 line-clamp-2">{item.title}</h3>
                        <p className="text-[#718096] text-sm mb-3 line-clamp-2">{item.description}</p>
                        <div className="flex items-center gap-4 text-xs text-[#A0ADB8]">
                          {item.author && (
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{item.author}</span>
                            </div>
                          )}
                          {item.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{item.duration}</span>
                            </div>
                          )}
                          {item.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current text-yellow-400" />
                              <span>{item.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {discoveredContent.length === 0 && currentStep >= 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-[#A0ADB8]" />
                  </div>
                  <p className="text-[#718096]">Buscando conteúdo...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
