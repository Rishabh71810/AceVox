import React from 'react'
import Agent from '@/components/Agent'
import { getCurrentUser } from '@/lib/actions/auth.action'
async function Home(){
  const user = await getCurrentUser();
  if (!user) return null;
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h3 className="text-2xl font-semibold mb-8 text-white">Interview Generation</h3>
      <Agent userName={user.name} userId={user.id} type="generate"/>
    </div>
  )
}

export default Home
