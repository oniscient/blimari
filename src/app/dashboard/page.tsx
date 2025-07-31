"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@stackframe/stack";
import {
  Home,
  LayoutDashboard,
  PlusCircle,
  Settings,
  BookOpen,
  Clock,
  Youtube,
  Globe,
  Github,
  Book,
  Code,
  ChevronRight,
  User,
  Bell,
  Search,
  Award,
  Activity,
  Star,
  Zap,
  Loader2,
} from "lucide-react";
import { MobileMenu } from "@/src/components/layout/mobile-menu";

import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Progress } from "@/src/components/ui/progress";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { LearningPath, OrganizedTrail } from "@/src/types"; // Importar tipos

// Mock Data
const mockLearningModules = [
  {
    id: "1",
    icon: Youtube,
    title: "Introdução ao Next.js",
    type: "Vídeo",
    status: "Concluído",
    progress: 100,
  },
  {
    id: "2",
    icon: Book,
    title: "Fundamentos de Tailwind CSS",
    type: "Artigo",
    status: "Em Andamento",
    progress: 60,
  },
  {
    id: "3",
    icon: Code,
    title: "Desenvolvimento de APIs com Node.js",
    type: "Curso",
    status: "A Fazer",
    progress: 0,
  },
  {
    id: "4",
    icon: Github,
    title: "Controle de Versão com Git e GitHub",
    type: "Repositório",
    status: "Concluído",
    progress: 100,
  },
  {
    id: "5",
    icon: Globe,
    title: "Design Responsivo na Prática",
    type: "Tutorial",
    status: "Em Andamento",
    progress: 30,
  },
];

const mockRecentActivity = [
  {
    id: "1",
    icon: Clock,
    description: "Visualizou 'Introdução ao Next.js'",
    timestamp: "2 horas atrás",
  },
  {
    id: "2",
    icon: Award,
    description: "Completou o quiz de 'Fundamentos de Tailwind CSS'",
    timestamp: "1 dia atrás",
  },
  {
    id: "3",
    icon: PlusCircle,
    description: "Adicionou 'Desenvolvimento de APIs' à sua trilha",
    timestamp: "3 dias atrás",
  },
  {
    id: "4",
    icon: Star,
    description: "Maratonou 'Design Responsivo na Prática'",
    timestamp: "1 semana atrás",
  },
];

const mockRecommendedContent = [
  {
    id: "1",
    title: "Trilha de Backend com Python",
    description: "Explore o mundo do desenvolvimento backend com Python e Django.",
    image: "/placeholder.jpg", // Placeholder image
  },
  {
    id: "2",
    title: "Introdução à Ciência de Dados",
    description: "Comece sua jornada em análise de dados e machine learning.",
    image: "/placeholder.jpg", // Placeholder image
  },
  {
    id: "3",
    title: "Dominando React Native",
    description: "Crie aplicativos móveis nativos com JavaScript e React.",
    image: "/placeholder.jpg", // Placeholder image
  },
];

