import { type NextRequest, NextResponse } from "next/server"
import { ContentDiscoveryService } from "@/src/services/content/discovery.service"
import { ContentType } from "@/src/types"

export async function POST(request: NextRequest) {
  try {
    const { topic, sources, answers } = await request.json()

    if (!topic || !sources || !Array.isArray(sources)) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const contentTypes: ContentType[] = sources.map((source: string): ContentType | undefined => {
      switch (source) {
        case "youtube":
          return "video"
        case "github":
          return "tutorial" // Assuming github is for tutorials/code
        case "google-search":
          return "article"
        case "web":
          return "article" // Assuming web is for general articles
        case "books":
          return "book" // Assuming books is for book content
        default:
          return undefined // Handle unknown sources
      }
    }).filter((type): type is ContentType => type !== undefined); // Filter out undefined if any source is not mapped

    const discoveredContent = await ContentDiscoveryService.discoverContent({
      topic,
      difficulty: "beginner", // Placeholder
      contentTypes,
      culturalProfile: {
        id: "placeholder-id",
        userId: "placeholder-user-id",
        preferences: {},
        communicationStyle: {},
        lastSyncAt: new Date(),
        createdAt: new Date(),
      },
      limit: 10,
    })

    console.log("API /api/content/discover: Discovered content:", discoveredContent)

    return NextResponse.json({
      success: true,
      content: discoveredContent,
    })
  } catch (error) {
    console.error("Error discovering content:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
