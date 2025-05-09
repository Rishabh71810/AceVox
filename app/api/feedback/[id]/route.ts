'use server';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';
import { Feedback } from '@/types';

export const dynamic = 'force-dynamic'; // Force dynamic rendering

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const feedbackId = id;

    if (!feedbackId) {
      return NextResponse.json(
        { success: false, message: 'Missing feedback ID' },
        { status: 400 }
      );
    }

    // Get the feedback document by ID
    const feedbackDoc = await db.collection('feedback').doc(feedbackId).get();

    if (!feedbackDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'Feedback not found' },
        { status: 404 }
      );
    }

    // Return the feedback data
    const feedback = {
      id: feedbackDoc.id,
      ...feedbackDoc.data()
    } as Feedback;

    return NextResponse.json(
      { success: true, feedback },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching feedback by ID:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching feedback' },
      { status: 500 }
    );
  }
}
