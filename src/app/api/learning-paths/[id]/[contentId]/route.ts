import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/database/neon';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; contentId: string } }
) {
  try {
    const { contentId } = params; // This can be a UUID or an encoded URL

    if (!contentId) {
      return NextResponse.json({ success: false, message: 'Content identifier is required' }, { status: 400 });
    }

    let contentItem;

    // Attempt to fetch by UUID first
    if (contentId.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
      contentItem = await db.getContentItemById(contentId);
    }

    // If not found by UUID or if it's a URL, attempt to fetch by URL
    if (!contentItem && contentId.startsWith('http')) {
      const decodedUrl = decodeURIComponent(contentId);
      contentItem = await db.getContentItemByUrl(decodedUrl);
    } else if (!contentItem) {
      // Fallback for cases where it's not a UUID and not a URL (e.g., malformed data)
      contentItem = await db.getContentItemById(contentId);
    }

    if (!contentItem) {
      return NextResponse.json({ success: false, message: 'Content item not found' }, { status: 404 });
    }

    // If the content type is an article, tutorial, or documentation, fetch its HTML content
    if (['article', 'tutorial', 'documentation'].includes(contentItem.contentType.toLowerCase())) {
      try {
        const externalResponse = await fetch(contentItem.url);
        if (!externalResponse.ok) {
          throw new Error(`Failed to fetch external content: ${externalResponse.statusText}`);
        }
        const htmlContent = await externalResponse.text();
        return NextResponse.json({ success: true, data: { ...contentItem, htmlContent } });
      } catch (fetchError) {
        console.error(`Error fetching external content from ${contentItem.url}:`, fetchError);
        return NextResponse.json({ success: false, message: 'Failed to load external content' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, data: contentItem });
  } catch (error) {
    console.error('Error fetching content item:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}