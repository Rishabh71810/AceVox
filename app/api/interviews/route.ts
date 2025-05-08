'use server';

import { db } from '@/firebase/admin';
import { getRandomInterviewCover } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received interview creation request:', body);
    
    const { role, type, level, techstack, questions, userId } = body;

    // Validate required fields
    if (!userId) {
      console.log('Missing userId');
      return Response.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!role || !type) {
      console.log('Missing required fields:', { role, type });
      return Response.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create interview object with default values for any missing fields
    const interview = {
      role: role || 'Software Developer',
      type: type || 'mixed',
      level: level || 'mid-level',
      techstack: Array.isArray(techstack) ? techstack : 
                (typeof techstack === 'string' ? techstack.split(',').map(t => t.trim()) : ['javascript', 'react']),
      questions: Array.isArray(questions) ? questions : [],
      userId,
      finalized: true,
      completed: false,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    // Add to Firestore
    const docRef = await db.collection('interviews').add(interview);
    
    console.log('Interview created successfully with ID:', docRef.id);
    
    return Response.json({ 
      success: true, 
      interviewId: docRef.id 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating interview:', error);
    return Response.json(
      { success: false, message: 'Error creating interview' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return Response.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const interviews = await db
      .collection('interviews')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const interviewData = interviews.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${interviewData.length} interviews for user ${userId}`);
    
    return Response.json({ 
      success: true, 
      interviews: interviewData 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return Response.json(
      { success: false, message: 'Error fetching interviews' },
      { status: 500 }
    );
  }
}
