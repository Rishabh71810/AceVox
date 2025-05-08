import { isAuthenticated } from '@/lib/actions/auth.action';
import { redirect } from 'next/navigation';
import React, { ReactNode } from 'react'

const AuthLayout = async ({children}:{children:ReactNode}) => {
  const isUserAuthenticated = await isAuthenticated();
  
  if(isUserAuthenticated){
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#021326] to-[#000810] pattern flex items-center justify-center p-4 md:p-6">
      {children}
    </div>
  )
}

export default AuthLayout
