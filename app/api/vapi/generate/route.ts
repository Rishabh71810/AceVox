import {generateText }from 'ai'
import {google} from '@ai-sdk/google'
import { getRandomInterviewCover } from '@/lib/utils';
import {db} from '@/firebase/admin'
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Force dynamic rendering

export async function POST(request:Request){
 try {
    const body = await request.json();
    console.log('Received request body:', body);
    
    const {type, role, level, techstack, amount, userId} = body;

    // Validate required fields
    if (!userId) {
        console.log('Missing userId');
        return NextResponse.json(
            { success: false, message: 'User ID is required' },
            { status: 400 }
        );
    }

    if (!role || !level || !techstack || !amount) {
        console.log('Missing required fields:', { role, level, techstack, amount });
        return NextResponse.json(
            { success: false, message: 'Missing required fields' },
            { status: 400 }
        );
    }

    const {text:questions} = await generateText({
        model:google('gemini-2.0-flash-001'),
        prompt:`Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `,
    });

    const interview = {
        role,
        type,
        level,
        techstack: techstack.split(","),
        questions: JSON.parse(questions),
        userId,
        finalized: true,
        coverImage: getRandomInterviewCover(),
        createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);
    return NextResponse.json({ success: true }, { status: 200 });
 } catch (error) { 
    console.log('Error in generate route:', error);
    return NextResponse.json(
        { success: false, message: 'Error generating questions' },
        { status: 500 }
    );
 }
}