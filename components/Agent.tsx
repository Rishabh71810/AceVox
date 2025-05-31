"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Phone, PhoneOff, Volume2, Users, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
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

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
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
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: {
          username: userName,
          userid: userId,
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
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  const getStatusBadge = () => {
    switch (callStatus) {
      case CallStatus.CONNECTING:
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Connecting...</Badge>;
      case CallStatus.ACTIVE:
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Live Interview</Badge>;
      case CallStatus.FINISHED:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Interview Ended</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Ready to Start</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Status Bar */}
      <div className="flex items-center justify-center">
        {getStatusBadge()}
      </div>

      {/* Video Call Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Interviewer Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 relative overflow-hidden">
          <CardContent className="p-6 text-center">
            <div className="relative mb-4">
              <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-1">
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                  <Users className="w-10 h-10 text-blue-600" />
                </div>
              </div>
              
              {/* Speaking Animation */}
              {isSpeaking && (
                <div className="absolute inset-0 rounded-full">
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                  <div className="absolute inset-2 rounded-full bg-blue-500/30 animate-ping animation-delay-75" />
                  <div className="absolute inset-4 rounded-full bg-blue-500/40 animate-ping animation-delay-150" />
                </div>
              )}
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              AI Interviewer
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {callStatus === CallStatus.ACTIVE ? "Speaking..." : "Ready to interview"}
            </p>
            
            {isSpeaking && (
              <div className="mt-3 flex items-center justify-center space-x-1">
                <Volume2 className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-blue-600 font-medium">AI is speaking</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Profile Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-700/30">
          <CardContent className="p-6 text-center">
            <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 mb-4 flex items-center justify-center text-white text-2xl font-bold">
              {userName?.charAt(0).toUpperCase() || 'U'}
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {userName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {callStatus === CallStatus.ACTIVE ? "In interview" : "Candidate"}
            </p>
            
            {callStatus === CallStatus.ACTIVE && (
              <div className="mt-3 flex items-center justify-center space-x-1">
                <Mic className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-medium">Mic active</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Live Transcript */}
      {messages.length > 0 && lastMessage && (
        <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Volume2 className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-gray-900 dark:text-white">Live Transcript</h4>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className={cn(
                "text-gray-700 dark:text-gray-300 transition-opacity duration-500",
                "opacity-100 animate-fadeIn"
              )}>
                "{lastMessage}"
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call Controls */}
      <div className="flex justify-center">
        {callStatus !== CallStatus.ACTIVE ? (
          <Button
            onClick={handleCall}
            disabled={callStatus === CallStatus.CONNECTING}
            size="lg"
            className={cn(
              "h-16 px-8 rounded-full text-lg font-semibold shadow-lg transition-all duration-200",
              callStatus === CallStatus.CONNECTING
                ? "bg-yellow-500 hover:bg-yellow-600 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 hover:shadow-xl"
            )}
          >
            {callStatus === CallStatus.CONNECTING ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Phone className="mr-2 h-5 w-5" />
                {callStatus === CallStatus.FINISHED ? "Start New Interview" : "Start Interview"}
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleDisconnect}
            size="lg"
            className="h-16 px-8 rounded-full text-lg font-semibold bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <PhoneOff className="mr-2 h-5 w-5" />
            End Interview
          </Button>
        )}
      </div>

      {/* Interview Progress */}
      {callStatus === CallStatus.ACTIVE && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Interview in progress
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Questions answered: {messages.filter(m => m.role === 'user').length}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Agent;