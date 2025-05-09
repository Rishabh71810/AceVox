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
  const [userProfileImage, setUserProfileImage] = useState<string>("/user-avatar.png");
  const [isMounted, setIsMounted] = useState(false);

  // Load user profile image from localStorage
  useEffect(() => {
    setIsMounted(true);
    
    if (typeof window !== 'undefined') {
      const savedImage = localStorage.getItem('userProfileImage');
      if (savedImage) {
        setUserProfileImage(savedImage);
      }
    }
  }, []);

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
        
        // Check for specific role mentions with improved patterns
        const rolePatterns = [
          { pattern: /(?:devops|dev ops|developer operations)\s+(?:engineer|role|position|job)/i, role: "DevOps Engineer" },
          { pattern: /(?:frontend|front-end|front end)\s+(?:developer|engineer|role|position|job)/i, role: "Frontend Developer" },
          { pattern: /(?:backend|back-end|back end)\s+(?:developer|engineer|role|position|job)/i, role: "Backend Developer" },
          { pattern: /(?:fullstack|full-stack|full stack)\s+(?:developer|engineer|role|position|job)/i, role: "Fullstack Developer" },
          { pattern: /data\s+scientist/i, role: "Data Scientist" },
          { pattern: /data\s+analyst/i, role: "Data Analyst" },
          { pattern: /(?:machine\s+learning|ml)\s+(?:engineer|specialist)/i, role: "Machine Learning Engineer" },
          { pattern: /product\s+manager/i, role: "Product Manager" },
          { pattern: /project\s+manager/i, role: "Project Manager" },
          { pattern: /scrum\s+master/i, role: "Scrum Master" },
          { pattern: /(?:ui|ux|ui\/ux)\s+designer/i, role: "UI/UX Designer" },
          { pattern: /cloud\s+(?:engineer|architect)/i, role: "Cloud Engineer" },
          { pattern: /security\s+(?:engineer|analyst|specialist)/i, role: "Security Engineer" },
          { pattern: /penetration\s+tester/i, role: "Penetration Tester" },
          { pattern: /(?:qa|quality\s+assurance)\s+(?:engineer|analyst)/i, role: "QA Engineer" },
          { pattern: /test\s+engineer/i, role: "Test Engineer" },
          { pattern: /(?:android|ios|mobile)\s+(?:developer|engineer)/i, role: "Mobile Developer" },
          { pattern: /(?:blockchain|crypto)\s+(?:developer|engineer)/i, role: "Blockchain Developer" },
          { pattern: /game\s+(?:developer|designer)/i, role: "Game Developer" },
          { pattern: /(?:embedded\s+systems|firmware)\s+(?:engineer|developer)/i, role: "Embedded Systems Engineer" },
          { pattern: /network\s+(?:engineer|administrator)/i, role: "Network Engineer" },
          { pattern: /(?:database\s+administrator|dba)/i, role: "Database Administrator" },
          { pattern: /(?:software|application)\s+(?:developer|engineer)/i, role: "Software Developer" },
          { pattern: /(?:java|python|javascript|typescript|php|ruby|c\+\+|c#|go|rust)\s+(?:developer|engineer)/i, role: null }, // Will be handled specially below
          { pattern: /web\s+developer/i, role: "Web Developer" },
          { pattern: /(?:system|systems)\s+(?:administrator|admin)/i, role: "Systems Administrator" },
          { pattern: /(?:devops|devsecops|cloud)\s+engineer/i, role: "DevOps Engineer" },
          { pattern: /data\s+engineer/i, role: "Data Engineer" },
          { pattern: /site\s+reliability\s+engineer/i, role: "Site Reliability Engineer" },
          { pattern: /solutions\s+architect/i, role: "Solutions Architect" },
          { pattern: /technical\s+(?:lead|director)/i, role: "Technical Lead" },
          { pattern: /ux\s+researcher/i, role: "UX Researcher" }
        ];
        
        // Language-specific roles pattern to check after other patterns
        const languagePatterns = [
          { pattern: /java\s+(?:developer|engineer)/i, role: "Java Developer" },
          { pattern: /python\s+(?:developer|engineer)/i, role: "Python Developer" },
          { pattern: /javascript\s+(?:developer|engineer)/i, role: "JavaScript Developer" },
          { pattern: /typescript\s+(?:developer|engineer)/i, role: "TypeScript Developer" },
          { pattern: /php\s+(?:developer|engineer)/i, role: "PHP Developer" },
          { pattern: /ruby\s+(?:developer|engineer)/i, role: "Ruby Developer" },
          { pattern: /c\+\+\s+(?:developer|engineer)/i, role: "C++ Developer" },
          { pattern: /c#\s+(?:developer|engineer)/i, role: "C# Developer" },
          { pattern: /go\s+(?:developer|engineer)/i, role: "Go Developer" },
          { pattern: /rust\s+(?:developer|engineer)/i, role: "Rust Developer" }
        ];
        
        // Try to match specific roles first
        let roleFound = false;
        for (const { pattern, role } of rolePatterns) {
          const match = fullConversation.match(pattern);
          if (match) {
            // For language patterns, we'll handle them specially
            if (role === null) {
              // Check if this is a language-specific role
              for (const langPattern of languagePatterns) {
                const langMatch = fullConversation.match(langPattern.pattern);
                if (langMatch) {
                  interviewInfo.role = langPattern.role;
                  roleFound = true;
                  break;
                }
              }
            } else {
              // For non-language specific roles
              interviewInfo.role = role;
              roleFound = true;
            }
            if (roleFound) break;
          }
        }
        
        // If no specific role was found, try more general extraction approaches
        if (!roleFound) {
          // Look for explicit mentions of a role
          const roleExplicitMentions = [
            /interviewing\s+for\s+(?:a|an)\s+([a-z0-9\s\-\/]+?)\s+(?:role|position)/i,
            /preparing\s+for\s+(?:a|an)\s+([a-z0-9\s\-\/]+?)\s+(?:interview|role|position)/i,
            /interview\s+for\s+(?:a|an)\s+([a-z0-9\s\-\/]+?)\s+(?:role|position)/i,
            /role\s+is\s+(?:a|an)\s+([a-z0-9\s\-\/]+)/i,
            /position\s+(?:is|of)\s+(?:a|an)\s+([a-z0-9\s\-\/]+)/i,
            /applying\s+(?:for|to)\s+(?:a|an)\s+([a-z0-9\s\-\/]+?)\s+(?:role|position)/i
          ];
          
          for (const pattern of roleExplicitMentions) {
            const match = fullConversation.match(pattern);
            if (match && match[1]) {
              // Format the role properly (capitalize first letter of each word)
              interviewInfo.role = match[1].trim().replace(/\b\w/g, c => c.toUpperCase());
              roleFound = true;
              break;
            }
          }
          
          // If still no role found, check for role mentions in individual messages
          if (!roleFound) {
            for (const message of messages) {
              const content = message.content.toLowerCase();
              
              // Try to extract role information with more patterns
              const rolePatterns = [
                /role\s*(?:is|:)\s*([a-z0-9\s\-\/]+)(?:\.|\,|\s|$)/i,
                /(?:for|as|a)\s+([a-z0-9\s\-\/]+)\s+(?:role|position|job)/i,
                /interview\s+for\s+(?:a|an)\s+([a-z0-9\s\-\/]+)/i,
                /preparing\s+for\s+(?:a|an)\s+([a-z0-9\s\-\/]+)/i,
                /position\s+(?:is|as)\s+(?:a|an)\s+([a-z0-9\s\-\/]+)/i
              ];
              
              for (const pattern of rolePatterns) {
                const roleMatch = content.match(pattern);
                if (roleMatch && roleMatch[1]) {
                  // Format the role properly (capitalize first letter of each word)
                  interviewInfo.role = roleMatch[1].trim().replace(/\b\w/g, c => c.toUpperCase());
                  roleFound = true;
                  break;
                }
              }
              
              if (roleFound) break;
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
          
          // Extract role if mentioned - improved role extraction
          // First check for common role patterns
          const rolePatterns = [
            { regex: /(?:frontend|front-end|front end)\s+(?:developer|engineer)/i, role: "Frontend Developer" },
            { regex: /(?:backend|back-end|back end)\s+(?:developer|engineer)/i, role: "Backend Developer" },
            { regex: /(?:fullstack|full-stack|full stack)\s+(?:developer|engineer)/i, role: "Fullstack Developer" },
            { regex: /(?:devops|dev ops)\s+engineer/i, role: "DevOps Engineer" },
            { regex: /data\s+scientist/i, role: "Data Scientist" },
            { regex: /data\s+analyst/i, role: "Data Analyst" },
            { regex: /(?:machine\s+learning|ml)\s+engineer/i, role: "Machine Learning Engineer" },
            { regex: /(?:ui|ux|ui\/ux)\s+designer/i, role: "UI/UX Designer" },
            { regex: /product\s+manager/i, role: "Product Manager" },
            { regex: /project\s+manager/i, role: "Project Manager" },
            { regex: /java\s+developer/i, role: "Java Developer" },
            { regex: /python\s+developer/i, role: "Python Developer" },
            { regex: /javascript\s+developer/i, role: "JavaScript Developer" },
            { regex: /typescript\s+developer/i, role: "TypeScript Developer" },
            { regex: /cloud\s+engineer/i, role: "Cloud Engineer" }
          ];
          
          let roleFound = false;
          
          // First check for explicit role patterns
          for (const pattern of rolePatterns) {
            if (content.match(pattern.regex)) {
              setInterviewData(prev => ({ ...prev, role: pattern.role }));
              roleFound = true;
              break;
            }
          }
          
          // If no specific role was found, try looking for role mentions
          if (!roleFound && content.includes("role")) {
            const roleMatch = content.match(/role(?:\s+is|\s*:\s*|\s+for\s+the\s+position\s+of)\s+([a-z0-9\s\-\/]+)(?:\.|\,|\s|$)/i);
            if (roleMatch && roleMatch[1]) {
              // Format the role properly (capitalize first letter of each word)
              const extractedRole = roleMatch[1].trim().replace(/\b\w/g, c => c.toUpperCase());
              setInterviewData(prev => ({ ...prev, role: extractedRole }));
              roleFound = true;
            }
          }
          
          // If still no role found, check for position mentions
          if (!roleFound && content.includes("position")) {
            const positionMatch = content.match(/position(?:\s+is|\s*:\s*|\s+of)\s+([a-z0-9\s\-\/]+)(?:\.|\,|\s|$)/i);
            if (positionMatch && positionMatch[1]) {
              // Format the position properly (capitalize first letter of each word)
              const extractedRole = positionMatch[1].trim().replace(/\b\w/g, c => c.toUpperCase());
              setInterviewData(prev => ({ ...prev, role: extractedRole }));
              roleFound = true;
            }
          }
          
          // If still no role found, look for job-related phrases
          if (!roleFound) {
            const jobPhrases = [
              /preparing\s+for\s+(?:a|an)\s+([a-z0-9\s\-\/]+?)\s+interview/i,
              /interviewing\s+for\s+(?:a|an)\s+([a-z0-9\s\-\/]+?)\s+position/i,
              /(?:a|an)\s+([a-z0-9\s\-\/]+?)\s+job\s+interview/i
            ];
            
            for (const phrase of jobPhrases) {
              const match = content.match(phrase);
              if (match && match[1]) {
                const extractedRole = match[1].trim().replace(/\b\w/g, c => c.toUpperCase());
                setInterviewData(prev => ({ ...prev, role: extractedRole }));
                roleFound = true;
                break;
              }
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
              src={isMounted ? userProfileImage : "/user-avatar.png"}
              alt="profile-image"
              width={120}
              height={120}
              className="rounded-full object-cover size-[120px] border-2 border-[#1e88e5]/30"
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