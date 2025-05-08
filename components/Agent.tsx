"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.actions";
import { AgentProps } from "@/types";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
  ERROR = "ERROR",
  PROCESSING = "PROCESSING",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

interface InterviewData {
  role?: string;
  type?: string;
  level?: string;
  techstack?: string[];
  questions?: string[];
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isProcessingInterview, setIsProcessingInterview] = useState(false);
  const [interviewData, setInterviewData] = useState<InterviewData>({});

  // Use useCallback to prevent recreation of this function on each render
  const handleGenerateFeedback = useCallback(async (messages: SavedMessage[]) => {
    console.log("handleGenerateFeedback");
    
    if (!interviewId || !userId) {
      console.error("Missing required parameters for feedback generation");
      return { success: false };
    }

    try {
      setIsProcessingInterview(true);
      
      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId,
        userId: userId,
        transcript: messages,
        feedbackId,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/");
      }
      
      return { success, feedbackId: id };
    } catch (error) {
      console.error("Error generating feedback:", error);
      router.push("/");
      return { success: false };
    } finally {
      setIsProcessingInterview(false);
    }
  }, [feedbackId, interviewId, router, userId]);

  // Function to save generated interview data
  const saveGeneratedInterview = useCallback(async () => {
    if (type !== "generate" || !userId) return;
    
    try {
      setIsProcessingInterview(true);
      
      // Extract interview data from messages
      const interviewInfo: InterviewData = { ...interviewData };
      
      // Parse messages to extract interview details if not already set
      if (Object.keys(interviewInfo).length === 0) {
        // First, look for specific role mentions in the entire conversation
        const fullConversation = messages.map(m => m.content.toLowerCase()).join(' ');
        
        // Check for specific role mentions
        const rolePatterns = [
          /(?:devops|dev ops|developer operations)\s+(?:engineer|role|position|job)/i,
          /(?:frontend|front-end|front end)\s+(?:developer|engineer|role|position|job)/i,
          /(?:backend|back-end|back end)\s+(?:developer|engineer|role|position|job)/i,
          /(?:fullstack|full-stack|full stack)\s+(?:developer|engineer|role|position|job)/i,
          /(?:data\s+scientist|data\s+analyst|machine\s+learning|ml\s+engineer)/i,
          /(?:product\s+manager|project\s+manager|scrum\s+master)/i,
          /(?:ui|ux|ui\/ux)\s+(?:designer|developer)/i,
          /(?:cloud\s+engineer|cloud\s+architect)/i,
          /(?:security\s+engineer|security\s+analyst|penetration\s+tester)/i,
          /(?:qa|quality\s+assurance|test\s+engineer)/i,
          /(?:mobile|android|ios)\s+(?:developer|engineer)/i,
          /(?:blockchain|crypto)\s+(?:developer|engineer)/i,
          /(?:game\s+developer|game\s+designer|unity\s+developer)/i,
          /(?:embedded\s+systems|firmware)\s+(?:engineer|developer)/i,
          /(?:network\s+engineer|network\s+administrator)/i,
          /(?:database\s+administrator|dba)/i
        ];
        
        // Try to match specific roles first
        for (const pattern of rolePatterns) {
          const match = fullConversation.match(pattern);
          if (match) {
            // Format the role properly (capitalize first letter of each word)
            interviewInfo.role = match[0].replace(/\b\w/g, c => c.toUpperCase());
            break;
          }
        }
        
        // If no specific role was found, try the general approach
        if (!interviewInfo.role) {
          for (const message of messages) {
            const content = message.content.toLowerCase();
            
            // Try to extract role information
            if (content.includes("role") && !interviewInfo.role) {
              // Try different patterns for role extraction
              let roleMatch = content.match(/role\s*(?:is|:)\s*([a-z0-9\s\-\/]+)(?:\.|\,|\s|$)/i);
              if (!roleMatch) {
                roleMatch = content.match(/(?:for|as|a)\s+([a-z0-9\s\-\/]+)\s+(?:role|position|job)/i);
              }
              if (!roleMatch) {
                roleMatch = content.match(/interview\s+for\s+(?:a|an)\s+([a-z0-9\s\-\/]+)/i);
              }
              
              if (roleMatch && roleMatch[1]) {
                // Format the role properly (capitalize first letter of each word)
                interviewInfo.role = roleMatch[1].trim().replace(/\b\w/g, c => c.toUpperCase());
              }
            }
            
            // Try to extract type information
            if (content.includes("technical") && !interviewInfo.type) {
              interviewInfo.type = "technical";
            } else if (content.includes("behavioral") && !interviewInfo.type) {
              interviewInfo.type = "behavioral";
            } else if (content.includes("mixed") && !interviewInfo.type) {
              interviewInfo.type = "mixed";
            }
            
            // Try to extract level information
            if (content.includes("level") && !interviewInfo.level) {
              if (content.includes("junior")) {
                interviewInfo.level = "junior";
              } else if (content.includes("mid")) {
                interviewInfo.level = "mid-level";
              } else if (content.includes("senior")) {
                interviewInfo.level = "senior";
              }
            }
            
            // Try to extract techstack information
            if (content.includes("tech") && !interviewInfo.techstack) {
              const techMatch = content.match(/tech\s*(?:stack|:)\s*([a-z0-9,\s\-\/\.]+)(?:\.|\,|\s|$)/i);
              if (techMatch && techMatch[1]) {
                interviewInfo.techstack = techMatch[1].split(",").map(t => t.trim());
              }
            }
          }
        }
      }
      
      // Set default values if we couldn't extract them
      if (!interviewInfo.role) interviewInfo.role = "Software Developer";
      if (!interviewInfo.type) interviewInfo.type = "mixed";
      if (!interviewInfo.level) interviewInfo.level = "mid-level";
      if (!interviewInfo.techstack) interviewInfo.techstack = ["javascript", "react"];
      
      // Generate some default questions if none were extracted
      const defaultQuestions = [
        "Tell me about your experience with the technologies you've worked with.",
        "How do you approach problem-solving in your projects?",
        "Describe a challenging project you've worked on.",
        "How do you handle tight deadlines?",
        "Where do you see yourself in 5 years?"
      ];
      
      console.log("Extracted interview info:", interviewInfo);
      
      // Make API call to save the interview using the dedicated endpoint
      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: interviewInfo.role,
          type: interviewInfo.type,
          level: interviewInfo.level,
          techstack: interviewInfo.techstack,
          questions: interviewInfo.questions || defaultQuestions,
          userId: userId,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log("Interview created successfully with ID:", data.interviewId);
        
        // Force a cache invalidation by making a GET request to the same endpoint
        await fetch(`/api/interviews?userId=${userId}&timestamp=${Date.now()}`);
        
        // Wait a moment to ensure the database has time to update
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.error("Failed to save interview:", data.message);
      }
      
      // Redirect to home page regardless of success to show all interviews
      router.refresh(); // Force a refresh of the current page data
      router.push("/");
    } catch (error) {
      console.error("Error saving interview:", error);
      router.push("/");
    } finally {
      setIsProcessingInterview(false);
    }
  }, [interviewData, messages, router, type, userId]);

  // Handle meeting end or error
  const handleMeetingEnd = useCallback(async () => {
    console.log("Meeting ended");
    
    // For interview type, generate feedback
    if (type === "interview" && interviewId) {
      setCallStatus(CallStatus.PROCESSING);
      await handleGenerateFeedback(messages);
    } 
    // For generate type, save the generated interview
    else if (type === "generate" && userId) {
      setCallStatus(CallStatus.PROCESSING);
      console.log("Saving generated interview...");
      await saveGeneratedInterview();
    }
  }, [type, interviewId, handleGenerateFeedback, messages, userId, saveGeneratedInterview]);

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      handleMeetingEnd();
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
        
        // If this is a generate type and the message contains interview data, extract it
        if (type === "generate" && message.role === "assistant") {
          // Try to extract interview data from the assistant's message
          const content = message.transcript.toLowerCase();
          
          // Extract role if mentioned
          if (content.includes("role")) {
            const roleMatch = content.match(/role\s*(?:is|:)\s*([a-z\s]+)/i);
            if (roleMatch && roleMatch[1]) {
              setInterviewData(prev => ({ ...prev, role: roleMatch[1].trim() }));
            }
          }
          
          // Extract type if mentioned
          if (content.includes("technical") || content.includes("behavioral") || content.includes("mixed")) {
            let interviewType = "mixed";
            if (content.includes("technical")) interviewType = "technical";
            else if (content.includes("behavioral")) interviewType = "behavioral";
            
            setInterviewData(prev => ({ ...prev, type: interviewType }));
          }
          
          // Extract level if mentioned
          if (content.includes("level")) {
            let level = "mid-level";
            if (content.includes("junior")) level = "junior";
            else if (content.includes("senior")) level = "senior";
            
            setInterviewData(prev => ({ ...prev, level }));
          }
          
          // Extract techstack if mentioned
          if (content.includes("tech")) {
            const techMatch = content.match(/tech\s*(?:stack|:)\s*([a-z,\s]+)/i);
            if (techMatch && techMatch[1]) {
              const techstack = techMatch[1].split(",").map(t => t.trim());
              setInterviewData(prev => ({ ...prev, techstack }));
            }
          }
        }
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.log("Error:", error);
      
      // Special handling for "Meeting has ended" errors
      const errorMsg = error.message || "An error occurred";
      const isMeetingEndedError = errorMsg.includes("Meeting has ended");
      
      handleMeetingEnd();
      
      // If this is a "Meeting has ended" error and we have messages,
      // we should still try to process the interview
      if (isMeetingEndedError && messages.length > 0) {
        console.log("Meeting ended error detected, still processing interview");
      }
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    // Cleanup event listeners
    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, [handleMeetingEnd, messages.length, type]);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }
  }, [messages]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    setErrorMessage("");

    try {
      if (type === "generate") {
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          variableValues: {
            username: userName,
            userId: userId,
          },
        });
      } else {
        let formattedQuestions = "";
        if (questions) {
          formattedQuestions = questions
            .map((question) => `- ${question}`)
            .join("\n");
        }

        await vapi.start(interviewer, {
          variableValues: {
            questions: formattedQuestions,
          },
        });
      }
    } catch (error) {
      console.error("Error starting call:", error);
      setErrorMessage("Failed to start call. Please try again.");
      setCallStatus(CallStatus.ERROR);
    }
  };

  const handleDisconnect = () => {
    try {
      vapi.stop();
      setCallStatus(CallStatus.FINISHED);
    } catch (error) {
      console.error("Error stopping call:", error);
      handleMeetingEnd();
    }
  };

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src=""
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{errorMessage}</p>
          {callStatus === CallStatus.ERROR && messages.length > 0 && (
            <p>Your interview is being processed. Please wait...</p>
          )}
        </div>
      )}

      {isProcessingInterview && (
        <div className="processing-message bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          <p>Processing your interview. Please wait...</p>
        </div>
      )}

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" && callStatus !== "ERROR" && !isProcessingInterview ? (
          <button 
            className="relative btn-call" 
            onClick={() => handleCall()}
            disabled={isProcessingInterview}
          >
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative">
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Call"
                : ". . ."}
            </span>
          </button>
        ) : callStatus === "ACTIVE" ? (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        ) : (
          <button 
            className="btn-primary" 
            onClick={() => router.push("/")}
            disabled={isProcessingInterview}
          >
            {isProcessingInterview ? "Processing..." : "Return Home"}
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;