"use client"

import {
  Book,
  CheckCircle,
  Clock,
  Code,
  Globe,
  PlusCircle,
  Youtube,
  Github,
  ArrowRight,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function Dashboard() {
  const learningPath = {
    title: "Machine Learning",
    progress: 25,
    modules: [
      {
        title: "Fundamentos de Machine Learning",
        source: "YouTube",
        type: "Vídeo",
        status: "Concluído",
        icon: <Youtube className="h-5 w-5 text-red-500" />,
      },
      {
        title: "Regressão Linear na Prática",
        source: "Artigo Web",
        type: "Artigo",
        status: "Em Andamento",
        icon: <Globe className="h-5 w-5 text-blue-500" />,
      },
      {
        title: "Projeto: Previsão de Preços",
        source: "GitHub",
        type: "Repositório",
        status: "A Fazer",
        icon: <Github className="h-5 w-5" />,
      },
      {
        title: "Redes Neurais e Deep Learning",
        source: "YouTube",
        type: "Vídeo",
        status: "A Fazer",
        icon: <Youtube className="h-5 w-5 text-red-500" />,
      },
    ],
  }

  return (
    <div className="min-h-screen w-full flex-col bg-gradient-to-br from-white via-orange-50/30 to-white">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-sm px-6">
        <h1 className="text-2xl font-bold text-[#2D3748]">Sua Trilha</h1>
        <div className="ml-auto">
          <Link href="/">
            <Button
              size="sm"
              className="h-9 gap-2 bg-[#FF6B35] hover:bg-[#E55A2B] text-white rounded-full font-semibold"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Nova Trilha</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Trilha Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#2D3748] mb-2">{learningPath.title}</h2>
            <p className="text-[#718096] text-lg">Seu plano de estudos personalizado está pronto.</p>
          </div>

          {/* Progress Card */}
          <Card className="mb-8 bg-white/50 border-2 border-orange-100 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-[#2D3748]">Seu Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FF8A65] to-[#FF6B35] rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">{learningPath.progress}%</span>
                </div>
                <div className="flex-1">
                  <Progress value={learningPath.progress} className="h-3 bg-orange-100 [&>*]:bg-gradient-to-r [&>*]:from-[#FF6B35] [&>*]:to-[#E55A2B]" />
                  <p className="text-sm text-[#718096] mt-2">
                    Continue assim! O próximo passo é sobre Regressão Linear.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Modules */}
          <div>
            <h3 className="text-xl font-bold text-[#2D3748] mb-4">Módulos de Aprendizado</h3>
            <div className="space-y-4">
              {learningPath.modules.map((module, index) => (
                <Card
                  key={index}
                  className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-[#F1F5F9] overflow-hidden"
                >
                  <div className="flex items-center p-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                      {module.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-[#718096]">
                            {module.source} • {module.type}
                          </p>
                          <h4 className="font-bold text-[#2D3748]">{module.title}</h4>
                        </div>
                        <Badge
                          variant={module.status === "Concluído" ? "default" : "outline"}
                          className={`
                            ${
                              module.status === "Concluído"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : module.status === "Em Andamento"
                                  ? "bg-orange-100 text-orange-800 border-orange-200"
                                  : "bg-gray-100 text-gray-800 border-gray-200"
                            }
                          `}
                        >
                          {module.status}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="ml-4">
                      <ChevronRight className="h-5 w-5 text-[#A0ADB8]" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}