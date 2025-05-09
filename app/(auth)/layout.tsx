import { isAuthenticated } from '@/lib/actions/auth.action';
import { redirect } from 'next/navigation';
import React, { ReactNode } from 'react'

const AuthLayout = async ({children}:{children:ReactNode}) => {
  const isUserAuthenticated = await isAuthenticated();
  
  if(isUserAuthenticated){
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000205] via-[#001326] to-[#000a14] relative flex items-center justify-center px-4 py-6 md:p-6">
      <div className="absolute inset-0 pattern pointer-events-none"></div>
      <div className="relative z-10 w-full flex justify-center items-center max-w-screen-2xl">
        {children}
      </div>
    </div>
  )
}

export default AuthLayout