export default function DashboardPage() {
  const user = useUser({ or: "redirect" });
  const [progress, setProgress] = useState(75); // Example progress

  useEffect(() => {
    if (user) {
      // Sincronizar o utilizador com a base de dados
      fetch('/api/user/sync', { method: 'POST' })
        .then(res => {
          if (!res.ok) {
            console.error('Falha ao sincronizar utilizador');
          }
          return res.json();
        })
        .then(data => {
          console.log('Utilizador sincronizado:', data);
        })
        .catch(error => {
          console.error('Erro na sincronização:', error);
        });

      // Verificar e sincronizar trilhas de aprendizado do localStorage
      const localLearningPath = localStorage.getItem("localLearningPath");
      if (localLearningPath) {
        try {
          const { topic, organizedTrail } = JSON.parse(localLearningPath);
          console.log("Found local learning path, attempting to save to DB:", { topic, organizedTrail });

          fetch("/api/learning-paths/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: `Trilha de ${topic}`,
              topic,
              difficulty: "beginner", // Placeholder
              description: `Uma trilha de aprendizado personalizada sobre ${topic}.`,
              organizedTrail,
            }),
          })
            .then((res) => {
              if (res.ok) {
                console.log("Local learning path successfully saved to DB.");
                localStorage.removeItem("localLearningPath"); // Remover após salvar
              } else {
                console.error("Failed to save local learning path to DB:", res.status, res.statusText);
              }
            })
            .catch((error) => {
              console.error("Error saving local learning path to DB:", error);
            });
        } catch (error) {
          console.error("Error parsing local learning path from localStorage:", error);
          localStorage.removeItem("localLearningPath"); // Limpar dados corrompidos
        }
      }
    }
  }, [user]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Concluído":
        return "bg-green-100 text-green-800 border-green-200";
      case "Em Andamento":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "A Fazer":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-6 py-6 border-b border-[#F1F5F9]/50 backdrop-blur-sm bg-white/80">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/">
            <h1 className="text-lg font-medium text-[#2D3748]">Blimari</h1>
          </Link>
          <MobileMenu />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-[#2D3748]">
          Olá, {user.displayName || "Explorador"}!
        </h1>

        {/* Seu Progresso Section */}
        <Card className="rounded-2xl shadow-md border border-[#E2E8F0] bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#2D3748]">Seu Progresso</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-gray-200"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-orange-500"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - progress / 100)}
                  strokeLinecap="round"
                  stroke="url(#progressGradient)"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                  style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF8A65" />
                    <stop offset="100%" stopColor="#FF6B35" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute text-2xl font-bold text-[#2D3748]">{progress}%</span>
            </div>
            <div className="flex-1 w-full">
              <p className="text-lg font-medium text-[#718096] mb-2">
                Próximo Passo: Concluir o módulo de Tailwind CSS
              </p>
              <Progress
                value={progress}
                className="h-3 bg-orange-100 [&>*]:bg-gradient-to-r [&>*]:from-[#FF6B35] [&>*]:to-[#E55A2B]"
              />
              <Button className="mt-4 bg-[#FF6B35] hover:bg-[#E55A2B] text-white rounded-full font-semibold px-6 py-3 shadow-md hover:shadow-lg transition-all duration-200">
                Continue Learning
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Módulos de Aprendizado Section */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold text-[#2D3748] mb-6">Módulos de Aprendizado</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {mockLearningModules.map((module) => (
              <Card
                key={module.id}
                className="rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 border border-[#E2E8F0] bg-white"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-[#A0ADB8]">
                      <module.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#2D3748] text-lg">
                        {module.title}
                      </h3>
                      <p className="text-sm text-[#718096]">
                        {module.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge className={getStatusBadgeClass(module.status)}>
                      {module.status}
                    </Badge>
                    <Button variant="outline" className="rounded-lg text-[#718096]">
                      {module.status === "Concluído"
                        ? "Review"
                        : module.status === "Em Andamento"
                        ? "Continue"
                        : "Start"}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Atividade Recente Section */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold text-[#2D3748] mb-6">Atividade Recente</h2>
          <Card className="rounded-2xl shadow-md border border-[#E2E8F0] bg-white">
            <CardContent className="p-6 space-y-4">
              {mockRecentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-[#A0ADB8]">
                    <activity.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[#718096]">{activity.description}</p>
                    <p className="text-xs text-[#A0ADB8]">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Conteúdo Recomendado Section */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold text-[#2D3748] mb-6">Conteúdo Recomendado</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {mockRecommendedContent.map((content) => (
              <Card
                key={content.id}
                className="rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 border border-[#E2E8F0] bg-white"
              >
                <CardContent className="p-4">
                  <Image
                    src={content.image}
                    alt={content.title}
                    width={400}
                    height={200}
                    className="rounded-xl mb-4 object-cover w-full h-40"
                  />
                  <h3 className="font-bold text-[#2D3748] text-lg mb-2">
                    {content.title}
                  </h3>
                  <p className="text-sm text-[#718096] mb-4">
                    {content.description}
                  </p>
                  <Button className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white rounded-full font-semibold px-6 py-3 shadow-md hover:shadow-lg transition-all duration-200 w-full">
                    Explore
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}