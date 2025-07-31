"use client";

import { useState, useEffect, useCallback } from "react";
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



export default function DashboardPage() {
  const user = useUser({ or: "redirect" });
  const [progress, setProgress] = useState(0);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loadingLearningPaths, setLoadingLearningPaths] = useState(true);

  const fetchLearningPaths = useCallback(async () => {
    if (!user) return;

    setLoadingLearningPaths(true);
    try {
      const res = await fetch("/api/learning-paths");
      if (res.ok) {
        const data: LearningPath[] = await res.json();
        setLearningPaths(data);
      } else {
        console.error("Failed to fetch learning paths:", res.status, res.statusText);
        // Fallback to localStorage if API fails
        const localLearningPath = localStorage.getItem("localLearningPath");
        if (localLearningPath) {
          try {
            const { topic, organizedTrail } = JSON.parse(localLearningPath);
            setLearningPaths([{
              id: "local-path",
              title: `Trilha de ${topic}`,
              topic,
              difficulty: "beginner",
              description: `Uma trilha de aprendizado personalizada sobre ${topic}.`,
              organizedTrail,
              userId: user.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              totalContent: organizedTrail?.organizedTrail.reduce((acc: number, section: OrganizedTrail["organizedTrail"][0]) => acc + section.items.length, 0) || 0,
              completedContent: 0, // Default to 0 for local paths
              status: "active", // Default status
              progress: 0, // Default progress
            }]);
          } catch (error) {
            console.error("Error parsing local learning path from localStorage:", error);
            localStorage.removeItem("localLearningPath");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching learning paths:", error);
      // Fallback to localStorage if API fails
      const localLearningPath = localStorage.getItem("localLearningPath");
      if (localLearningPath) {
        try {
          const { topic, organizedTrail } = JSON.parse(localLearningPath);
          setLearningPaths([{
            id: "local-path",
            title: `Trilha de ${topic}`,
            topic,
            difficulty: "beginner",
            description: `Uma trilha de aprendizado personalizada sobre ${topic}.`,
            organizedTrail,
            userId: user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            totalContent: organizedTrail?.organizedTrail.reduce((acc: number, section: OrganizedTrail["organizedTrail"][0]) => acc + section.items.length, 0) || 0,
            completedContent: 0, // Default to 0 for local paths
            status: "active", // Default status
            progress: 0, // Default progress
          }]);
        } catch (error) {
          console.error("Error parsing local learning path from localStorage:", error);
          localStorage.removeItem("localLearningPath");
        }
      }
    } finally {
      setLoadingLearningPaths(false);
    }
  }, [user]);

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
                fetchLearningPaths(); // Re-fetch learning paths after saving local one
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

      fetchLearningPaths(); // Initial fetch of learning paths
    }
  }, [user, fetchLearningPaths]);

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
            {loadingLearningPaths ? (
              <div className="col-span-full flex justify-center items-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35]" />
                <p className="ml-2 text-[#718096]">Carregando trilhas de aprendizado...</p>
              </div>
            ) : learningPaths.length === 0 ? (
              <div className="col-span-full text-center py-8 text-[#718096]">
                <p>Nenhuma trilha de aprendizado encontrada. Comece a criar uma nova!</p>
                <Link href="/create/sources" className="text-[#FF6B35] hover:underline mt-2 block">
                  Criar Nova Trilha
                </Link>
              </div>
            ) : (
              learningPaths.map((path) => (
                <Card key={path.id} className="rounded-2xl shadow-md border border-[#E2E8F0] bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-[#2D3748]">{path.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-[#718096]">
                      <BookOpen className="w-4 h-4" />
                      <span>Tópico: {path.topic}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#718096]">
                      <Award className="w-4 h-4" />
                      <span>Dificuldade: {path.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#718096]">
                      <Activity className="w-4 h-4" />
                      <span>Status: <Badge className={getStatusBadgeClass(path.status)}>{path.status}</Badge></span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-[#718096]">Progresso:</p>
                      <Progress
                        value={path.progress}
                        className="h-2 bg-orange-100 [&>*]:bg-gradient-to-r [&>*]:from-[#FF6B35] [&>*]:to-[#E55A2B]"
                      />
                      <span className="text-xs text-[#718096]">{path.progress}% Concluído</span>
                    </div>
                    <Link href={`/learning-paths/${path.id}`} passHref>
                      <Button className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] text-white rounded-full font-semibold px-4 py-2 shadow-md hover:shadow-lg transition-all duration-200">
                        Ver Trilha <ChevronRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Atividade Recente Section */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold text-[#2D3748] mb-6">Atividade Recente</h2>
          <Card className="rounded-2xl shadow-md border border-[#E2E8F0] bg-white">
            <CardContent className="p-6 space-y-4">
              {/* Recent activity will be dynamically loaded */}
            </CardContent>
          </Card>
        </section>

        {/* Conteúdo Recomendado Section */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold text-[#2D3748] mb-6">Conteúdo Recomendado</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {/* Recommended content will be dynamically loaded */}
          </div>
        </section>
      </main>
    </div>
  );
}