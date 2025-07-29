"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Sparkles, BookOpen, Target, Youtube, Newspaper, Github, Globe } from "lucide-react"

interface Insight {
  experience: string
  style: string
  goal: string
}

export default function SourcesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [topic, setTopic] = useState<string>("")
  const [answers, setAnswers] = useState<string[]>([])
  const [insights, setInsights] = useState<Insight | null>(null)
  const [loadingInsights, setLoadingInsights] = useState(true)

  useEffect(() => {
    const topicParam = searchParams.get("topic")
    const answersParam = searchParams.get("answers")

    if (topicParam) {
      setTopic(topicParam)
    }
    if (answersParam) {
      try {
        const parsedAnswers = JSON.parse(answersParam)
        // Convert answers object to array
        const answersArray = Object.values(parsedAnswers) as string[]
        setAnswers(answersArray)
      } catch (error) {
        console.error("Error parsing answers:", error)
        setAnswers([])
      }
    }
  }, [searchParams])

  useEffect(() => {
    if (answers.length > 0 && topic) {
      generateInsights()
    }
  }, [answers, topic])

  const handleSourceChange = (source: string, checked: boolean) => {
    if (checked) {
      setSelectedSources((prev) => [...prev, source])
    } else {
      setSelectedSources((prev) => prev.filter((s) => s !== source))
    }
  }

  const generateInsights = async () => {
    setLoadingInsights(true)
    try {
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers, topic }),
      })

      const data = await response.json()

      if (data.success && data.insights) {
        setInsights(data.insights)
      } else {
        console.error("Failed to fetch insights:", data.error)
        // Fallback insights
        setInsights({
          experience: "Nível de experiência em análise.",
          style: "Estilo de aprendizado sendo processado.",
          goal: "Objetivo principal da jornada em definição.",
        })
      }
    } catch (error) {
      console.error("Error generating insights:", error)
      // Fallback insights on network error
      setInsights({
        experience: "Não foi possível gerar insights de experiência.",
        style: "Não foi possível gerar insights de estilo.",
        goal: "Não foi possível gerar insights de objetivo.",
      })
    } finally {
      setLoadingInsights(false)
    }
  }

  const handleNext = () => {
    const params = new URLSearchParams()
    params.set("topic", topic)
    params.set("answers", JSON.stringify(answers))
    params.set("sources", JSON.stringify(selectedSources))
    router.push(`/create/processing?${params.toString()}`)
  }

  const sourceOptions = [
    { id: "youtube", name: "YouTube", icon: <Youtube className="h-5 w-5 text-red-500" /> },
    { id: "medium", name: "Medium Articles", icon: <Newspaper className="h-5 w-5 text-gray-700" /> },
    { id: "github", name: "GitHub Repos", icon: <Github className="h-5 w-5 text-gray-800" /> },
    { id: "web", name: "Web Articles", icon: <Globe className="h-5 w-5 text-blue-500" /> },
    { id: "books", name: "Books", icon: <BookOpen className="h-5 w-5 text-amber-700" /> },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#E0F2F7] to-[#B3E0F2] p-4 sm:p-6 lg:p-8">
      <Progress value={66} className="w-full max-w-md mx-auto mb-8" />

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
        <Card className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl shadow-xl">
          <CardHeader className="text-center mb-6">
            <CardTitle className="text-3xl font-extrabold text-[#2D3748]">Escolha suas fontes de aprendizado</CardTitle>
            <p className="text-lg text-[#4A5568] mt-2">
              De onde você prefere aprender sobre <span className="font-semibold">{topic}</span>?
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {sourceOptions.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center space-x-3 p-4 border border-[#CBD5E0] rounded-xl bg-white shadow-sm transition-all hover:shadow-md"
                >
                  <Checkbox
                    id={source.id}
                    checked={selectedSources.includes(source.id)}
                    onCheckedChange={(checked) => handleSourceChange(source.id, checked as boolean)}
                    className="h-5 w-5 border-[#4299E1] data-[state=checked]:bg-[#4299E1] data-[state=checked]:text-white"
                  />
                  <Label
                    htmlFor={source.id}
                    className="flex items-center gap-2 text-lg font-medium text-[#2D3748] cursor-pointer"
                  >
                    {source.icon}
                    <span>{source.name}</span>
                  </Label>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#F1F5F9] mt-8">
              <h2 className="text-2xl font-bold text-[#2D3748] mb-6 text-center">Seus Insights de Aprendizado</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loadingInsights ? (
                  <>
                    <Skeleton className="h-32 rounded-xl" />
                    <Skeleton className="h-32 rounded-xl" />
                    <Skeleton className="h-32 rounded-xl" />
                  </>
                ) : (
                  <>
                    <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300 shadow-md">
                      <CardContent className="flex flex-col items-center justify-center p-4 text-center h-full">
                        <Sparkles className="h-8 w-8 text-blue-600 mb-2" />
                        <h3 className="font-semibold text-blue-800 text-lg mb-1">Experiência</h3>
                        <p className="text-blue-700 text-sm">{insights?.experience}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-100 to-green-200 border-green-300 shadow-md">
                      <CardContent className="flex flex-col items-center justify-center p-4 text-center h-full">
                        <BookOpen className="h-8 w-8 text-green-600 mb-2" />
                        <h3 className="font-semibold text-green-800 text-lg mb-1">Estilo</h3>
                        <p className="text-green-700 text-sm">{insights?.style}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300 shadow-md">
                      <CardContent className="flex flex-col items-center justify-center p-4 text-center h-full">
                        <Target className="h-8 w-8 text-purple-600 mb-2" />
                        <h3 className="font-semibold text-purple-800 text-lg mb-1">Objetivo</h3>
                        <p className="text-purple-700 text-sm">{insights?.goal}</p>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
              <div className="mt-6 text-center text-[#4A5568] text-sm">
                <p>
                  Estes insights nos ajudam a curar o conteúdo mais relevante e adaptado ao seu perfil de aprendizado.
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <Button
                onClick={handleNext}
                disabled={selectedSources.length === 0}
                className="bg-[#4299E1] hover:bg-[#3182CE] text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Continuar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
