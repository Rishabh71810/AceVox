import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import InterviewCard from '@/components/InterviewCard'
import { getCurrentUser} from '@/lib/actions/auth.action'
import { getInterviewsByUserId, getLatestInterviews } from '@/lib/actions/general.actions'
const page = async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  
  console.log('User ID:', user.id);
  const [userInterviews, allInterview] = await Promise.all([
    getInterviewsByUserId(user.id) ?? [],
    getLatestInterviews({ userId: user.id }) ?? []
  ]) as [Interview[], Interview[]];

  console.log('User Interviews:', userInterviews);
  console.log('All Interviews:', allInterview);

  const hasPastInterviews = userInterviews.length > 0;
  const hasUpComingInterviews = allInterview.length > 0;
  return (
    <>
      <section className='card-cta'>
         <div className='flex flex-col gap-6 max-w-lg'>
          <h2>
            Get ready for your next interview with Acevox
          </h2>
            <p>
            Practice interviews with AI, get feedback, and land your dream job with Acevox.
            </p>
            <Button asChild className='btn-primary max-sm:w-full'>
            <Link href="/interview">Start the Interview</Link>
            </Button>
         </div>
<Image src="/robot.png" alt="robot" width={400} height={400} className='max-sm:hidden' />
      </section>
      <section className='flex flex-col gap-6 mt-8'>
       <h2>Your Interviews</h2>
       <div className='interviews-section'>
       {  hasPastInterviews ? (
          userInterviews?.map((interview)=>(
            <InterviewCard
            key={interview.id}
            id={interview.id}
            userId={user.id}
            role={interview.role}
            type={interview.type}
            techstack={interview.techstack}
            createdAt={interview.createdAt}
          />
          ))
        ):(
          <p>
            you have&apos;t taken any interviews yet
          </p>
        )
      
        }
       </div>
      </section>
      <section className='flex flex-col gap-6 mt-8'>
       <h2>
        Taken a Interview
       </h2>
       <div className="interviews-section">
        {  hasUpComingInterviews ? (
          allInterview?.map((interview)=>(
            <InterviewCard
            key={interview.id}
            id={interview.id}
            userId={user.id}
            role={interview.role}
            type={interview.type}
            techstack={interview.techstack}
            createdAt={interview.createdAt}
          />
          ))
        ):(
          <p>
           There are no interviews available
          </p>
        )
      
        }
       </div>
      </section>
    </>
  )
}

export default page

