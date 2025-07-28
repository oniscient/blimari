"use client"

import type React from "react"

import { useState } from "react"
import { Search, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { MobileMenu } from "@/components/layout/mobile-menu"

export default function HomePage() {
  const [learningGoal, setLearningGoal] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (learningGoal.trim() && !isLoading) {
      setIsLoading(true)

      try {
        // Navegar para a página de perguntas com o tópico
        const encodedTopic = encodeURIComponent(learningGoal.trim())
        router.push(`/create/questions?topic=${encodedTopic}`)
      } catch (error) {
        console.error("Erro ao navegar:", error)
        setIsLoading(false)
      }
    }
  }

  const handleExampleClick = (example: string) => {
    setLearningGoal(example)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Minimal Header */}
      <header className="px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-medium text-[#2D3748]">Blimari</h1>
          <MobileMenu />
        </div>
      </header>

      {/* Main Content - Centered */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-2xl">
          {/* Logo/Brand */}
          <div className="text-center mb-12">
            <h2 className="text-6xl font-light text-[#2D3748] mb-6 tracking-tight">Blimari</h2>
            <p className="text-lg text-[#718096] font-light">Transforme qualquer tópico em uma trilha de aprendizado</p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-[#A0ADB8]" />
              </div>
              <input
                type="text"
                placeholder="O que você quer aprender?"
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value)}
                disabled={isLoading}
                className="w-full pl-12 pr-16 py-4 text-lg border-[#E2E8F0] rounded-full focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] focus:outline-none shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                autoFocus
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!learningGoal.trim() || isLoading}
                className="absolute inset-y-0 right-0 pr-2 flex items-center"
              >
                <div className="bg-[#FF6B35] hover:bg-[#E55A2B] disabled:bg-[#A0ADB8] text-white rounded-full p-2 transition-colors duration-200 disabled:cursor-not-allowed">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowRight className="h-5 w-5" />
                  )}
                </div>
              </button>
            </div>
          </form>

          {/* Beautiful Examples */}
          <div className="mt-16 text-center">
            <p className="text-sm text-[#A0ADB8] mb-6 font-light">Ou explore estes tópicos populares:</p>
            <div className="flex flex-wrap justify-center gap-3 max-w-lg mx-auto">
              {[
                { name: "Machine Learning", color: "from-[#8B5CF6] to-[#7C3AED]" },
                { name: "React Development", color: "from-[#FF6B35] to-[#E55A2B]" },
                { name: "Design Thinking", color: "from-[#10B981] to-[#059669]" },
                { name: "Data Science", color: "from-[#8B5CF6] to-[#7C3AED]" },
                { name: "UX Research", color: "from-[#FF6B35] to-[#E55A2B]" },
                { name: "Python", color: "from-[#10B981] to-[#059669]" },
              ].map((example) => (
                <button
                  key={example.name}
                  onClick={() => handleExampleClick(example.name)}
                  disabled={isLoading}
                  className="group relative px-4 py-2 bg-white border border-[#E2E8F0] rounded-full text-sm text-[#718096] hover:border-transparent hover:text-white transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${example.color} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />
                  <span className="relative z-10 font-medium">{example.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center text-sm text-[#A0ADB8]">
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#718096] transition-colors">
              Sobre
            </a>
            <a href="#" className="hover:text-[#718096] transition-colors">
              Ajuda
            </a>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#718096] transition-colors">
              Privacidade
            </a>
            <a href="#" className="hover:text-[#718096] transition-colors">
              Termos
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
