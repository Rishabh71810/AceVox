import React, { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { isAuthenticated } from '@/lib/actions/auth.action'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'

const RootLayout = async({children}:{children : ReactNode}) => {
  const isUserAuthenticated = await isAuthenticated();

  if(!isUserAuthenticated){
    redirect('/sign-in')
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#021326] to-[#000810] pattern">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        {/* Modern Header */}
        <header className="flex items-center justify-between py-4 mb-12">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Acevox" width={40} height={40} className="w-10 h-10" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#56CCF2] to-[#2D9CDB]">
              Acevox
            </h1>
          </Link>
          
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-light-100 hover:text-[#56CCF2] transition-colors">
                Home
              </Link>
              <Link href="/interview" className="text-light-100 hover:text-[#56CCF2] transition-colors">
                Interviews
              </Link>
              <Link href="#features" className="text-light-100 hover:text-[#56CCF2] transition-colors">
                Features
              </Link>
            </nav>
            
            <Button asChild className="bg-gradient-to-r from-[#56CCF2] to-[#2D9CDB] hover:from-[#2D9CDB] hover:to-[#2381B0] text-white rounded-full">
              <Link href="/interview">Start Interview</Link>
            </Button>
          </div>
        </header>
        
        {/* Main Content */}
        <main>
          {children}
        </main>
        
        {/* Footer */}
        <footer className="mt-20 py-8 border-t border-light-400/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Image src="/logo.svg" alt="Acevox" width={28} height={28} />
              <p className="text-light-400">© {new Date().getFullYear()} Acevox. All rights reserved.</p>
            </div>
            
            <div className="flex items-center gap-6">
              <Link href="/" className="text-light-400 hover:text-[#56CCF2] transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link href="/" className="text-light-400 hover:text-[#56CCF2] transition-colors text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default RootLayout
