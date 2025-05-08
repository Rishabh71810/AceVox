'use client';

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { TechIconProps } from '@/types'

// A client-side version of DisplayTechIcons
const ClientDisplayTechIcons = ({ techStack }: TechIconProps) => {
  const [techIcons, setTechIcons] = useState<Array<{ tech: string, url: string }>>([]);
  
  useEffect(() => {
    const fetchTechLogos = async () => {
      try {
        // Using a custom API endpoint to fetch tech logos
        const response = await fetch(`/api/tech-logos?stack=${encodeURIComponent(JSON.stringify(techStack))}`);
        if (response.ok) {
          const data = await response.json();
          setTechIcons(data.logos);
        }
      } catch (error) {
        console.error('Error fetching tech logos:', error);
        // Fallback to placeholder icons
        setTechIcons(techStack.map(tech => ({ tech, url: '/tech.svg' })));
      }
    };
    
    fetchTechLogos();
  }, [techStack]);

  return (
    <div className='flex flex-row'>
      {techIcons.slice(0, 4).map(({ tech, url }, index) => (
        <div key={tech} className={cn('relative group bg-[#021326] rounded-full p-2 flex-center border border-[#1e88e5]/20', index >= 1 && '-ml-3')}>
          <span className='tech-tooltip'>{tech}</span>
          <Image src={url} alt={tech} width={100} height={100} className='object-fit tech-icon size-5' />
        </div>
      ))}
    </div>
  )
}

export default ClientDisplayTechIcons 