'use server';

import { db } from '@/firebase/admin';
import { Feedback } from '@/types';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Await params before accessing its properties
    const { id } = await context.params;
    const feedbackId = id;

    if (!feedbackId) {
      return Response.json(
        { success: false, message: 'Missing feedback ID' },
        { status: 400 }
      );
    }

    // Get the feedback document by ID
    const feedbackDoc = await db.collection('feedback').doc(feedbackId).get();

    if (!feedbackDoc.exists) {
      return Response.json(
        { success: false, message: 'Feedback not found' },
        { status: 404 }
      );
    }

    // Return the feedback data
    const feedback = {
      id: feedbackDoc.id,
      ...feedbackDoc.data()
    } as Feedback;

    return Response.json(
      { success: true, feedback },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching feedback by ID:', error);
    return Response.json(
      { success: false, message: 'Error fetching feedback' },
      { status: 500 }
    );
  }
}
