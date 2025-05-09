"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Show a simple placeholder until client-side rendering takes over
  if (!isMounted) {
    return (
      <div className="md:hidden w-8 h-8 bg-[#001e3d] rounded border border-[#1e88e5]/20"></div>
    );
  }

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col justify-center items-center w-8 h-8 border border-[#1e88e5]/20 rounded bg-[#001e3d] p-1"
        aria-label="Toggle menu"
      >
        <span className={`block w-5 h-0.5 bg-[#4facff] transition-all duration-300 ease-out ${isOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
        <span className={`block w-5 h-0.5 bg-[#4facff] mt-1 transition-all duration-300 ease-out ${isOpen ? 'opacity-0' : ''}`}></span>
        <span className={`block w-5 h-0.5 bg-[#4facff] mt-1 transition-all duration-300 ease-out ${isOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
      </button>

      {isOpen && (
        <div className="absolute top-16 right-4 w-48 bg-[#001326] border border-[#1e88e5]/20 rounded-lg shadow-lg z-50">
          <div className="py-2">
            <Link 
              href="/" 
              className="block px-4 py-2 text-light-100 hover:bg-[#1e88e5]/10 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/interview" 
              className="block px-4 py-2 text-light-100 hover:bg-[#1e88e5]/10 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Interviews
            </Link>
            <Link 
              href="#features" 
              className="block px-4 py-2 text-light-100 hover:bg-[#1e88e5]/10 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Features
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMenu; 