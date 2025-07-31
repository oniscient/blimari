// ==============================================
// BLIMARI - CORE TYPE DEFINITIONS
// ==============================================

export interface User {
  id: string
  email: string
  name: string
  passwordHash: string | null // Adicionado do seu schema Prisma
  avatarUrl?: string // Mapeado de avatar_url
  createdAt: Date
  updatedAt: Date
  // Relações omitidas para simplicidade nos tipos de dados brutos
}

export interface UserPreferences {
  culturalProfile: QlooProfile // Referência ao perfil Qloo
  learningStyle: "visual" | "auditory" | "kinesthetic" | "reading"
  contentTypes: ContentType[]
  language: string
  timezone: string
}

export interface QlooProfile {
  // Mapeado de CulturalProfile no seu schema
  id: string
  userId: string // Mapeado de user_id
  qlooTasteId?: string // Mapeado de qloo_taste_id
  preferences: Record<string, any>
  communicationStyle: Record<string, any> // Mapeado de communication_style
  lastSyncAt: Date // Mapeado de last_sync_at
  createdAt: Date
}

export interface LearningPath {
  id: string
  userId: string // Mapeado de user_id
  title: string
  topic: string
  difficulty: "beginner" | "intermediate" | "advanced" | string // Adicionado string para flexibilidade
  totalContent: number // Mapeado de total_content
  completedContent: number // Mapeado de completed_content
  estimatedDuration?: number // Mapeado de estimated_duration
  culturalProfileId?: string // Mapeado de cultural_profile_id
  status: "active" | "completed" | "paused" | "draft" | "archived" | string // Adicionado draft/archived e string
  createdAt: Date
  updatedAt: Date
  description: string
  progress: number
}

export interface ContentItem {
  // Mapeado de PathContent no seu schema
  id: string
  pathId?: string // Made optional for initial discovery
  title: string
  url: string
  contentType: ContentType // Mapeado de content_type
  durationMinutes?: number // Mapeado de duration_minutes
  orderIndex?: number // Made optional for initial discovery
  isCompleted?: boolean // Made optional for initial discovery
  completedAt?: Date // Mapeado de completed_at, made optional for initial discovery
  culturalEnhancements?: Record<string, any> // Mapeado de cultural_enhancements
  source?: string
  createdAt: Date

  // New fields for content discovery
  description?: string
  author?: string
  rating?: number
  thumbnail?: string
  difficulty?: number
  culturalScore: number
  qualityScore: number
  metadata?: Record<string, any>
}

export type ContentType = "video" | "article" | "tutorial" | "documentation" | "course" | "podcast" | "book"

export type ContentSource = "youtube" | "medium" | "github" | "dev.to" | "coursera" | "udemy" | "custom"

export interface Quiz {
  // Mapeado de PathQuiz no seu schema
  id: string
  pathId: string // Mapeado de path_id
  questions: Record<string, any> // JSONB
  passingScore: number // Mapeado de passing_score
  culturalAdaptations?: Record<string, any> // Mapeado de cultural_adaptations
  createdAt: Date
}

export interface QuizQuestion {
  id: string
  question: string
  category?: "experience" | "learning_style" | "goal"
  options: string[]
  correctAnswer: number
  explanation: string
  culturalContext?: string
  weight?: number
}

export interface QuizAttempt {
  id: string
  userId: string // Mapeado de user_id
  quizId: string // Mapeado de quiz_id
  score: number
  answers: Record<string, any> // JSONB
  passed: boolean
  completedAt: Date // Mapeado de completed_at
}

export interface Badge {
  // Mapeado de UserBadge no seu schema (parte da definição)
  id: string
  name: string // Mapeado de badge_name
  description?: string // Mapeado de badge_description
  icon?: string // Mapeado de badge_image_url
  color?: string // Não diretamente no seu schema, mas útil para UI
  criteria: BadgeCriteria // JSONB
  earnedAt: Date // Mapeado de earned_at
}

export interface BadgeCriteria {
  type: "completion" | "score" | "streak" | "custom"
  value: number
  pathId?: string
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// AI Integration Types
export interface GeminiRequest {
  prompt: string
  context?: string
  temperature?: number
  maxTokens?: number
}

export interface QlooRequest {
  userId: string
  content: string
  context: Record<string, any>
}

export interface ContentDiscoveryRequest {
  topic: string
  difficulty: string
  contentTypes: ContentType[]
  culturalProfile: QlooProfile
  limit: number
}
