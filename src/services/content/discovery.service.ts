import type { ContentItem, ContentDiscoveryRequest, ContentType } from "@/src/types"

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
      const googleContent = await this.searchGoogle(topic, difficulty, limit)
      discoveredContent.push(...googleContent)
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
      console.log("YOUTUBE_API_KEY:", process.env.YOUTUBE_API_KEY); // Log API key status
      return []
    }

    try {
      const query = `${topic} ${difficulty} tutorial`
      const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${limit}&key=${process.env.YOUTUBE_API_KEY}`;
      console.log("Constructed YouTube API URL:", youtubeApiUrl); // Log constructed URL

      const response = await fetch(youtubeApiUrl)
      console.log("Raw YouTube API response status:", response.status); // Log raw response status
      console.log("Raw YouTube API response OK:", response.ok); // Log raw response ok status

      const data = await response.json()
      console.log("Parsed YouTube API response data:", data); // Log raw response data

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
      console.error("YouTube search error:", error); // Existing error log
      console.error("Detailed YouTube search error:", error); // Add detailed error log
      return []
    }
  }

  private static async searchGoogle(topic: string, difficulty: string, limit: number): Promise<ContentItem[]> {
    if (!process.env.GOOGLE_CUSTOM_SEARCH_API_KEY || !process.env.GOOGLE_CUSTOM_SEARCH_CX) {
      console.warn("Google Custom Search API key or CX not configured for Google search")
      return []
    }

    try {
      const query = `${topic} ${difficulty} blog post` // Targeting general blog posts
      const customSearchApiUrl = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_CUSTOM_SEARCH_API_KEY}&cx=${process.env.GOOGLE_CUSTOM_SEARCH_CX}&q=${encodeURIComponent(query)}&num=${limit}`;

      const response = await fetch(customSearchApiUrl);
      const data = await response.json();

      if (data.items) {
        return data.items.map((item: any) => ({
          id: item.link, // Using link as ID for uniqueness
          title: item.title,
          description: item.snippet,
          type: "article" as ContentType,
          source: "google-search",
          url: item.link,
          durationMinutes: null, // Custom Search API doesn't provide duration
          difficulty: this.parseDifficulty(difficulty),
          culturalScore: 0, // Placeholder
          qualityScore: 0.6, // Base score for articles
          metadata: {
            displayLink: item.displayLink,
            pagemap: item.pagemap, // Contains rich snippets like image, author, etc.
          },
        }));
      }
      return [];
    } catch (error) {
      console.error("Google Custom Search (Google Search) error:", error);
      return [];
    }
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
