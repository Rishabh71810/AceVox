import { db } from '@/firebase/admin';
import { Feedback } from '@/types';

export async function GET(request: Request) {
  try {
    // Get the interviewId and userId from the URL query parameters
    const url = new URL(request.url);
    const interviewId = url.searchParams.get('interviewId');
    const userId = url.searchParams.get('userId');

    if (!interviewId || !userId) {
      return Response.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Query Firestore for the feedback
    const querySnapshot = await db
      .collection('feedback')
      .where('interviewId', '==', interviewId)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return Response.json(
        { success: true, feedback: null },
        { status: 200 }
      );
    }

    // Get the feedback document
    const feedbackDoc = querySnapshot.docs[0];
    const feedback = {
      id: feedbackDoc.id,
      ...feedbackDoc.data()
    } as Feedback;

    return Response.json(
      { success: true, feedback },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return Response.json(
      { success: false, message: 'Error fetching feedback' },
      { status: 500 }
    );
  }
}
