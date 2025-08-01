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
import LanguageSwitcher from "@/src/components/LanguageSwitcher";
import { useTranslation } from 'react-i18next';

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
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loadingLearningPaths, setLoadingLearningPaths] = useState(true);
  const [nextLesson, setNextLesson] = useState<{
    learningPathId: string;
    learningPathTitle: string;
    lessonId: string;
    lessonTitle: string;
    lessonUrl: string;
    lessonType: string;
  } | null>(null);
  const [loadingNextLesson, setLoadingNextLesson] = useState(true);
  const { t } = useTranslation();

  // Calculate overall progress
  const overallProgress = learningPaths.length > 0
    ? Math.round(learningPaths.reduce((sum, path) => sum + path.progress, 0) / learningPaths.length)
    : 0;

  // Reusable Circular Progress Component
  interface CircularProgressProps {
    progress: number;
    size?: number;
    strokeWidth?: number;
    gradientId: string;
  }

  const CircularProgress: React.FC<CircularProgressProps> = ({
    progress,
    size = 32,
    strokeWidth = 4,
    gradientId,
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - progress / 100);

    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
          <circle
            className="text-gray-200"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className="text-orange-500"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke={`url(#${gradientId})`}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
          />
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF8A65" />
              <stop offset="100%" stopColor="#FF6B35" />
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute text-[8px] font-bold text-gray-800">{Math.round(progress)}%</span>
      </div>
    );
  };

  const fetchLearningPaths = useCallback(async () => {
    if (!user) return;

    setLoadingLearningPaths(true);
    try {
      const res = await fetch("/api/learning-paths");
      if (res.ok) {
        const data: LearningPath[] = await res.json();
        setLearningPaths(data);
      }
    } catch (error) {
      console.error("Error fetching learning paths:", error);
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
            console.error(t('failed_to_sync_user'));
          }
          return res.json();
        })
        .then(data => {
          console.log('Utilizador sincronizado:', data);
        })
        .catch(error => {
          console.error(t('error_syncing'), error);
        });

      fetchLearningPaths(); // Initial fetch of learning paths
    }
  }, [user, fetchLearningPaths, t]);



  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case t('completed'):
        return "bg-green-100 text-green-800 border-green-200";
      case t('in_progress'):
        return "bg-orange-100 text-orange-800 border-orange-200";
      case t('to_do'):
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-lg font-medium text-gray-800">Blimari</h1>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <MobileMenu />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('hello_explorer', { displayName: user.displayName || "Explorador" })}!
          </h1>
          <Link href="/" passHref>
            <Button className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white rounded-full font-semibold px-6 py-3 shadow-md hover:shadow-lg transition-all duration-200">
              {t('new_trail')}
            </Button>
          </Link>
        </div>

        {/* Seu Progresso Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('your_progress')}</h2>
          <Card className="rounded-xl shadow-md border border-gray-200 bg-white p-6">
            <CardContent className="flex flex-col md:flex-row items-center gap-6 p-0">
              <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
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
                    strokeDashoffset={2 * Math.PI * 40 * (1 - overallProgress / 100)}
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
                <span className="absolute text-sm font-bold text-gray-800">{overallProgress}%</span>
              </div>
              <div className="flex-1 w-full">
                {loadingNextLesson ? (
                  <div className="flex items-center text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {t('loading_next_step')}
                  </div>
                ) : nextLesson ? (
                  <>
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      {t('next_step')} {nextLesson.lessonTitle}
                    </p>
                    <Progress
                      value={overallProgress}
                      className="h-3 bg-orange-100 [&>*]:bg-gradient-to-r [&>*]:from-[#FF6B35] [&>*]:to-[#E55A2B]"
                    />
                    <Link href={`/learning-paths/${nextLesson.learningPathId}/${nextLesson.lessonId}`} passHref>
                      <Button className="mt-4 bg-[#FF6B35] hover:bg-[#E55A2B] text-white rounded-full font-semibold px-6 py-3 shadow-md hover:shadow-lg transition-all duration-200">
                        {t('continue_learning')}
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      {t('all_trails_completed')}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      {t('create_new_trail_suggestion')}
                    </p>
                    <Link href="/create/sources" passHref>
                      <Button className="mt-4 bg-[#FF6B35] hover:bg-[#E55A2B] text-white rounded-full font-semibold px-6 py-3 shadow-md hover:shadow-lg transition-all duration-200">
                        {t('create_new_trail')}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Módulos de Aprendizado Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('learning_modules')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingLearningPaths ? (
              <div className="col-span-full flex flex-col items-center justify-center py-8 min-h-[200px]">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35] mb-2" />
                <p className="text-gray-600">{t('loading_learning_paths')}</p>
              </div>
            ) : learningPaths.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-600">
                <p className="mb-4">{t('no_learning_paths_found')}</p>
                <Link href="/create/sources" className="text-[#FF6B35] hover:underline inline-flex items-center gap-1">
                  {t('create_new_trail')} <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              learningPaths.map((path) => (
                <Card key={path.id} className="relative rounded-xl shadow-md border border-gray-200 bg-white overflow-hidden">
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden rounded-t-xl">
                    <img
                      src={path.thumbnail || '/placeholder.svg'}
                      alt={path.title || 'Learning path thumbnail'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-4 left-4 z-10">
                    <CircularProgress progress={path.progress} gradientId={`pathProgressGradient-${path.id}`} />
                  </div>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg font-semibold text-gray-800 mb-2">{path.title}</CardTitle>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{path.description}</p>
                    <div className="flex flex-col gap-1 text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3" />
                        <span>{t('topic')}: {path.topic}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3 h-3" />
                        <span>{t('difficulty')}: {path.difficulty}</span>
                      </div>
                    </div>
                    <Link href={`/learning-paths/${path.id}`} passHref className="text-sm font-medium text-[#FF6B35] hover:text-[#E55A2B] transition-colors duration-200 flex items-center gap-1">
                      {t('view_trail')} <ChevronRight className="w-3 h-3" />
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Atividade Recente Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('recent_activity')}</h2>
          <Card className="rounded-xl shadow-md border border-gray-200 bg-white">
            <CardContent className="p-6 space-y-4 text-gray-600">
              <p>{t('no_recent_activity')}</p>
            </CardContent>
          </Card>
        </section>

        {/* Conteúdo Recomendado Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('recommended_content_section')}</h2>
          <Card className="rounded-xl shadow-md border border-gray-200 bg-white">
            <CardContent className="p-6 space-y-4 text-gray-600">
              <p>{t('no_recommended_content')}</p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}