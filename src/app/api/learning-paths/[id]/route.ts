import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/database/neon';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Learning path ID is required' }, { status: 400 });
    }

    const learningPath = await db.getLearningPathById(id);

    if (!learningPath) {
      return NextResponse.json({ success: false, message: 'Learning path not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: learningPath });
  } catch (error) {
    console.error('Error fetching learning path:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}