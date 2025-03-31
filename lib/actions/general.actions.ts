import { db } from "@/firebase/admin";

export async function getInterviewsByUserId(userId:string):Promise<Interview[] | null>{
    console.log('Fetching interviews for user:', userId);
    try {
      const interviews = await db
        .collection('interviews')
        .where('userid','==',userId)
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
  
  export async function getLatestInterviews(params: GetLatestInterviewsParams):Promise<Interview[] | null>{
    const {userId, limit = 20} = params;
    const interviews = await db
    .collection('interviews')
    .orderBy('createdAt','desc')
    .where('userId','!=',userId)
    .where('finalized','==',true)
    .orderBy('createdBy','desc')
    .limit(limit)
    .get();
  
    return interviews.docs.map((doc)=>({
      id:doc.id,
      ...doc.data()
    })) as Interview[];
  }

  export async function getInterviewById(id:string):Promise<Interview | null>{
    const interview = await db
    .collection('interviews')
    .doc(id)
    .get();
  
    return interview.data() as Interview  | null
  }