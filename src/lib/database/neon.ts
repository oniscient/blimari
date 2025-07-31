import { neon } from "@neondatabase/serverless"
import { v4 as uuidv4 } from 'uuid'; // Importar uuid
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

  async updateUser(id: string, updateData: Partial<User>) {
    const [updatedUser] = await sql`
      UPDATE users
      SET
        id = COALESCE(${updateData.id}, id),
        email = COALESCE(${updateData.email}, email),
        name = COALESCE(${updateData.name}, name),
        avatar_url = COALESCE(${updateData.avatarUrl || null}, avatar_url),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, email, name, avatar_url as "avatarUrl", created_at as "createdAt", updated_at as "updatedAt"
    `;
    return updatedUser as User;
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
  async createLearningPath(pathData: Partial<LearningPath> & { content?: ContentItem[] }) {
    const newId = pathData.id || uuidv4();
    const contentItems = pathData.content || [];

    const results = await sql.transaction((tx) => {
      const queries = [];

      const pathQuery = tx`
        INSERT INTO learning_paths (id, user_id, title, topic, difficulty, total_content, completed_content, estimated_duration, cultural_profile_id, status, created_at, updated_at, organized_trail, progress)
        VALUES (
          ${newId},
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
          NOW(),
          ${pathData.organizedTrail ? JSON.stringify(pathData.organizedTrail) : null},
          ${pathData.progress || 0}
        )
        RETURNING id, user_id as "userId", title, topic, difficulty, total_content as "totalContent", completed_content as "completedContent", estimated_duration as "estimatedDuration", cultural_profile_id as "culturalProfileId", status, created_at as "createdAt", updated_at as "updatedAt", organized_trail as "organizedTrail", progress
      `;
      queries.push(pathQuery);

      if (contentItems.length > 0) {
        for (let i = 0; i < contentItems.length; i++) {
          const item = contentItems[i];
          const contentQuery = tx`
            INSERT INTO path_content (id, path_id, title, url, content_type, duration_minutes, order_index, is_completed, source, created_at)
            VALUES (
              ${uuidv4()},
              ${newId},
              ${item.title},
              ${item.url},
              ${item.contentType || item.type},
              ${item.durationMinutes || null},
              ${i},
              false,
              ${item.source},
              NOW()
            )
          `;
          queries.push(contentQuery);
        }
      }
      
      return queries;
    });

    return results[0][0] as LearningPath;
  },

  async getLearningPathsByUserId(userId: string) {
    const paths = await sql`
    SELECT id, user_id as "userId", title, topic, difficulty, total_content as "totalContent", completed_content as "completedContent", estimated_duration as "estimatedDuration", cultural_profile_id as "culturalProfileId", status, created_at as "createdAt", updated_at as "updatedAt", organized_trail as "organizedTrail", progress
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

  async getLearningPathById(id: string) {
    const result = await sql`
      SELECT
        lp.id, lp.user_id as "userId", lp.title, lp.topic, lp.difficulty, lp.total_content as "totalContent", lp.completed_content as "completedContent", lp.estimated_duration as "estimatedDuration", lp.cultural_profile_id as "culturalProfileId", lp.status, lp.created_at as "createdAt", lp.updated_at as "updatedAt", lp.organized_trail as "organizedTrail", lp.progress,
        pc.id as content_id, pc.path_id as content_path_id, pc.title as content_title, pc.url as content_url, pc.content_type as content_type, pc.duration_minutes as content_duration_minutes, pc.order_index as content_order_index, pc.is_completed as content_is_completed, pc.completed_at as content_completed_at, pc.cultural_enhancements as content_cultural_enhancements, pc.source as content_source, pc.created_at as content_created_at
      FROM learning_paths lp
      LEFT JOIN path_content pc ON lp.id = pc.path_id
      WHERE lp.id = ${id}
      ORDER BY pc.order_index ASC
    `;

    if (result.length === 0) {
      return undefined;
    }

    const learningPath: LearningPath = {
      id: result[0].id,
      userId: result[0].userId,
      title: result[0].title,
      topic: result[0].topic,
      difficulty: result[0].difficulty,
      totalContent: result[0].totalContent,
      completedContent: result[0].completedContent,
      estimatedDuration: result[0].estimatedDuration,
      culturalProfileId: result[0].culturalProfileId,
      status: result[0].status,
      createdAt: result[0].createdAt,
      updatedAt: result[0].updatedAt,
      description: result[0].description || '', // Assuming description is a string, default to empty
      progress: 0, // Será recalculado abaixo
      organizedTrail: result[0].organizedTrail,
      content: [],
    };

    result.forEach((row: any) => {
      if (row.content_id) {
        learningPath.content?.push({
          id: row.content_id,
          pathId: row.content_path_id,
          title: row.content_title,
          url: row.content_url,
          contentType: row.content_type,
          durationMinutes: row.content_duration_minutes,
          orderIndex: row.content_order_index,
          isCompleted: row.content_is_completed,
          completedAt: row.content_completed_at,
          culturalEnhancements: row.content_cultural_enhancements,
          source: row.content_source,
          createdAt: row.content_created_at,
          type: row.content_type, // Assuming content_type can also be used for 'type'
          culturalScore: row.content_cultural_score || 0, // Default to 0 if not in query
          qualityScore: row.content_quality_score || 0, // Default to 0 if not in query
        });
      }
    });

    // Recalcular o progresso com base no conteúdo
    if (learningPath.content && learningPath.content.length > 0) {
      const completed = learningPath.content.filter(c => c.isCompleted).length;
      learningPath.progress = Math.round((completed / learningPath.content.length) * 100);
    }

    return learningPath;
  },

  async getContentItemById(id: string) {
    const [item] = await sql`
      SELECT id, path_id as "pathId", title, url, content_type as "contentType", duration_minutes as "durationMinutes", order_index as "orderIndex", is_completed as "isCompleted", completed_at as "completedAt", cultural_enhancements as "culturalEnhancements", source, created_at as "createdAt"
      FROM path_content
      WHERE id = ${id}
    `;
    return item as ContentItem | undefined;
  },

  async getContentItemByUrl(url: string) {
    const [item] = await sql`
      SELECT id, path_id as "pathId", title, url, content_type as "contentType", duration_minutes as "durationMinutes", order_index as "orderIndex", is_completed as "isCompleted", completed_at as "completedAt", cultural_enhancements as "culturalEnhancements", source, created_at as "createdAt"
      FROM path_content
      WHERE url = ${url}
    `;
    return item as ContentItem | undefined;
  },

  async findNextLessonForUser(userId: string) {
    const learningPaths = await db.getLearningPathsByUserId(userId);

    for (const path of learningPaths) {
      const contentItems = await db.getContentItemsByPathId(path.id);
      const nextIncompleteLesson = contentItems.find(item => !item.isCompleted);
      if (nextIncompleteLesson) {
        return {
          learningPathId: path.id,
          learningPathTitle: path.title,
          lessonId: nextIncompleteLesson.id,
          lessonTitle: nextIncompleteLesson.title,
          lessonUrl: nextIncompleteLesson.url,
          lessonType: nextIncompleteLesson.contentType,
        };
      }
    }
    return null;
  },
}
