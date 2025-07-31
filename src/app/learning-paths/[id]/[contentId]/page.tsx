"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { LearningPath, ContentItem, APIResponse } from '@/src/types';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ContentViewer } from '@/src/components/ContentViewer';
import { toast } from 'sonner';

interface ContentPageProps {
  params: {
    id: string;
    contentId: string;
  };
}

const ContentPage: React.FC<ContentPageProps> = ({ params }) => {
  const { id: learningPathId, contentId } = params;
  const router = useRouter();
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [contentItem, setContentItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    const fetchLearningPath = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/learning-paths/${learningPathId}`);
        if (!response.ok) throw new Error('Failed to fetch learning path');
        const result: APIResponse<LearningPath> = await response.json();
        if (result.success && result.data) {
          setLearningPath(result.data);
          const currentContent = result.data.content?.find(c => c.id === contentId);
          if (currentContent) {
            setContentItem(currentContent);
          } else {
            setError('Content item not found in this learning path.');
          }
        } else {
          setError(result.message || 'Failed to load learning path.');
        }
      } catch (err) {
        setError('An unexpected error occurred.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (learningPathId) {
      fetchLearningPath();
    }
  }, [learningPathId, contentId]);

  const { currentIndex, nextContentId, prevContentId } = useMemo(() => {
    if (!learningPath?.content) return { currentIndex: -1, nextContentId: null, prevContentId: null };
    const contentList = learningPath.content;
    const currentIndex = contentList.findIndex(c => c.id === contentId);
    const nextContentId = currentIndex > -1 && currentIndex < contentList.length - 1 ? contentList[currentIndex + 1].id : null;
    const prevContentId = currentIndex > 0 ? contentList[currentIndex - 1].id : null;
    return { currentIndex, nextContentId, prevContentId };
  }, [learningPath, contentId]);

  const handleProgressChange = async (isCompleted: boolean) => {
    setIsCompleting(true);
    try {
      const response = await fetch('/api/learning-paths/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ learningPathId, contentId, isCompleted }),
      });
      const result: APIResponse<LearningPath> = await response.json();
      if (response.ok && result.success && result.data) {
        setLearningPath(result.data);
        setContentItem(result.data.content?.find(c => c.id === contentId) || null);
        toast.success('Progresso atualizado!');
        if (isCompleted && nextContentId) {
          router.push(`/learning-paths/${learningPathId}/${nextContentId}`);
        }
      } else {
        throw new Error(result.message || 'Falha ao atualizar o progresso.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro inesperado.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#FF6B35] mx-auto" />
          <h2 className="text-xl font-medium text-[#2D3748] mb-2 mt-8">Carregando conteúdo...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-medium text-[#2D3748] mb-2">Ops! Algo deu errado</h2>
          <p className="text-[#718096] mb-6">{error}</p>
          <Button asChild className="bg-[#FF6B35] hover:bg-[#E55A2B]">
            <Link href={`/learning-paths/${learningPathId}`}>Voltar para a Trilha</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!contentItem) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-medium text-[#2D3748] mb-2">Conteúdo não encontrado</h2>
          <Button asChild className="bg-[#FF6B35] hover:bg-[#E55A2B]">
            <Link href={`/learning-paths/${learningPathId}`}>Voltar para a Trilha</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="text-gray-600 hover:text-gray-900 px-2">
              <Link href={`/learning-paths/${learningPathId}`} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar para a Trilha</span>
              </Link>
            </Button>
            <h1 className="text-lg font-semibold text-gray-800 truncate max-w-[calc(100vw-200px)] sm:max-w-md lg:max-w-xl">
              {contentItem.title}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              onClick={() => router.push(`/learning-paths/${learningPathId}/${prevContentId}`)}
              disabled={!prevContentId}
              variant="outline"
              size="sm"
              className="rounded-full px-3"
            >
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Anterior</span>
            </Button>
            <Button
              onClick={() => handleProgressChange(!contentItem.isCompleted)}
              disabled={isCompleting}
              variant={contentItem.isCompleted ? "secondary" : "default"}
              size="sm"
              className="rounded-full px-3 bg-[#FF6B35] hover:bg-[#E55A2B] text-white"
            >
              <CheckCircle className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">
                {contentItem.isCompleted ? 'Incompleto' : 'Concluído'}
              </span>
            </Button>
            <Button
              onClick={() => router.push(`/learning-paths/${learningPathId}/${nextContentId}`)}
              disabled={!nextContentId}
              variant="outline"
              size="sm"
              className="rounded-full px-3"
            >
              <span className="hidden sm:inline">Próximo</span>
              <ArrowRight className="w-4 h-4 sm:ml-2" />
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <ContentViewer item={contentItem} />
      </main>
    </div>
  );
};

export default ContentPage;