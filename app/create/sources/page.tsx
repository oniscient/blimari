"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  Youtube,
  Github,
  Globe,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Lightbulb,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface Source {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
}

interface Insight {
  insightText: string
  recommendedSources: string[]
}

const sources: Source[] = [
  {
    id: "youtube",
    name: "YouTube",
    description: "Vídeos tutoriais e cursos práticos",
    icon: <Youtube className="w-6 h-6" />,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200 hover:border-red-300",
  },
  {
    id: "github",
    name: "GitHub",
    description: "Repositórios e projetos open source",
    icon: <Github className="w-6 h-6" />,
    color: "text-gray-800",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200 hover:border-gray-300",
  },
  {
    id: "web",
    name: "Web Articles",
    description: "Artigos e blogs especializados",
    icon: <Globe className="w-6 h-6" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200 hover:border-blue-300",
  },
  {
    id: "books",
    name: "Books & Docs",
    description: "Documentações oficiais e livros técnicos",
    icon: <BookOpen className="w-6 h-6" />,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200 hover:border-amber-300",
  },
]

export default function SourcesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [topic, setTopic] = useState<string>("")
  const [answers, setAnswers] = useState<string[]>([])
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [insights, setInsights] = useState<Insight | null>(null)
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)
  const [useAISuggestions, setUseAISuggestions] = useState(true) // Default to true

  useEffect(() => {
    const topicParam = searchParams.get("topic")
    const answersParam = searchParams.get("answers")

    if (topicParam) {
      setTopic(topicParam)
    }

    if (answersParam) {
      try {
        const parsedAnswers = JSON.parse(answersParam)
        const answersArray = Array.isArray(parsedAnswers) ? parsedAnswers : Object.values(parsedAnswers)

        // Only update if different to avoid infinite loops
        if (JSON.stringify(answersArray) !== JSON.stringify(answers)) {
          setAnswers(answersArray)
        }
      } catch (error) {
        console.error("Error parsing answers:", error)
      }
    }
  }, [searchParams, answers]) // Keep answers in dependencies

  useEffect(() => {
    if (answers.length > 0 && !insights && !isLoadingInsights) {
      generateInsights()
    }
  }, [answers, insights, isLoadingInsights])

  useEffect(() => {
    if (insights?.recommendedSources && useAISuggestions) {
      setSelectedSources(insights.recommendedSources)
    } else if (insights?.recommendedSources && !useAISuggestions) {
      // If AI suggestions are turned off, clear selections unless user has manually selected
      // For now, we'll just keep the current selection, but this could be refined
    }
  }, [insights, useAISuggestions])

  const generateInsights = async () => {
    if (isLoadingInsights) return

    setIsLoadingInsights(true)
    try {
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          answers,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.insights) {
          setInsights(data.insights)
          if (data.insights.recommendedSources && data.insights.recommendedSources.length > 0) {
            setSelectedSources(data.insights.recommendedSources)
          }
        } else {
          // Fallback insights
          setInsights({
            insightText: "Não foi possível gerar insights personalizados. Por favor, selecione as fontes manualmente.",
            recommendedSources: [],
          })
        }
      } else {
        setInsights({
          insightText: "Não foi possível gerar insights personalizados. Por favor, selecione as fontes manualmente.",
          recommendedSources: [],
        })
      }
    } catch (error) {
      console.error("Error generating insights:", error)
      setInsights({
        insightText: "Erro ao gerar insights personalizados. Por favor, selecione as fontes manualmente.",
        recommendedSources: [],
      })
    } finally {
      setIsLoadingInsights(false)
    }
  }

  const toggleSource = (sourceId: string) => {
    setSelectedSources((prev) => (prev.includes(sourceId) ? prev.filter((id) => id !== sourceId) : [...prev, sourceId]))
  }

  const handleContinue = () => {
    if (selectedSources.length === 0) return

    const params = new URLSearchParams({
      topic,
      answers: JSON.stringify(answers),
      sources: JSON.stringify(selectedSources),
    })

    router.push(`/create/processing?${params.toString()}`)
  }

  const handleBack = () => {
    const params = new URLSearchParams({
      topic,
    })
    router.push(`/create/questions?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-white">
      {/* Header */}
      <header className="px-6 py-6 border-b border-[#F1F5F9]/50 backdrop-blur-sm bg-white/80">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#2D3748]">Escolha suas fontes de conteúdo</h1>
              <p className="text-[#718096] mt-1">
                Selecione onde você prefere aprender sobre <strong>{topic}</strong>
              </p>
            </div>
            <div className="text-sm text-[#718096] bg-white px-3 py-1 rounded-full border border-[#E2E8F0]">
              Passo 2 de 3
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Sources Selection */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[#2D3748] mb-2">Fontes de Conteúdo</h2>
              <p className="text-[#718096]">
                Selecione pelo menos uma fonte. Recomendamos escolher 2-3 para uma trilha mais rica.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sources.map((source) => (
                <motion.div
                  key={source.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                    selectedSources.includes(source.id)
                      ? `${source.borderColor.replace("hover:", "")} ${source.bgColor} shadow-lg`
                      : `border-[#E2E8F0] bg-white hover:border-[#CBD5E0] hover:shadow-md`
                  }`}
                  onClick={() => toggleSource(source.id)}
                >
                  {/* Selection Indicator */}
                  <div
                    className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                      selectedSources.includes(source.id)
                        ? "bg-[#FF6B35] border-[#FF6B35]"
                        : "border-[#CBD5E0] bg-white"
                    }`}
                  >
                    {selectedSources.includes(source.id) && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>

                  {/* Source Content */}
                  <div className={`${source.color} mb-4`}>{source.icon}</div>
                  <h3 className="font-bold text-[#2D3748] text-lg mb-2">{source.name}</h3>
                  <p className="text-[#718096] text-sm leading-relaxed">{source.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Insights Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#F1F5F9] sticky top-8">

              {isLoadingInsights ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#F1F5F9] rounded-full animate-pulse" />
                    <div className="h-4 bg-[#F1F5F9] rounded animate-pulse flex-1" />
                  </div>
                  <div className="h-3 bg-[#F1F5F9] rounded animate-pulse" />
                  <div className="h-3 bg-[#F1F5F9] rounded animate-pulse w-3/4" />
                </div>
              ) : insights ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-[#FF6B35] mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-[#2D3748] mb-1">Insight Personalizado</h4>
                      <p className="text-sm text-[#718096] leading-relaxed">{insights.insightText}</p>
                    </div>
                  </div>

                  {insights.recommendedSources && insights.recommendedSources.length > 0 && (
                    <div className="pt-4 border-t border-[#F1F5F9]">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-[#FF6B35] mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-[#2D3748] mb-1">Fontes Recomendadas</h4>
                          <p className="text-sm text-[#718096]">
                            {insights.recommendedSources
                              .map((sourceId) => sources.find((s) => s.id === sourceId)?.name || sourceId)
                              .join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-[#F1F5F9]">
                    <span className="text-sm font-medium text-[#2D3748]">Usar sugestões da IA</span>
                    <Switch checked={useAISuggestions} onCheckedChange={setUseAISuggestions} />
                  </div>
                </div>
              ) : (
                <div className="text-center text-[#718096]">
                  <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Gerando insights personalizados...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-16 pt-8 border-t border-[#F1F5F9]">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 text-[#718096] hover:text-[#2D3748] transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          <div className="text-center">
            <p className="text-sm text-[#718096] mb-2">
              {selectedSources.length === 0
                ? "Selecione pelo menos uma fonte"
                : `${selectedSources.length} fonte${selectedSources.length > 1 ? "s" : ""} selecionada${selectedSources.length > 1 ? "s" : ""}`}
            </p>
          </div>

          <button
            onClick={handleContinue}
            disabled={selectedSources.length === 0}
            className={`flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-all duration-200 ${
              selectedSources.length > 0
                ? "bg-[#FF6B35] hover:bg-[#E55A2B] text-white shadow-lg hover:shadow-xl"
                : "bg-[#F1F5F9] text-[#A0ADB8] cursor-not-allowed"
            }`}
          >
            Continuar
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  )
}
