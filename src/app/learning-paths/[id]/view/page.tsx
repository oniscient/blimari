"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { LearningPath, ContentItem, APIResponse } from '@/src/types';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ContentViewer } from '@/src/components/ContentViewer';
import { toast } from 'sonner';
import { audioService } from '@/src/services/audio.service';

interface ContentPageProps {
  params: {
    id: string;
  };
}

const ContentViewPage: React.FC<ContentPageProps> = ({ params }) => {
  const { id: learningPathId } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const contentUrl = searchParams.get('contentUrl');
  const contentIdFromUrl = searchParams.get('contentId'); // This will be the UUID for new content

  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [contentItem, setContentItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        let apiUrl = '';
        let currentContentId = '';

        if (contentIdFromUrl) {
          // If contentId (UUID) is present, use the existing API route
          apiUrl = `/api/learning-paths/${learningPathId}/${contentIdFromUrl}`;
          currentContentId = contentIdFromUrl;
        } else if (contentUrl) {
          // If contentUrl is present, use a new API route or modify existing one to fetch by URL
          // For now, we'll assume the existing API route can handle URL as ID for legacy data
          // This will be addressed in the next step (modifying the API route)
          apiUrl = `/api/learning-paths/${learningPathId}/${encodeURIComponent(contentUrl)}`;
          currentContentId = contentUrl; // Use URL as ID for fetching legacy data
        } else {
          setError('Content identifier is missing.');
          setLoading(false);
          return;
        }

        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Failed to fetch content item');
        const result: APIResponse<ContentItem> = await response.json();
        if (result.success && result.data) {
          setContentItem(result.data);
          // Fetch the full learning path to get navigation details
          const pathResponse = await fetch(`/api/learning-paths/${learningPathId}`);
          if (!pathResponse.ok) throw new Error('Failed to fetch learning path for navigation');
          const pathResult: APIResponse<LearningPath> = await pathResponse.json();
          if (pathResult.success && pathResult.data) {
            setLearningPath(pathResult.data);
          } else {
            setError(pathResult.message || 'Failed to load learning path for navigation.');
          }
        } else {
          setError(result.message || 'Failed to load content item.');
        }
      } catch (err) {
        setError('An unexpected error occurred.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (learningPathId && (contentUrl || contentIdFromUrl)) {
      fetchContent();
    }
  }, [learningPathId, contentUrl, contentIdFromUrl]);

  const { currentIndex, nextContentId, prevContentId } = useMemo(() => {
    if (!learningPath?.content || !contentItem) return { currentIndex: -1, nextContentId: null, prevContentId: null };
    const contentList = learningPath.content;
    const currentIdentifier = contentItem.id; // Use the actual ID from the fetched contentItem

    const currentIndex = contentList.findIndex(c => c.id === currentIdentifier);
    const nextContent = currentIndex > -1 && currentIndex < contentList.length - 1 ? contentList[currentIndex + 1] : null;
    const prevContent = currentIndex > 0 ? contentList[currentIndex - 1] : null;

    // Determine the next/prev URLs based on whether they are UUIDs or URLs
    const getNavigationUrl = (item: ContentItem | null) => {
      if (!item) return null;
      if (item.id.startsWith('http')) {
        return `/learning-paths/${learningPathId}/view?contentUrl=${encodeURIComponent(item.id)}`;
      }
      return `/learning-paths/${learningPathId}/${item.id}`;
    };

    return {
      currentIndex,
      nextContentId: getNavigationUrl(nextContent),
      prevContentId: getNavigationUrl(prevContent)
    };
  }, [learningPath, contentItem, learningPathId]);

  const handleProgressChange = async (isCompleted: boolean) => {
    setIsCompleting(true);
    try {
      // Use the actual contentItem.id (which should be the UUID after the fix)
      const response = await fetch('/api/learning-paths/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ learningPathId, contentId: contentItem?.id, isCompleted }),
      });
      const result: APIResponse<LearningPath> = await response.json();
      if (response.ok && result.success && result.data) {
        setLearningPath(result.data);
        setContentItem(result.data.content?.find(c => c.id === contentItem?.id) || null);
        if (isCompleted) {
          audioService.playContentPathDoneSound();
        }
        toast.success('Progresso atualizado!');
        if (isCompleted && nextContentId) {
          router.push(nextContentId);
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
              onClick={() => prevContentId && router.push(prevContentId)}
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
              onClick={() => nextContentId && router.push(nextContentId)}
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

export default ContentViewPage;