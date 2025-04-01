"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createRetakeInterview } from "@/lib/actions/general.actions";

interface RetakeButtonProps {
  interviewId: string;
  userId: string;
}

const RetakeButton = ({ interviewId, userId }: RetakeButtonProps) => {
  const router = useRouter();

  const handleRetake = async () => {
    try {
      const result = await createRetakeInterview({ originalInterviewId: interviewId, userId });
      if (result.success && result.interviewId) {
        router.push(`/interview/${result.interviewId}`);
      } else {
        toast.error("Failed to create retake interview");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <Button className="btn-primary flex-1" onClick={handleRetake}>
      <p className="text-sm font-semibold text-black text-center">
        Retake Interview
      </p>
    </Button>
  );
};

export default RetakeButton; 