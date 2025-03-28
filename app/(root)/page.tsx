import React from 'react'
import { Button } from '@/components/ui/button'
const page = () => {
  return (
    <>
      <section className='card-cta'>
         <div className='flex flex-col gap-6 max-w-lg'>
          <h2>
            Get ready for your next interview with Acevox
          </h2>
            <p>
            Practice interviews with AI, get feedback, and land your dream job with Acevox.
            </p>
            <Button asChild className='btn-primary max-sm:w-full'>
            
            </Button>
         </div>
      </section>
    </>
  )
}

export default page

