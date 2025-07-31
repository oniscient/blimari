"use client";

import React from 'react';
import { ContentItem } from '@/src/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';

export interface ContentViewerProps {
  item: ContentItem;
}

const YouTubePlayer = ({ url }: { url: string }) => {
  const videoId = new URL(url).searchParams.get('v');
  if (!videoId) {
    return <p>Invalid YouTube URL</p>;
  }
  const embedUrl = `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0`;
  return (
    <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
      <iframe
        src={embedUrl}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full rounded-lg"
      ></iframe>
    </div>
  );
};

const ArticleViewer = ({ url }: { url: string }) => {
  return (
    <iframe
      src={url}
      className="w-full h-screen border-0 rounded-lg"
      title="Content Viewer"
    ></iframe>
  );
};

export const ContentViewer: React.FC<ContentViewerProps> = ({ item }) => {
  const renderContent = () => {
    switch (item.contentType.toLowerCase()) {
      case 'video':
        return <YouTubePlayer url={item.url} />;
      case 'article':
      case 'tutorial':
      case 'documentation':
        return <ArticleViewer url={item.url} />;
      default:
        return (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">
              Este tipo de conteúdo não pode ser exibido diretamente.
            </p>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block bg-[#FF6B35] text-white px-6 py-2 rounded-full"
            >
              Acessar Conteúdo Externamente
            </a>
          </div>
        );
    }
  };

  return (
    <Card className="overflow-hidden rounded-xl shadow-lg border border-gray-200 bg-white">
      <CardContent className="p-0">
        {renderContent()}
      </CardContent>
    </Card>
  );
};