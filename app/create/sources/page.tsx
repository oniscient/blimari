"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Sparkles, CheckCircle, Clock, BookOpen, Video, FileText, Code } from "lucide-react"
import { motion } from "framer-motion"

export default function SourcesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const topic = searchParams.get("topic")
  const answersParam = searchParams.get("answers")
  
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!topic || !answersParam) {
      router.push("/")
      return
    }

    try {
      const parsedAnswers = JSON.parse(answersParam)
      setAnswers(parsedAnswers)
      setLoading(false)
    } catch (error) {
      console.error("Erro ao parsear respostas:", error)
      router.push("/")
    }
  }, [topic, answersParam, router])

  const goBack = () => {
    const queryParams = new URLSearchParams({ topic: topic || "" })
    router.push(`/create/questions?${queryParams}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#FF6B35] border-t-transparent rounded-full mx-auto mb-6"
          />
          <h2 className="text-xl font-medium text-[#2D3748] mb-2">Carregando...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-white">
      {/* Header */}
      <header className="px-6 py-6 border-b border-[#F1F5F9]/50 backdrop-blur-sm bg-white/80">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-[#718096] hover:text-[#2D3748] transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Voltar</span>
          </button>
          <div className="inline-flex items-center gap-2 bg-[#FFE5D9] text-[#FF6B35] px-3 py-1 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>{topic}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-[#2D3748] mb-6">
              Descobrindo as melhores fontes
            </h1>
            <p className="text-xl text-[#718096] max-w-2xl mx-auto">
              Com base nas suas respostas, estamos curando o melhor conteúdo para sua trilha de aprendizado
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#10B981] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-[#10B981] font-medium">Perguntas</span>
              </div>
              <div className="w-16 h-0.5 bg-[#FF6B35]" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#FF6B35] rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white animate-spin" />
                </div>
                <span className="text-[#FF6B35] font-medium">Fontes</span>
              </div>
              <div className="w-16 h-0.5 bg-[#E2E8F0]" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#E2E8F0] rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#A0ADB8]" />
                </div>
                <span className="text-[#A0ADB8] font-medium">Trilha</span>
              </div>
            </div>
          </div>

          {/* Content Discovery Animation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { icon: Video, label: "Vídeos", color: "from-red-500 to-red-600" },
              { icon: FileText, label: "Artigos", color: "from-blue-500 to-blue-600" },
              { icon: Code, label: "Tutoriais", color: "from-green-500 to-green-600" },
              { icon: BookOpen, label: "Documentação", color: "from-purple-500 to-purple-600" },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-[#F1F5F9] text-center"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-[#2D3748] mb-2">{item.label}</h3>
                <div className="flex justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-[#FF6B35] border-t-transparent rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#F1F5F9]">
            <h2 className="text-2xl font-bold text-[#2D3748] mb-6">Suas preferências</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-medium text-[#2D3748] mb-1">Experiência</h3>
                <p className="text-[#718096] text-sm">Resposta registrada</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📚</span>
                </div>
                <h3 className="font-medium text-[#2D3748] mb-1">Estilo</h3>
                <p className="text-[#718096] text-sm">Resposta registrada</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-medium text-[#2D3748] mb-1">Objetivo</h3>
                <p className="text-[#718096] text-sm">Resposta registrada</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
