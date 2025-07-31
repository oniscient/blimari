"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Youtube, Github, Globe, FileText, BookOpen, Clock, Users, Star } from "lucide-react"
import Image from "next/image"
import { ContentItem } from "@/src/types" // Importar ContentItem do tipo global

interface ContentCardProps {
  item: ContentItem
  onClick: (item: ContentItem) => void
}

const getSourceIcon = (source: string) => {
  switch (source) {
    case "youtube":
      return <Youtube className="w-4 h-4 text-red-500" />
    case "github":
      return <Github className="w-4 h-4 text-gray-800" />
    case "web":
      return <Globe className="w-4 h-4 text-blue-500" />
    case "medium":
      return <FileText className="w-4 h-4 text-green-600" />
    case "books":
      return <BookOpen className="w-4 h-4 text-amber-600" />
    default:
      return <FileText className="w-4 h-4" />
  }
}

export function ContentCard({ item, onClick }: ContentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(item)}
      className="bg-white rounded-2xl p-4 border border-[#F1F5F9] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col h-full"
    >
      {item.thumbnail && item.type === "video" && (
        <div className="relative w-full h-32 rounded-lg overflow-hidden mb-3">
          <Image
            src={item.thumbnail}
            alt={item.title}
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <Youtube className="w-8 h-8 text-white" />
          </div>
        </div>
      )}
      <div className="flex flex-col items-start gap-2 mb-2">
        <div className="w-10 h-10 bg-[#F8FAFC] rounded-lg flex items-center justify-center flex-shrink-0">
          {getSourceIcon(item.source)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#2D3748] text-base line-clamp-2">{item.title}</h3>
          {item.author && (
            <p className="text-[#718096] text-xs line-clamp-1">{item.author}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-[#A0ADB8] mt-auto">
        {item.duration && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{item.duration}</span>
          </div>
        )}
        {item.rating && (
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-current text-yellow-400" />
            <span>{item.rating}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}