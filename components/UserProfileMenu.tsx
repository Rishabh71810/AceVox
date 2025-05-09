"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase/client';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { signOut } from '@/lib/actions/auth.action';

interface UserProfileMenuProps {
  userName: string;
  userImage?: string;
}

const UserProfileMenu = ({ userName, userImage = "/user-avatar.png" }: UserProfileMenuProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageClick = () => {
    setIsOpen(!isOpen);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadedImage(event.target.result as string);
        // Here you would typically upload the image to your server/storage
        if (typeof window !== 'undefined') {
          localStorage.setItem('userProfileImage', event.target.result as string);
        }
        toast.success("Profile picture updated successfully");
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleSignOut = async () => {
    try {
      // First, clear the localStorage data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userProfileImage');
      }
      
      // Sign out from Firebase
      await firebaseSignOut(auth);
      
      // Also perform server-side sign out
      await signOut();
      
      toast.success("Signed out successfully");
        
      // Force a navigation to sign-in page
      window.location.href = '/sign-in';
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };
  
  // Check for saved image in localStorage when component mounts
  useEffect(() => {
    setIsMounted(true);
    
    if (typeof window !== 'undefined') {
      const savedImage = localStorage.getItem('userProfileImage');
      if (savedImage) {
        setUploadedImage(savedImage);
      }
    }
  }, []);
  
  // Only render the actual content after component has mounted on the client
  if (!isMounted) {
    return (
      <div className="flex items-center gap-2 bg-[#001e3d] px-3 py-2 rounded-full border border-[#1e88e5]/20">
        <div className="w-8 h-8 rounded-full bg-[#001326] flex-shrink-0"></div>
        <div className="w-16 h-4 bg-[#001326] rounded max-md:hidden"></div>
      </div>
    );
  }
  
  return (
    <div className="relative">
      <button 
        onClick={handleImageClick}
        className="flex items-center gap-2 bg-[#001e3d] px-3 py-2 rounded-full hover:bg-[#00294f] transition-colors border border-[#1e88e5]/20"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 border border-[#1e88e5]/30">
          <Image
            src={uploadedImage || userImage}
            alt={userName}
            width={32}
            height={32}
            className="object-cover w-full h-full"
          />
        </div>
        <span className="text-light-100 text-sm max-md:hidden">{userName}</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[#001326] border border-[#1e88e5]/20 rounded-lg shadow-lg py-2 z-50">
          <div className="px-4 py-3 border-b border-[#1e88e5]/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-[#1e88e5]/30">
                <Image
                  src={uploadedImage || userImage}
                  alt={userName}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <p className="text-sm text-light-100">Signed in as</p>
                <p className="text-sm font-semibold text-white">{userName}</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-left px-4 py-2 text-light-100 hover:bg-[#1e88e5]/10 transition-colors text-sm"
            >
              Update Profile Picture
            </button>
            <button 
              onClick={handleSignOut}
              className="text-left px-4 py-2 text-[#f75353] hover:bg-[#1e88e5]/10 transition-colors text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />
    </div>
  );
};

export default UserProfileMenu; 