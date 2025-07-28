import type { ContentItem, ContentDiscoveryRequest, ContentType } from "@/types"

export class ContentDiscoveryService {
  static async discoverContent(request: ContentDiscoveryRequest): Promise<ContentItem[]> {
    const { topic, difficulty, contentTypes, culturalProfile, limit } = request

    const discoveredContent: ContentItem[] = []

    // YouTube content discovery
    if (contentTypes.includes("video")) {
      const youtubeContent = await this.searchYouTube(topic, difficulty, limit)
      discoveredContent.push(...youtubeContent)
    }

    // Medium articles
    if (contentTypes.includes("article")) {
      const mediumContent = await this.searchMedium(topic, difficulty, limit)
      discoveredContent.push(...mediumContent)
    }

    // GitHub repositories
    if (contentTypes.includes("tutorial")) {
      const githubContent = await this.searchGitHub(topic, difficulty, limit)
      discoveredContent.push(...githubContent)
    }

    // Score content based on cultural relevance
    const scoredContent = await this.scoreContentCulturally(discoveredContent, culturalProfile)

    // Sort by combined quality and cultural score
    return scoredContent
      .sort((a, b) => b.qualityScore + b.culturalScore - (a.qualityScore + a.culturalScore))
      .slice(0, limit)
  }

  private static async searchYouTube(topic: string, difficulty: string, limit: number): Promise<ContentItem[]> {
    if (!process.env.YOUTUBE_API_KEY) {
      console.warn("YouTube API key not configured")
      return []
    }

    try {
      const query = `${topic} ${difficulty} tutorial`
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${limit}&key=${process.env.YOUTUBE_API_KEY}`,
      )

      const data = await response.json()

      return (
        data.items?.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          type: "video" as ContentType,
          source: "youtube",
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          duration: null, // Would need additional API call
          difficulty: this.parseDifficulty(difficulty),
          culturalScore: 0,
          qualityScore: 0.7, // Base score
          metadata: {
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
            thumbnails: item.snippet.thumbnails,
          },
        })) || []
      )
    } catch (error) {
      console.error("YouTube search error:", error)
      return []
    }
  }

  private static async searchMedium(topic: string, difficulty: string, limit: number): Promise<ContentItem[]> {
    // Medium doesn't have a public API, so we'd use RSS feeds or web scraping
    // This is a placeholder implementation
    return []
  }

  private static async searchGitHub(topic: string, difficulty: string, limit: number): Promise<ContentItem[]> {
    if (!process.env.GITHUB_TOKEN) {
      console.warn("GitHub token not configured")
      return []
    }

    try {
      const query = `${topic} tutorial ${difficulty}`
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${limit}`,
        {
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
          },
        },
      )

      const data = await response.json()

      return (
        data.items?.map((item: any) => ({
          id: item.id.toString(),
          title: item.name,
          description: item.description || "",
          type: "tutorial" as ContentType,
          source: "github",
          url: item.html_url,
          difficulty: this.parseDifficulty(difficulty),
          culturalScore: 0,
          qualityScore: Math.min(item.stargazers_count / 1000, 1), // Normalize stars to 0-1
          metadata: {
            language: item.language,
            stars: item.stargazers_count,
            forks: item.forks_count,
            updatedAt: item.updated_at,
          },
        })) || []
      )
    } catch (error) {
      console.error("GitHub search error:", error)
      return []
    }
  }

  private static async scoreContentCulturally(content: ContentItem[], culturalProfile: any): Promise<ContentItem[]> {
    // This would integrate with Qloo API to score content based on cultural relevance
    // For now, return content with base cultural scores
    return content.map((item) => ({
      ...item,
      culturalScore: Math.random() * 0.5 + 0.5, // Placeholder: 0.5-1.0
    }))
  }

  private static parseDifficulty(difficulty: string): number {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return 1
      case "intermediate":
        return 3
      case "advanced":
        return 5
      default:
        return 2
    }
  }
}
