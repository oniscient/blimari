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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/src/components/ui/collapsible';
import { CheckCircle2, Circle, PlayCircle, Terminal, Loader2, ArrowLeft, Sparkles, BookOpen, Youtube, Github, Globe, ArrowRight, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { audioService } from '@/src/services/audio.service';
import { useTranslation } from 'react-i18next';

interface LearningPathPageProps {
  params: {
    id: string;
  };
}

const LearningPathPage: React.FC<LearningPathPageProps> = ({ params }) => {
  const { t } = useTranslation();
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
        if (isCompleted) {
          audioService.playContentPathDoneSound();
        }
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
    return content.find((c: ContentItem) => c.discoveryId === itemId);
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

  // Component for a single collapsible module card
  interface ModuleCardProps {
    section: TrailSection;
    findContentItem: (itemId: string) => ContentItem | undefined;
    learningPathId: string;
    handleProgressChange: (contentId: string, isCompleted: boolean) => Promise<void>;
    updatingContent: string | null;
    getContentTypeIcon: (contentType: string) => React.ReactNode;
  }

  const ModuleCard: React.FC<ModuleCardProps> = ({
    section,
    findContentItem,
    learningPathId,
    handleProgressChange,
    updatingContent,
    getContentTypeIcon,
  }) => {
    const isSectionCompleted = section.items.every(item => findContentItem(item.id)?.isCompleted);
    const [isOpen, setIsOpen] = useState(!isSectionCompleted); // Local state for collapsibility

    // Effect to update isOpen when isSectionCompleted changes
    useEffect(() => {
      setIsOpen(!isSectionCompleted);
    }, [isSectionCompleted]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className={`rounded-xl border transition-all duration-300 ${isSectionCompleted ? 'border-green-300 bg-green-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'}`}>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 cursor-pointer">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-800">{section.sectionTitle}</h2>
                  {isSectionCompleted && (
                    <Badge variant="secondary" className="bg-green-200 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
                      Concluído
                    </Badge>
                  )}
                </div>
                <ChevronDown className="h-5 w-5 text-gray-600 transition-transform duration-200 data-[state=open]:rotate-180" />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-5 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.items.map((item: { id: string; organizedDescription: string }, itemIndex: number) => {
                      const contentItem = findContentItem(item.id);
                      const isCompleted = contentItem?.isCompleted || false;

                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.4 }}
                          className="w-full"
                        >
                          <Card className={`relative w-full rounded-xl border transition-all duration-300 overflow-hidden ${isCompleted ? 'border-green-300 bg-green-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'}`}>
                            <div className="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden rounded-t-xl">
                              <img
                                src={contentItem?.thumbnail || '/placeholder.svg'}
                                alt={contentItem?.title || 'Content thumbnail'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-4">
                              <div className="absolute top-4 left-4 z-10">
                                {contentItem && (
                                  <div className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
                                    {getContentTypeIcon(contentItem.contentType)}
                                    <span className="capitalize">{contentItem.contentType}</span>
                                  </div>
                                )}
                              </div>
                              <div className="absolute top-4 right-4 z-10">
                                <Checkbox
                                  id={`item-${contentItem?.id}`}
                                  checked={isCompleted}
                                  onCheckedChange={(checked) => contentItem && handleProgressChange(contentItem.id, !!checked)}
                                  disabled={updatingContent === contentItem?.id}
                                  className="w-5 h-5 rounded-full border-gray-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                />
                              </div>

                              <CardTitle className="text-lg font-semibold text-gray-800 mt-2 mb-2">{contentItem?.title || 'Conteúdo não encontrado'}</CardTitle>
                              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{item.organizedDescription}</p>
                              {contentItem && (
                                <Link
                                  href={contentItem.id.startsWith('http') ? `/learning-paths/${learningPathId}/view?contentUrl=${encodeURIComponent(contentItem.id)}` : `/learning-paths/${learningPathId}/${contentItem.id}`}
                                  className="text-sm font-medium text-[#FF6B35] hover:text-[#E55A2B] transition-colors duration-200 flex items-center gap-1"
                                >
                                  {t('access_content')}
                                  <ArrowRight className="w-3 h-3" />
                                </Link>
                              )}
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </motion.div>
    );
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

  // Use the organizedTrail from the database if it exists, otherwise create a fallback.
  const displayTrail: TrailSection[] = learningPath.organizedTrail?.organizedTrail && learningPath.organizedTrail.organizedTrail.length > 0
    ? learningPath.organizedTrail.organizedTrail
    : [
        {
          sectionTitle: "Trilha de Aprendizado",
          items: (Array.isArray(content) ? content : []).map(c => ({
            id: c.id,
            organizedDescription: c.description || 'Acesse o conteúdo para mais detalhes.',
          })),
        },
      ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Voltar ao Dashboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-700">
              Progresso: {Math.round(progress || 0)}%
            </div>
            <div className="w-32 bg-gray-200 rounded-full h-2.5">
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
              <Sparkles className="w-3 h-3 mr-1.5" />
              {topic}
            </Badge>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">{title}</h1>
          <p className="text-gray-600 text-xl leading-relaxed mb-12">{description}</p>
        </motion.div>

        <div className="space-y-8">
          {displayTrail.length > 0 ? (
            displayTrail.map((section: TrailSection, sectionIndex: number) => (
              <ModuleCard
                key={sectionIndex}
                section={section}
                findContentItem={findContentItem}
                learningPathId={learningPathId}
                handleProgressChange={handleProgressChange}
                updatingContent={updatingContent}
                getContentTypeIcon={getContentTypeIcon}
              />
            ))
          ) : (
            <div className="text-center py-16">
              <h2 className="text-xl font-medium text-gray-800 mb-2">Nenhum conteúdo na trilha</h2>
              <p className="text-gray-600">Parece que esta trilha de aprendizado ainda não tem conteúdo.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LearningPathPage;