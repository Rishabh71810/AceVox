'use client';

import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import Image from 'next/image'
import { getRandomInterviewCover } from '@/lib/utils'
import Link from 'next/link'
import { Button } from './ui/button'
import ClientDisplayTechIcons from './ClientDisplayTechIcons'
import { InterviewCardProps, Feedback } from '@/types'

const InterviewCard = ({id, role, type, techstack, createdAt, userId, feedbackId, completed}:InterviewCardProps) => {
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                setIsLoading(true);
                
                if (feedbackId) {
                    // If we already have a feedbackId, fetch the feedback directly
                    const response = await fetch(`/api/feedback/${feedbackId}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.feedback) {
                            setFeedback(data.feedback);
                        } else {
                            console.warn(`No feedback found for feedbackId: ${feedbackId}`);
                        }
                    } else {
                        console.error(`Error fetching feedback by ID: ${feedbackId}`, response.statusText);
                    }
                } else if (completed) {
                    // Try to find feedback by interview ID and user ID if marked as completed
                    const response = await fetch(`/api/feedback?interviewId=${id}&userId=${userId}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.feedback) {
                            setFeedback(data.feedback);
                        } else {
                            console.warn(`No feedback found for interview: ${id} even though marked as completed`);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching feedback:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        if (id && userId && (feedbackId || completed)) {
            fetchFeedback();
        } else {
            setIsLoading(false);
        }
    }, [id, userId, feedbackId, completed]);
    
    const normalizedType = /mix/gi.test(type) ? "Mixed" : type;
    const formatteddate = dayjs(feedback?.createdAt || createdAt || Date.now()).format('MMM D, YYYY');
    
    return (
        <div className="card-border h-full">
            <div className="card-interview p-6 h-full flex flex-col border-l-2 border-[#1e88e5]/20 shadow-lg shadow-[#000]/50">
                {/* Card Header */}
                <div className="flex flex-col gap-5">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="p-1 bg-gradient-to-tr from-[#1e88e5] to-[#4facff]/30 rounded-full shadow-lg shadow-[#1e88e5]/10">
                                    <Image 
                                        src={getRandomInterviewCover()} 
                                        alt="cover image" 
                                        width={60} 
                                        height={60} 
                                        className="rounded-full object-cover" 
                                    />
                                </div>
                                {(feedback || (completed && feedbackId)) && (
                                    <div className="absolute -bottom-1 -right-1 bg-success-100 rounded-full p-1">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold capitalize">{role}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm text-light-400">{formatteddate}</span>
                                </div>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-[#000a14] text-[#4facff] text-sm font-medium rounded-full border border-[#1e88e5]/20">
                            {normalizedType}
                        </span>
                    </div>
                    
                    {/* Score Display */}
                    {!isLoading && feedback && (
                        <div className="bg-[#000a14]/70 rounded-xl p-3 mt-2 border-l border-[#1e88e5]/20">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-light-400">Overall Score</span>
                                <div className="flex items-center gap-1.5">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#4facff" stroke="#4facff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span className="font-semibold text-[#4facff]">{feedback.totalScore}/100</span>
                                </div>
                            </div>
                            
                            {/* Progress bar */}
                            <div className="w-full bg-[#000205] h-2 rounded-full mt-2 overflow-hidden">
                                <div 
                                    className="bg-gradient-to-r from-[#4facff] to-[#1e88e5] h-full rounded-full" 
                                    style={{ width: `${feedback.totalScore}%` }}
                                />
                            </div>
                        </div>
                    )}
                    
                    {/* Assessment */}
                    <p className="text-light-100/80 line-clamp-2 text-sm">
                        {isLoading ? 'Loading...' : (feedback?.finalAssessment || "No feedback yet")}
                    </p>
                </div>
                
                {/* Card Footer */}
                <div className="mt-auto pt-5 flex items-center justify-between">
                    <ClientDisplayTechIcons techStack={techstack} />
                    
                    <Button asChild variant="outline" className="rounded-full border-[#1e88e5]/30 text-[#4facff] hover:bg-[#1e88e5]/10 hover:text-[#4facff]">
                        <Link href={(feedback || (completed && feedbackId)) ? `/interview/${id}/feedback` : `/interview/${id}`}>
                            {(feedback || (completed && feedbackId)) ? 'View Feedback' : 'Start Interview'}
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default InterviewCard
