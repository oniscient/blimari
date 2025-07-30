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
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContentCard } from "@/components/ContentCard"
import { ContentDetailsPopup } from "@/components/ContentDetailsPopup"
import { Stepper, Step } from "@/components/ui/Stepper"
import Loader from "@/components/ui/loading"

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
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)

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
        prev.map((s, i) => (i === stepIndex ? { ...s, status: "processing" as const } : s)),
      )

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200))
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
              url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              source: "youtube",
              type: "video",
              duration: "15 min",
              author: "Tech Expert",
              rating: 4.8,
              thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hq720.jpg",
            },
            {
              id: "2",
              title: `${topic} - Projeto Prático`,
              description: "Repositório com exemplos práticos de código para aprender.",
              url: "https://github.com/example/repo",
              source: "github",
              type: "repository",
              author: "DevCommunity",
              rating: 4.5,
            },
            {
              id: "3",
              title: `Artigo sobre ${topic}`,
              description: "Um artigo aprofundado sobre os conceitos avançados.",
              url: "https://medium.com/example/article",
              source: "medium",
              type: "article",
              author: "Knowledge Hub",
              rating: 4.2,
            },
            {
              id: "4",
              title: `Livro: Dominando ${topic}`,
              description: "Um livro abrangente para se tornar um especialista.",
              url: "https://example.com/book",
              source: "books",
              type: "book",
              author: "Master Minds",
              rating: 4.9,
            },
          ])
        }
      }

      // Mark step as completed
      setSteps((prev) =>
        prev.map((s, i) => (i === stepIndex ? { ...s, status: "completed" as const } : s)),
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

  const handleCardClick = (item: ContentItem) => {
    setSelectedContent(item)
    setIsPopupOpen(true)
  }

  const handleClosePopup = () => {
    setIsPopupOpen(false)
    setSelectedContent(null)
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
            <Stepper steps={steps} currentStep={currentStep} />

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {discoveredContent.map((item, index) => (
                  <ContentCard key={item.id} item={item} onClick={handleCardClick} />
                ))}
              </AnimatePresence>

              {discoveredContent.length === 0 && currentStep >= 0 && (
                <div className="text-center py-12 col-span-full flex flex-col items-center justify-center">
                  <Loader />
                  <p className="text-[#718096] mt-4">Buscando conteúdo...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <ContentDetailsPopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        item={selectedContent}
      />
    </div>
  )
}
