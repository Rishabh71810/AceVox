"use client"

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import {vapi} from '@/lib/vapi.sdk'

enum CallStatus {
  INACTIVE="INACTIVE",
  ACTIVE="ACTIVE",
  CONNECTING="CONNECTING",
  FINISHED="FINISHED",
}

interface SavedMessages {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

const Agent = ({userName,userId,type}:AgentProps) => {
    const router = useRouter();
    const [isSpeaking,setIsSpeaking] = useState(false);
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages,setMessages] = useState<SavedMessages[]>([]);

    useEffect(()=>{
     const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
     const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

     const onMessage = (message:Message) =>{
      if(message.type==='transcript' && message.transcriptType==='final'){
        const newMessage: SavedMessages = {
          role: message.role as 'user' | 'system' | 'assistant',
          content: message.transcript
        };
        setMessages((prev)=>[...prev,newMessage]);
      }
     }
     const onSpeechStart = () => {
      setIsSpeaking(true);
    } 
     const onSpeechEnd = () => {
      setIsSpeaking(false);
    }

     const onError = (error:Error) => {
      console.log('Error',error);
    }

     vapi.on('call-start',onCallStart);
     vapi.on('call-end',onCallEnd);
     vapi.on('message',onMessage);
     vapi.on('speech-start',onSpeechStart);
     vapi.on('speech-end',onSpeechEnd);
     vapi.on('error',onError);

     return () =>
     {
     vapi.off('call-start',onCallStart);
     vapi.off('call-end',onCallEnd);
     vapi.off('message',onMessage);
     vapi.off('speech-start',onSpeechStart);
     vapi.off('speech-end',onSpeechEnd);
     vapi.off('error',onError);
     }
    },[])

    useEffect(()=>{
      if(callStatus==CallStatus.FINISHED)router.push('/');
    },[messages,callStatus,type,userId])

    const handleCall = async () =>{
      setCallStatus(CallStatus.CONNECTING);

      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!,{
        variableValues:{
             username:userName,
             userid:userId,
             webToken: process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN
        }
      })
    }

    const handleDisconnect = async () =>{
      setCallStatus(CallStatus.FINISHED);
       vapi.stop();
    }

    const latestMessage = messages[messages.length - 1]?.content;
    const inCallInActiveOrFinished = callStatus===CallStatus.INACTIVE || callStatus===CallStatus.FINISHED

  return (
    <>
    <div className='call-view'>
      <div className='card-interviewer'>
        <div className='avatar'>
            <Image 
            src = "/ai-avatar.png" 
            alt="vapi" 
            width={65} 
            height={54} 
            className='object-cover'/>
            {isSpeaking && <span className='animate-speak'></span>}
        </div>
        <h3>AI Interviewer</h3>
      </div>
      <div className='call-border'>
        <div className='card-content'>
<Image 
src="" 
alt="user-avatar" 
width={540} 
height={540} 
className=' rounded-full object-cover size-[120px]'/>
      <h3>{userName}</h3>
        </div>
      </div>
    </div>

       {messages.length>0 && (
        <div className='transcript-border'>
          <div className='transcript'>
              <p key  ={latestMessage} className={cn('transition-opacity duration-500 opacity-0','animate-fadeIn opacity-100')}>
                 {latestMessage}
              </p>
          </div>
        </div>
       )}




    <div className='w-full flex justify-center'>
      {callStatus !== 'ACTIVE' ? (
        <button className='btn-call relative' onClick={()=>handleCall()}>
          <span className={cn('absolute animate-ping rounded-full opacity-75',callStatus==='CONNECTING'&& 'HIDDEN')}/>
           
          <span className='relative'>
          {inCallInActiveOrFinished ? "Call" : '. . .'}
          </span>
        </button>
      ) : (
        <button className='btn-disconnect' onClick={()=>handleDisconnect()}>
           <span>End</span>
        </button>
      )}
    </div>
    </>
  )
}

export default Agent
