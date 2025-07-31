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

    // Articles
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
      return []
    }

    try {
      const query = `${topic} ${difficulty} tutorial`
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${limit}&key=${process.env.YOUTUBE_API_KEY}`

      const searchResponse = await fetch(searchUrl)
      const searchData = await searchResponse.json()

      if (!searchData.items) return []

      // Get video IDs for detailed info
      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',')
      
      // Fetch detailed video information including full descriptions
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${process.env.YOUTUBE_API_KEY}`
      
      const detailsResponse = await fetch(detailsUrl)
      const detailsData = await detailsResponse.json()

      return detailsData.items?.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description || "", // DESCRIÇÃO COMPLETA
        type: "video" as ContentType,
        source: "youtube",
        url: `https://www.youtube.com/watch?v=${item.id}`,
        duration: this.parseYouTubeDuration(item.contentDetails.duration),
        difficulty: this.parseDifficulty(difficulty),
        culturalScore: 0,
        qualityScore: this.calculateYouTubeQuality(item.statistics),
        metadata: {
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          thumbnails: item.snippet.thumbnails,
          viewCount: parseInt(item.statistics.viewCount || "0"),
          likeCount: parseInt(item.statistics.likeCount || "0"),
          commentCount: parseInt(item.statistics.commentCount || "0"),
          duration: item.contentDetails.duration,
          tags: item.snippet.tags || [],
          categoryId: item.snippet.categoryId,
        },
      })) || []
    } catch (error) {
      console.error("YouTube search error:", error)
      return []
    }
  }

  private static async searchGoogle(topic: string, difficulty: string, limit: number): Promise<ContentItem[]> {
    if (!process.env.GOOGLE_CUSTOM_SEARCH_API_KEY || !process.env.GOOGLE_CUSTOM_SEARCH_CX) {
      console.warn("Google Custom Search API key or CX not configured")
      return []
    }

    try {
      const query = `${topic} ${difficulty} tutorial guide`
      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_CUSTOM_SEARCH_API_KEY}&cx=${process.env.GOOGLE_CUSTOM_SEARCH_CX}&q=${encodeURIComponent(query)}&num=${limit}`

      const response = await fetch(searchUrl)
      const data = await response.json()

      if (!data.items) return []

      // Fetch full content for each article
      const articlesWithFullContent = await Promise.all(
        data.items.map(async (item: any) => {
          const fullDescription = await this.fetchFullArticleContent(item.link)
          
          return {
            id: item.link,
            title: item.title,
            description: fullDescription || item.snippet, // DESCRIÇÃO COMPLETA ou fallback
            type: "article" as ContentType,
            source: "web-article",
            url: item.link,
            duration: this.estimateReadingTime(fullDescription || item.snippet),
            difficulty: this.parseDifficulty(difficulty),
            culturalScore: 0,
            qualityScore: this.calculateArticleQuality(item, fullDescription),
            metadata: {
              displayLink: item.displayLink,
              snippet: item.snippet,
              pagemap: item.pagemap,
              wordCount: fullDescription ? fullDescription.split(' ').length : 0,
              readingTimeMinutes: this.estimateReadingTime(fullDescription || item.snippet),
            },
          }
        })
      )

      return articlesWithFullContent
    } catch (error) {
      console.error("Google search error:", error)
      return []
    }
  }

  private static async searchGitHub(topic: string, difficulty: string, limit: number): Promise<ContentItem[]> {
    if (!process.env.GITHUB_TOKEN) {
      console.warn("GitHub token not configured")
      return []
    }

    try {
      const query = `${topic} tutorial ${difficulty}`
      const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${limit}`
      
      const response = await fetch(searchUrl, {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      })

      const data = await response.json()

      if (!data.items) return []

      // Fetch README content for each repository
      const reposWithFullContent = await Promise.all(
        data.items.map(async (item: any) => {
          const readmeContent = await this.fetchGitHubReadme(item.full_name)
          
          return {
            id: item.id.toString(),
            title: item.name,
            description: readmeContent || item.description || "", // README COMPLETO ou fallback
            type: "tutorial" as ContentType,
            source: "github",
            url: item.html_url,
            duration: this.estimateReadingTime(readmeContent || item.description || ""),
            difficulty: this.parseDifficulty(difficulty),
            culturalScore: 0,
            qualityScore: this.calculateGitHubQuality(item),
            metadata: {
              fullName: item.full_name,
              language: item.language,
              stars: item.stargazers_count,
              forks: item.forks_count,
              issues: item.open_issues_count,
              updatedAt: item.updated_at,
              createdAt: item.created_at,
              size: item.size,
              hasWiki: item.has_wiki,
              hasPages: item.has_pages,
              license: item.license?.name,
              topics: item.topics || [],
              readmeWordCount: readmeContent ? readmeContent.split(' ').length : 0,
            },
          }
        })
      )

      return reposWithFullContent
    } catch (error) {
      console.error("GitHub search error:", error)
      return []
    }
  }

  // Fetch full article content using web scraping or API
  private static async fetchFullArticleContent(url: string): Promise<string | null> {
    try {
      // Option 1: Use a service like Mercury Parser or similar
      // Option 2: Implement basic web scraping (cuidado com rate limits)
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ContentBot/1.0)',
        },
      })
      
      if (!response.ok) return null
      
      const html = await response.text()
      
      // Extract main content (implementação básica)
      const content = this.extractMainContent(html)
      return content
    } catch (error) {
      console.warn(`Failed to fetch full content for ${url}:`, error)
      return null
    }
  }

  // Fetch GitHub README content
  private static async fetchGitHubReadme(fullName: string): Promise<string | null> {
    try {
      const readmeUrl = `https://api.github.com/repos/${fullName}/readme`
      
      const response = await fetch(readmeUrl, {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.raw",
        },
      })

      if (!response.ok) return null
      
      const readmeContent = await response.text()
      return readmeContent
    } catch (error) {
      console.warn(`Failed to fetch README for ${fullName}:`, error)
      return null
    }
  }

  // Extract main content from HTML (implementação básica)
  private static extractMainContent(html: string): string {
    // Remove scripts, styles, and other non-content elements
    let content = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    // Take first 2000 characters as a reasonable description
    return content.substring(0, 2000) + (content.length > 2000 ? '...' : '')
  }

  // Parse YouTube duration from ISO 8601 format
  private static parseYouTubeDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return 0
    
    const hours = parseInt(match[1] || '0')
    const minutes = parseInt(match[2] || '0')
    const seconds = parseInt(match[3] || '0')
    
    return hours * 60 + minutes + Math.round(seconds / 60)
  }

  // Estimate reading time based on content length
  private static estimateReadingTime(content: string): number {
    const wordsPerMinute = 200
    const wordCount = content.split(' ').length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  // Calculate YouTube video quality score
  private static calculateYouTubeQuality(stats: any): number {
    const views = parseInt(stats.viewCount || "0")
    const likes = parseInt(stats.likeCount || "0")
    const comments = parseInt(stats.commentCount || "0")
    
    const engagement = views > 0 ? (likes + comments) / views : 0
    const popularityScore = Math.min(views / 100000, 1) // Normalize to 0-1
    const engagementScore = Math.min(engagement * 1000, 1) // Normalize to 0-1
    
    return (popularityScore * 0.6 + engagementScore * 0.4)
  }

  // Calculate article quality score
  private static calculateArticleQuality(item: any, fullContent: string | null): number {
    let score = 0.5 // Base score
    
    // Boost for having full content
    if (fullContent && fullContent.length > 1000) score += 0.2
    
    // Boost for trusted domains
    const trustedDomains = ['medium.com', 'dev.to', 'stackoverflow.com', 'github.io']
    if (trustedDomains.some(domain => item.displayLink.includes(domain))) {
      score += 0.2
    }
    
    return Math.min(score, 1)
  }

  // Calculate GitHub repository quality score
  private static calculateGitHubQuality(repo: any): number {
    const stars = repo.stargazers_count
    const forks = repo.forks_count
    const issues = repo.open_issues_count
    const isRecent = new Date(repo.updated_at) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    
    let score = Math.min(stars / 1000, 0.6) // Stars contribute up to 0.6
    score += Math.min(forks / 100, 0.2) // Forks contribute up to 0.2
    score += isRecent ? 0.1 : 0 // Recent updates get bonus
    score += repo.has_wiki ? 0.05 : 0 // Documentation bonus
    score += issues < 10 ? 0.05 : 0 // Low issues bonus
    
    return Math.min(score, 1)
  }

  private static async scoreContentCulturally(content: ContentItem[], culturalProfile: any): Promise<ContentItem[]> {
    // Integrate with Qloo API or implement cultural scoring logic
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