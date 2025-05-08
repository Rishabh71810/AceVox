import { getTechLogos } from '@/lib/utils'
import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { TechIconProps } from '@/types'

const DisplayTechIcons = async ({techStack}:TechIconProps) => {
    const techIcons = await getTechLogos(techStack);
  return (
    <div className='flex flex-row '>
      {techIcons.slice(0,4).map(({tech,url},index)=>(
        
      <div key={tech} className={cn('relative group bg-[#021326] rounded-full p-2 flex-center border border-[#1e88e5]/20',index>=1 && '-ml-3 ')}>
       <span className='tech-tooltip'>{tech}</span>
       <Image src = {url} alt = {tech} width = {100} height = {100} className='object-fit tech-icon size-5' />
      </div>))}
    </div>
  )
}

export default DisplayTechIcons
