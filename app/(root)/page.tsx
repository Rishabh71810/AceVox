import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import InterviewCard from '@/components/InterviewCard'
import { getCurrentUser} from '@/lib/actions/auth.action'
import { getInterviewsByUserId, getLatestInterviews } from '@/lib/actions/general.actions'
import { Interview } from '@/types'

// Set cache option to 'no-store' to ensure we always get fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const page = async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  
  // Add timestamp to force fresh data
  const timestamp = Date.now();
  
  const [userInterviews, allInterview] = await Promise.all([
    getInterviewsByUserId(user.id, timestamp) ?? [],
    getLatestInterviews({ userId: user.id, timestamp }) ?? []
  ]) as [Interview[], Interview[]];

  const hasPastInterviews = userInterviews.length > 0;
  const hasUpComingInterviews = allInterview.length > 0;
  
  return (
    <div className="flex flex-col gap-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#021326] to-[#000810] rounded-3xl px-16 py-16 flex flex-col items-center text-center gap-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image src="/pattern.png" alt="Background Pattern" fill className="object-cover" />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold max-w-4xl z-10 bg-clip-text text-transparent bg-gradient-to-r from-white to-[#4facff]">
          Transforming interviews with AI powered automation
        </h1>
        <p className="text-xl max-w-2xl text-light-100/80 z-10">
          Experience the future of interviews with intelligent analysis and personalized feedback tailored to your needs
        </p>
        <div className="flex gap-4 z-10 mt-4">
          <Button asChild className="bg-gradient-to-r from-[#4facff] to-[#1e88e5] hover:from-[#1e88e5] hover:to-[#1565c0] text-white rounded-full text-lg px-8 py-6">
            <Link href="/interview">Start Interview</Link>
          </Button>
          <Button asChild className="bg-dark-200 text-[#4facff] hover:bg-dark-200/80 hover:text-[#1e88e5] rounded-full text-lg px-8 py-6">
            <Link href="#features">Explore Features</Link>
          </Button>
        </div>
        
        {/* AI-Enhanced Visual */}
        <div className="relative w-full mt-8 flex justify-center z-10">
          <div className="bg-dark-300/50 backdrop-blur-md p-6 rounded-2xl border border-[#1e88e5]/20 flex items-center gap-5 max-w-xl">
            <div className="flex-shrink-0">
              <div className="bg-gradient-to-r from-[#4facff] to-[#1e88e5] rounded-full p-3">
                <Image src="/robot.png" alt="AI Assistant" width={60} height={60} className="size-15" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-left text-[#4facff] font-semibold">AI Interviewer</p>
              <p className="text-left text-light-100/80 text-sm">
                Our AI interviewer adapts to your responses in real-time, providing a realistic interview experience
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section id="features" className="flex flex-col gap-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">Innovative services for growth</h2>
          <p className="text-xl text-light-100/80 max-w-2xl mx-auto">
            Tailored solutions to streamline, innovate, and grow your interview skills
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Service 1 */}
          <div className="card-border h-full">
            <div className="card p-8 flex flex-col gap-6 min-h-80 border border-[#0a2d5c]/60">
              <div className="size-16 bg-[#0a2d5c] rounded-xl flex-center">
                <Image src="/ai-interview.svg" alt="AI Interview" width={32} height={32} />
              </div>
              <h3 className="text-xl font-bold">AI Interview Practice</h3>
              <p className="text-light-100/80">
                Practice with our AI interviewer that simulates real interview scenarios and adjusts to your skill level
              </p>
            </div>
          </div>
          
          {/* Service 2 */}
          <div className="card-border h-full">
            <div className="card p-8 flex flex-col gap-6 min-h-80 border border-[#0a2d5c]/60">
              <div className="size-16 bg-[#0a2d5c] rounded-xl flex-center">
                <Image src="/feedback.svg" alt="Feedback" width={32} height={32} />
              </div>
              <h3 className="text-xl font-bold">Detailed Feedback</h3>
              <p className="text-light-100/80">
                Receive comprehensive feedback and actionable insights to improve your interview performance
              </p>
            </div>
          </div>
          
          {/* Service 3 */}
          <div className="card-border h-full">
            <div className="card p-8 flex flex-col gap-6 min-h-80 border border-[#0a2d5c]/60">
              <div className="size-16 bg-[#0a2d5c] rounded-xl flex-center">
                <Image src="/tech.svg" alt="Tech Stack" width={32} height={32} />
              </div>
              <h3 className="text-xl font-bold">Tech-Specific Training</h3>
              <p className="text-light-100/80">
                Customize your interview practice based on specific technologies and roles you're targeting
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Your Interviews Section */}
      {hasPastInterviews && (
        <section className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">Your Interviews</h2>
            <Button asChild className="btn-primary">
              <Link href="/interview">Take New Interview</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userInterviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                id={interview.id}
                userId={user.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
                feedbackId={interview.feedbackId}
                completed={interview.completed}
              />
            ))}
          </div>
        </section>
      )}
      
      {/* Recent Interviews Section */}
      {hasUpComingInterviews && (
        <section className="flex flex-col gap-8">
          <h2 className="text-3xl font-bold">Recent Interviews</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allInterview?.map((interview) => (
              <InterviewCard
                key={interview.id}
                id={interview.id}
                userId={user.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
                feedbackId={interview.feedbackId}
                completed={interview.completed}
              />
            ))}
          </div>
        </section>
      )}
      
      {/* CTA Section */}
      <section className="bg-gradient-to-b from-[#021326] to-[#000810] rounded-3xl px-12 py-12 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex flex-col gap-6 max-w-xl">
          <h2 className="text-3xl font-bold">Ready to ace your next interview?</h2>
          <p className="text-light-100/80">
            Start practicing now and get instant feedback to improve your interview skills.
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-[#4facff] to-[#1e88e5] hover:from-[#1e88e5] hover:to-[#1565c0] text-white rounded-full text-lg px-8 py-6 whitespace-nowrap">
          <Link href="/interview">Start Interview Now</Link>
        </Button>
      </section>
    </div>
  )
}

export default page
