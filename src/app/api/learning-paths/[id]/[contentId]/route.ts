import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/database/neon';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; contentId: string } }
) {
  try {
    const { contentId } = params;

    if (!contentId) {
      return NextResponse.json({ success: false, message: 'Content ID is required' }, { status: 400 });
    }

    const contentItem = await db.getContentItemById(contentId);

    if (!contentItem) {
      return NextResponse.json({ success: false, message: 'Content item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: contentItem });
  } catch (error) {
    console.error('Error fetching content item:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}