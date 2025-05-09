import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';
import { getRandomInterviewCover } from '@/lib/utils';

export const dynamic = 'force-dynamic'; // Force dynamic rendering

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received interview creation request:', body);
    
    const { role, type, level, techstack, questions, userId } = body;

    // Validate required fields
    if (!userId) {
      console.log('Missing userId');
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!type) {
      console.log('Missing required field: type');
      return NextResponse.json(
        { success: false, message: 'Missing required field: type' },
        { status: 400 }
      );
    }
    
    // Set default role if missing
    const roleValue = role || 'Software Developer';

    // Create interview object with default values for any missing fields
    const interview = {
      role: roleValue,
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
    
    return NextResponse.json({ 
      success: true, 
      interviewId: docRef.id 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating interview:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating interview' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
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
    
    return NextResponse.json({ 
      success: true, 
      interviews: interviewData 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching interviews' },
      { status: 500 }
    );
  }
}
