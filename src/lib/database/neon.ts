import { neon } from "@neondatabase/serverless"
import type { User, LearningPath, ContentItem, QlooProfile } from "../../types"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

// Create reusable SQL client
export const sql = neon(process.env.DATABASE_URL)

// Database connection test
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time`
    console.log("✅ Database connected successfully:", result[0].current_time)
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}

// Helper functions for common queries, adjusted to your Prisma schema's table/column names
export const db = {
  // Users
  async createUser(userData: Partial<User> & { passwordHash: string | null }) {
    const [user] = await sql`
    INSERT INTO users (id, email, name, "passwordHash", avatar_url, created_at, updated_at)
    VALUES (${userData.id}, ${userData.email}, ${userData.name}, ${userData.passwordHash}, ${userData.avatarUrl || null}, NOW(), NOW())
    RETURNING id, email, name, avatar_url as "avatarUrl", created_at as "createdAt", updated_at as "updatedAt"
  `
    return user as User
  },

  async getUserById(id: string) {
    const [user] =
      await sql`SELECT id, email, name, avatar_url as "avatarUrl", created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE id = ${id}`
    return user as User | undefined
  },

  async getUserByEmail(email: string) {
    const [user] =
      await sql`SELECT id, email, name, "passwordHash", avatar_url as "avatarUrl", created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE email = ${email}`
    return user as User | undefined
  },

  // Cultural Profiles (mapped from cultural_profiles)
  async createCulturalProfile(profileData: Partial<QlooProfile>) {
    const [profile] = await sql`
    INSERT INTO cultural_profiles (id, user_id, qloo_taste_id, preferences, communication_style, last_sync_at, created_at)
    VALUES (${profileData.id}, ${profileData.userId}, ${profileData.qlooTasteId || null}, ${JSON.stringify(profileData.preferences || {})}, ${JSON.stringify(profileData.communicationStyle || {})}, NOW(), NOW())
    RETURNING id, user_id as "userId", qloo_taste_id as "qlooTasteId", preferences, communication_style as "communicationStyle", last_sync_at as "lastSyncAt", created_at as "createdAt"
  `
    return profile as QlooProfile
  },

  async getCulturalProfileByUserId(userId: string) {
    const [profile] =
      await sql`SELECT id, user_id as "userId", qloo_taste_id as "qlooTasteId", preferences, communication_style as "communicationStyle", last_sync_at as "lastSyncAt", created_at as "createdAt" FROM cultural_profiles WHERE user_id = ${userId}`
    return profile as QlooProfile | undefined
  },

  // Learning Paths
  async createLearningPath(pathData: Partial<LearningPath>) {
    const [newPath] = await sql`
    INSERT INTO learning_paths (id, user_id, title, topic, difficulty, total_content, completed_content, estimated_duration, cultural_profile_id, status, created_at, updated_at)
    VALUES (
      ${pathData.id},
      ${pathData.userId},
      ${pathData.title},
      ${pathData.topic},
      ${pathData.difficulty || "beginner"},
      ${pathData.totalContent || 0},
      ${pathData.completedContent || 0},
      ${pathData.estimatedDuration || null},
      ${pathData.culturalProfileId || null},
      ${pathData.status || "draft"},
      NOW(),
      NOW()
    )
    RETURNING id, user_id as "userId", title, topic, difficulty, total_content as "totalContent", completed_content as "completedContent", estimated_duration as "estimatedDuration", cultural_profile_id as "culturalProfileId", status, created_at as "createdAt", updated_at as "updatedAt"
  `
    return newPath as LearningPath
  },

  async getLearningPathsByUserId(userId: string) {
    const paths = await sql`
    SELECT id, user_id as "userId", title, topic, difficulty, total_content as "totalContent", completed_content as "completedContent", estimated_duration as "estimatedDuration", cultural_profile_id as "culturalProfileId", status, created_at as "createdAt", updated_at as "updatedAt"
    FROM learning_paths
    WHERE user_id = ${userId}
    ORDER BY updated_at DESC
  `
    return paths as LearningPath[]
  },

  async updateLearningPathProgress(pathId: string, progress: number, completedContent?: number) {
    const [updatedPath] = await sql`
    UPDATE learning_paths
    SET progress = ${progress},
        completed_content = ${completedContent !== undefined ? completedContent : sql`completed_content`},
        updated_at = NOW()
    WHERE id = ${pathId}
    RETURNING id, user_id as "userId", title, topic, difficulty, total_content as "totalContent", completed_content as "completedContent", estimated_duration as "estimatedDuration", cultural_profile_id as "culturalProfileId", status, created_at as "createdAt", updated_at as "updatedAt"
  `
    return updatedPath as LearningPath
  },

  // Content Items (mapped from path_content)
  async createContentItem(contentData: Partial<ContentItem>) {
    const [newItem] = await sql`
    INSERT INTO path_content (id, path_id, title, url, content_type, duration_minutes, order_index, is_completed, completed_at, cultural_enhancements, source, created_at)
    VALUES (
      ${contentData.id},
      ${contentData.pathId},
      ${contentData.title},
      ${contentData.url},
      ${contentData.contentType},
      ${contentData.durationMinutes || null},
      ${contentData.orderIndex},
      ${contentData.isCompleted || false},
      ${contentData.completedAt || null},
      ${JSON.stringify(contentData.culturalEnhancements || {})},
      ${contentData.source || null},
      NOW()
    )
    RETURNING id, path_id as "pathId", title, url, content_type as "contentType", duration_minutes as "durationMinutes", order_index as "orderIndex", is_completed as "isCompleted", completed_at as "completedAt", cultural_enhancements as "culturalEnhancements", source, created_at as "createdAt"
  `
    return newItem as ContentItem
  },

  async getContentItemsByPathId(pathId: string) {
    const items = await sql`
    SELECT id, path_id as "pathId", title, url, content_type as "contentType", duration_minutes as "durationMinutes", order_index as "orderIndex", is_completed as "isCompleted", completed_at as "completedAt", cultural_enhancements as "culturalEnhancements", source, created_at as "createdAt"
    FROM path_content
    WHERE path_id = ${pathId}
    ORDER BY order_index ASC
  `
    return items as ContentItem[]
  },

  async updateContentItemCompletion(contentId: string, isCompleted: boolean) {
    const [updatedItem] = await sql`
    UPDATE path_content
    SET is_completed = ${isCompleted},
        completed_at = ${isCompleted ? sql`NOW()` : null}
    WHERE id = ${contentId}
    RETURNING id, path_id as "pathId", title, url, content_type as "contentType", duration_minutes as "durationMinutes", order_index as "orderIndex", is_completed as "isCompleted", completed_at as "completedAt", cultural_enhancements as "culturalEnhancements", source, created_at as "createdAt"
  `
    return updatedItem as ContentItem
  },
}
