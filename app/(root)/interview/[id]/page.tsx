import React from 'react'
import { getInterviewById } from '@/lib/actions/general.actions';
import {redirect} from 'next/navigation'
import { getRandomInterviewCover } from '@/lib/utils';
import Image from 'next/image';
import DisplayTechIcons from '@/components/DisplayTechIcons';
import { getCurrentUser } from '@/lib/actions/auth.action';
import Agent from '@/components/Agent';
import { getFeedbackByInterviewId } from '@/lib/actions/general.actions';
import { RouteParams } from '@/types';

const page = async ({params}:RouteParams) => {
    const { id } = await params;
    const interview =  await getInterviewById(id);
    const user = await getCurrentUser();
    if(!interview || !user) {
        redirect('/');
    }
    const feedback = await getFeedbackByInterviewId({
      interviewId: id,
      userId: user.id, // user is guaranteed to exist due to the check above
    });
  return (
   <div className="container mx-auto px-4 py-8 max-w-6xl">
     <div className='flex flex-row gap-6 justify-between mb-8 flex-wrap'>
       <div className='flex flex-row gap-4 items-center'>
         <div className='flex flex-row gap-4 items-center'>
           <Image src={getRandomInterviewCover()} 
             alt="cover-image" width={50} height={50} className="rounded-full
              object-cover size-[50px] border-2 border-[#1e88e5]/30"/>
            <h3 className='capitalize text-white'>
               {interview.role} Interview
            </h3>
         </div>
         <DisplayTechIcons techStack={interview.techstack}/>
       </div>
       <div className='bg-[#000a14] px-4 py-2 rounded-lg h-fit capitalize text-[#4facff] border border-[#1e88e5]/20'>
         {interview.type}
       </div>
     </div>
     
     <Agent 
      userName={user.name}
      userId={user.id}
      interviewId={id}
      type="interview"
      questions={interview.questions}
      feedbackId={feedback?.id}
     />
   </div>
  )
}

export default page
