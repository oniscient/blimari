"use client"

import type React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog"
import { Button } from "@/src/components/ui/button"
import Image from "next/image"
import { Youtube, Github, Globe, FileText, BookOpen, Clock, Users, Star, X } from "lucide-react"

interface ContentItem {
  id: string
  title: string
  description: string
  url: string
  source: string
  type: string
  duration?: string
  author?: string
  rating?: number
  thumbnail?: string
}

interface ContentDetailsPopupProps {
  isOpen: boolean
  onClose: () => void
  item: ContentItem | null
}

const getSourceIcon = (source: string) => {
  switch (source) {
    case "youtube":
      return <Youtube className="w-5 h-5 text-red-500" />
    case "github":
      return <Github className="w-5 h-5 text-gray-800" />
    case "web":
      return <Globe className="w-5 h-5 text-blue-500" />
    case "medium":
      return <FileText className="w-5 h-5 text-green-600" />
    case "books":
      return <BookOpen className="w-5 h-5 text-amber-600" />
    default:
      return <FileText className="w-5 h-5" />
  }
}

export function ContentDetailsPopup({ isOpen, onClose, item }: ContentDetailsPopupProps) {
  if (!item) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2D3748]">{item.title}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {item.thumbnail && item.type === "video" && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <Image
                src={item.thumbnail}
                alt={item.title}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <Youtube className="w-12 h-12 text-white" />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm text-[#718096]">
            <div className="flex items-center gap-1">
              {getSourceIcon(item.source)}
              <span>{item.source.charAt(0).toUpperCase() + item.source.slice(1)}</span>
            </div>
            {item.author && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{item.author}</span>
              </div>
            )}
            {item.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{item.duration}</span>
              </div>
            )}
            {item.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-current text-yellow-400" />
                <span>{item.rating}</span>
              </div>
            )}
          </div>

          <DialogDescription className="text-[#718096] text-base leading-relaxed">
            {item.description}
          </DialogDescription>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 py-2 rounded-full text-[#718096] border-[#E2E8F0] hover:bg-[#F1F5F9]"
          >
            Fechar
          </Button>
          <Button
            onClick={() => window.open(item.url, "_blank")}
            className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white px-6 py-2 rounded-full font-medium transition-colors duration-200"
          >
            Ver Original
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}