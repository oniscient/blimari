"use client";

import React, { useEffect, useState } from 'react';
import { LearningPath, APIResponse, TrailSection, ContentItem } from '@/src/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Progress } from '@/src/components/ui/progress';
import { Badge } from '@/src/components/ui/badge';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/src/components/ui/alert';
import { Button } from '@/src/components/ui/button';
import { Checkbox } from '@/src/components/ui/checkbox';
import { CheckCircle2, Circle, PlayCircle, Terminal, Loader2, ArrowLeft, Sparkles, BookOpen, Youtube, Github, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface LearningPathPageProps {
  params: {
    id: string;
  };
}

const LearningPathPage: React.FC<LearningPathPageProps> = ({ params }) => {
  const { id: learningPathId } = params;
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingContent, setUpdatingContent] = useState<string | null>(null);

  useEffect(() => {
    const fetchLearningPath = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/learning-paths/${learningPathId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result: APIResponse<LearningPath> = await response.json();

        if (result.success && result.data) {
          setLearningPath(result.data);
        } else {
          setError(result.message || 'Failed to fetch learning path');
        }
      } catch (err) {
        setError('An unexpected error occurred while fetching the learning path.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (learningPathId) {
      fetchLearningPath();
    }
  }, [learningPathId]);

  const handleProgressChange = async (contentId: string, isCompleted: boolean) => {
    setUpdatingContent(contentId);
    try {
      const response = await fetch('/api/learning-paths/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          learningPathId,
          contentId,
          isCompleted,
        }),
      });

      const result: APIResponse<LearningPath> = await response.json();

      if (response.ok && result.success && result.data) {
        setLearningPath(result.data);
        toast.success('Progresso atualizado com sucesso!');
      } else {
        throw new Error(result.message || 'Falha ao atualizar o progresso.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro inesperado.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUpdatingContent(null);
    }
  };

  const findContentItem = (itemId: string): ContentItem | undefined => {
    // Ensure learningPath.content is treated as an array
    const content = Array.isArray(learningPath?.content) ? learningPath.content : [];
    return content.find((c: ContentItem) => c.id === itemId);
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType.toLowerCase()) {
      case 'video':
        return <Youtube className="w-4 h-4" />;
      case 'article':
        return <BookOpen className="w-4 h-4" />;
      case 'repository':
        return <Github className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#FF6B35] mx-auto" />
          <h2 className="text-xl font-medium text-[#2D3748] mb-2 mt-8">Carregando sua trilha...</h2>
          <p className="text-[#718096]">Só um momento, estamos preparando tudo para você.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <span className="text-2xl text-red-500">⚠️</span>
          </motion.div>
          <h2 className="text-xl font-medium text-[#2D3748] mb-2">Ops! Algo deu errado</h2>
          <p className="text-[#718096] mb-6">{error}</p>
          <Button asChild className="bg-[#FF6B35] hover:bg-[#E55A2B]">
            <Link href="/dashboard">Voltar ao Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!learningPath) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <span className="text-2xl text-blue-500">🤔</span>
          </motion.div>
          <h2 className="text-xl font-medium text-[#2D3748] mb-2">Trilha não encontrada</h2>
          <p className="text-[#718096] mb-6">A trilha de aprendizado que você está procurando não foi encontrada.</p>
          <Button asChild className="bg-[#FF6B35] hover:bg-[#E55A2B]">
            <Link href="/dashboard">Voltar ao Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { title, topic, description, progress, content } = learningPath;

  // Create a fallback trail if organizedTrail is missing
  const displayTrail: TrailSection[] = learningPath.organizedTrail?.organizedTrail || [
    {
      sectionTitle: "Trilha de Aprendizado",
      items: (Array.isArray(content) ? content : []).map(c => ({
        id: c.id,
        organizedDescription: c.description || 'Acesse o conteúdo para mais detalhes.',
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-white">
      <header className="px-6 py-6 border-b border-[#F1F5F9]/50 backdrop-blur-sm bg-white/80 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-[#718096] hover:text-[#2D3748] transition-all duration-200 hover:scale-105">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Voltar ao Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-[#718096]">
              Progresso: {Math.round(progress || 0)}%
            </div>
            <div className="w-32 bg-[#E2E8F0] rounded-full h-2.5">
              <motion.div
                className="bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress || 0}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="inline-flex items-center gap-2 bg-[#FFE5D9] text-[#FF6B35] px-3 py-1 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>{topic}</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#2D3748] mb-4 leading-tight">{title}</h1>
          <p className="text-[#718096] text-xl leading-relaxed mb-12">{description}</p>
        </motion.div>

        <div className="space-y-12">
          {displayTrail.length > 0 ? (
            displayTrail.map((section: TrailSection, sectionIndex: number) => (
              <motion.div
                key={sectionIndex}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + sectionIndex * 0.1, duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-[#2D3748] mb-6">{section.sectionTitle}</h2>
                <div className="relative space-y-8">
                  {section.items.map((item: { id: string; organizedDescription: string }, itemIndex: number) => {
                      const isLastItem = itemIndex === section.items.length - 1;
                      const contentItem = findContentItem(item.id);
                      const isCompleted = contentItem?.isCompleted || false;
                      const completedCount = (Array.isArray(content) ? content : []).filter(c => c.isCompleted).length;
                      const globalItemIndex = displayTrail.slice(0, sectionIndex).reduce((acc, s) => acc + s.items.length, 0) + itemIndex;
                      const isCurrent = !isCompleted && completedCount === globalItemIndex;

                      const getStatusIcon = () => {
                        if (isCompleted) {
                          return <CheckCircle2 className="h-10 w-10 text-green-500" />;
                        }
                        if (isCurrent) {
                          return <PlayCircle className="h-10 w-10 text-blue-500 animate-pulse" />;
                        }
                        return <Circle className="h-10 w-10 text-[#A0ADB8]" />;
                      };

                      return (
                        <div key={item.id} className="flex relative pb-8 last:pb-0">
                          {/* Linha de conexão */}
                          {!isLastItem && (
                            <div className="absolute left-5 top-5 -bottom-8 w-0.5 bg-gray-200" />
                          )}

                          {/* Ícone de status */}
                          <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center z-10 bg-white">
                            {getStatusIcon()}
                          </div>

                          {/* Card de conteúdo */}
                          <motion.div
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="ml-8 w-full"
                          >
                            <Card className={`w-full rounded-2xl border-2 transition-all duration-300 ${isCurrent ? 'border-[#FF6B35] bg-gradient-to-r from-[#FFE5D9]/50 to-[#FFF0E6]/50 shadow-lg' : 'border-[#E2E8F0] bg-white hover:border-[#FF6B35]/50'}`}>
                              <CardHeader>
                                <CardTitle className="text-xl font-bold text-[#2D3748]">{contentItem?.title || 'Conteúdo não encontrado'}</CardTitle>
                              {contentItem && (
                                <div className="flex items-center space-x-4 pt-2 text-sm text-[#718096]">
                                  <div className="flex items-center gap-2">
                                    {getContentTypeIcon(contentItem.contentType)}
                                    <span className="capitalize">{contentItem.contentType}</span>
                                  </div>
                                  <span>{contentItem.duration || contentItem.durationMinutes}</span>
                                </div>
                              )}
                            </CardHeader>
                            <CardContent>
                              <p className="text-[#718096] mb-6">{item.organizedDescription}</p>
                              {contentItem && (
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                  <Button asChild className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-md hover:shadow-lg">
                                    <a href={contentItem.url} target="_blank" rel="noopener noreferrer">
                                      Acessar Conteúdo
                                    </a>
                                  </Button>
                                  <div className="flex items-center space-x-3">
                                    <Checkbox
                                      id={`item-${item.id}`}
                                      checked={isCompleted}
                                      onCheckedChange={(checked) => handleProgressChange(item.id, !!checked)}
                                      disabled={updatingContent === item.id}
                                      className="w-5 h-5 rounded"
                                    />
                                    <label htmlFor={`item-${item.id}`} className="text-sm font-medium flex items-center text-[#718096]">
                                      {updatingContent === item.id ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Atualizando...
                                        </>
                                      ) : (
                                        'Marcar como concluído'
                                      )}
                                    </label>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-16">
              <h2 className="text-xl font-medium text-[#2D3748] mb-2">Nenhum conteúdo na trilha</h2>
              <p className="text-[#718096]">Parece que esta trilha de aprendizado ainda não tem conteúdo.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LearningPathPage;