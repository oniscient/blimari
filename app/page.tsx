"use client"

import type React from "react"

import { useState } from "react"
import { Search } from "lucide-react"
import AnimatedButton from "@/components/ui/AnimatedButton"
import { useRouter } from "next/navigation"
import { MobileMenu } from "@/src/components/layout/mobile-menu"
import DarkVeil from "@/components/ui/DarkVeil"
import AnimatedTopicCard from "@/components/ui/AnimatedTopicCard"

export default function HomePage() {
  const [learningGoal, setLearningGoal] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
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
    <div className="relative min-h-screen bg-transparent flex flex-col">
      <div style={{ width: '100%', height: '600px', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
        <DarkVeil />
      </div>
      <div className="relative z-10 flex flex-col flex-1">
        {/* Minimal Header */}
        <header className="px-6 py-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <h1 className="text-lg font-medium text-gray-800">Blimari</h1>
            <MobileMenu />
          </div>
        </header>

        {/* Main Content - Centered */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-2xl">
            {/* Logo/Brand */}
            <div className="text-center mb-12">
              <h2 className="text-6xl font-light text-gray-800 mb-6 tracking-tight">Blimari</h2>
              <p className="text-lg text-gray-700 font-light">Transforme qualquer tópico em uma trilha de aprendizado</p>
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
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                  <AnimatedButton
                    onClick={handleSubmit}
                    disabled={!learningGoal.trim() || isLoading}
                    isLoading={isLoading}
                  >
                    Discover
                  </AnimatedButton>
                </div>
              </div>
            </form>

            {/* Beautiful Examples */}
            <div className="mt-16 text-center">
              <p className="text-sm text-gray-600 mb-6 font-light">Ou explore estes tópicos populares:</p>
              <div className="flex justify-center gap-4 max-w-4xl mx-auto">
                {[
                  { name: "Machine Learning", description: "Learn the fundamentals of AI and machine learning." },
                  { name: "React Development", description: "Build modern, interactive web applications." },
                  { name: "Data Science", description: "Extract insights and knowledge from data." },
                ].map((example) => (
                  <AnimatedTopicCard
                    key={example.name}
                    description={example.description}
                    onClick={() => handleExampleClick(example.name)}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Minimal Footer */}
        <footer className="px-6 py-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center text-sm text-gray-600">
          </div>
        </footer>
      </div>
    </div>
  )
}
