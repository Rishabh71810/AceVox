'use server';

import { db } from "@/firebase/admin";
import { generateObject } from "ai";
import { feedbackSchema } from "@/constants";
import { google } from "@ai-sdk/google";
import { 
  GetFeedbackByInterviewIdParams, 
  Feedback,
  Interview,
  GetLatestInterviewsParams,
  CreateFeedbackParams 
} from "@/types";


export async function getInterviewsByUserId(userId: string, _timestamp?: number): Promise<Interview[] | null>{
    console.log('Fetching interviews for user:', userId);
    try {
      const interviews = await db
        .collection('interviews')
        .where('userId','==',userId)
        .orderBy('createdAt','desc')
        .get();
      
      console.log('Found interviews:', interviews.docs.length);
      console.log('Interview documents:', interviews.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
      
      return interviews.docs.map((doc)=>({
        id:doc.id,
        ...doc.data()
      })) as Interview[];
    } catch (error) {
      console.error('Error fetching interviews:', error);
      return null;
    }
  }
  
  export async function getLatestInterviews(params: GetLatestInterviewsParams & { timestamp?: number }): Promise<Interview[] | null>{
    const {userId, limit = 20} = params;
    try {
      // In Firestore, you can't use multiple orderBy with a range filter in between
      // So we need to restructure this query
      const interviews = await db
        .collection('interviews')
        .where('finalized','==',true)
        .where('userId','!=',userId)
        .orderBy('userId') // This is required when using != on userId
        .orderBy('createdAt','desc')
        .limit(limit)
        .get();
    
      return interviews.docs.map((doc)=>({
        id:doc.id,
        ...doc.data()
      })) as Interview[];
    } catch (error) {
      console.error('Error fetching latest interviews:', error);
      return null;
    }
  }

  export async function getInterviewById(id:string):Promise<Interview | null>{
    const interview = await db
    .collection('interviews')
    .doc(id)
    .get();
  
    return interview.data() as Interview  | null
  }

  export async function createFeedback(params: CreateFeedbackParams) {
    const { interviewId, userId, transcript, feedbackId } = params;
  
    try {
      const formattedTranscript = transcript
        .map(
          (sentence: { role: string; content: string }) =>
            `- ${sentence.role}: ${sentence.content}\n`
        )
        .join("");
  
      const { object } = await generateObject({
        model: google("gemini-2.0-flash-001", {
          structuredOutputs: false,
        }),
        schema: feedbackSchema,
        prompt: `
          You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
          Transcript:
          ${formattedTranscript}
  
          Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
          - **Communication Skills**: Clarity, articulation, structured responses.
          - **Technical Knowledge**: Understanding of key concepts for the role.
          - **Problem-Solving**: Ability to analyze problems and propose solutions.
          - **Cultural & Role Fit**: Alignment with company values and job role.
          - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
          `,
        system:
          "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
      });
  
      const feedback = {
        interviewId: interviewId,
        userId: userId,
        totalScore: object.totalScore,
        categoryScores: object.categoryScores,
        strengths: object.strengths,
        areasForImprovement: object.areasForImprovement,
        finalAssessment: object.finalAssessment,
        createdAt: new Date().toISOString(),
      };
  
      let feedbackRef;
  
      if (feedbackId) {
        feedbackRef = db.collection("feedback").doc(feedbackId);
      } else {
        feedbackRef = db.collection("feedback").doc();
      }
  
      await feedbackRef.set(feedback);
      
      // Update the interview record with the feedback ID and mark it as completed
      await db.collection("interviews").doc(interviewId).update({
        feedbackId: feedbackRef.id,
        completed: true
      });
  
      console.log(`Updated interview ${interviewId} with feedbackId ${feedbackRef.id}`);
      
      return { success: true, feedbackId: feedbackRef.id };
    } catch (error) {
      console.error("Error saving feedback:", error);
      return { success: false };
    }
  }


  export async function getFeedbackByInterviewId(
    params: GetFeedbackByInterviewIdParams
  ): Promise<Feedback | null> {
    const { interviewId, userId } = params;
  
    const querySnapshot = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .where("userId", "==", userId)
      .limit(1)
      .get();
  
    if (querySnapshot.empty) return null;
  
    const feedbackDoc = querySnapshot.docs[0];
    return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
  }

  export async function createRetakeInterview(params: { originalInterviewId: string, userId: string }): Promise<{ success: boolean; interviewId?: string }> {
    const { originalInterviewId, userId } = params;
    
    try {
      // Get the original interview
      const originalInterview = await getInterviewById(originalInterviewId);
      if (!originalInterview) {
        return { success: false };
      }

      // Create a new interview with the same details
      const newInterview = {
        ...originalInterview,
        id: undefined, // Let Firestore generate new ID
        createdAt: new Date().toISOString(),
        userId: userId,
        finalized: false,
        feedbackId: undefined
      };

      // Save to database
      const interviewRef = await db.collection('interviews').add(newInterview);

      return { success: true, interviewId: interviewRef.id };
    } catch (error) {
      console.error('Error creating retake interview:', error);
      return { success: false };
    }
  }