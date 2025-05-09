import React, { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getCurrentUser, isAuthenticated } from '@/lib/actions/auth.action'
import { redirect } from 'next/navigation'
import UserProfileMenu from '@/components/UserProfileMenu'
import MobileMenu from '@/components/MobileMenu'

const RootLayout = async({children}:{children : ReactNode}) => {
  const isUserAuthenticated = await isAuthenticated();
  if(!isUserAuthenticated){
    redirect('/sign-in')
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000205] via-[#001326] to-[#000a14] relative">
      <div className="absolute inset-0 pattern pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
        {/* Modern Header */}
        <header className="flex items-center justify-between py-3 sm:py-4 mb-8 sm:mb-12">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <Image src="/logo.svg" alt="Acevox" width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10" />
            <h1 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#4facff] to-[#1e88e5]">
              Acevox
            </h1>
          </Link>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <nav className="hidden md:flex items-center gap-5 sm:gap-8">
              <Link href="/" className="text-light-100 hover:text-[#4facff] transition-colors">
                Home
              </Link>
              <Link href="/interview" className="text-light-100 hover:text-[#4facff] transition-colors">
                Interviews
              </Link>
              <Link href="#features" className="text-light-100 hover:text-[#4facff] transition-colors">
                Features
              </Link>
            </nav>
            
            <div className="flex items-center gap-2">
              <MobileMenu />
              {/* User Profile Menu instead of Start Interview button */}
              <UserProfileMenu userName={user.name} />
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main>
          {children}
        </main>
        
        {/* Footer */}
        <footer className="mt-16 sm:mt-20 py-6 sm:py-8 border-t border-light-400/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Image src="/logo.svg" alt="Acevox" width={24} height={24} className="w-6 h-6 sm:w-7 sm:h-7" />
              <p className="text-sm text-light-400">© {new Date().getFullYear()} Acevox. All rights reserved.</p>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-6">
              <Link href="/" className="text-light-400 hover:text-[#4facff] transition-colors text-xs sm:text-sm">
                Privacy Policy
              </Link>
              <Link href="/" className="text-light-400 hover:text-[#4facff] transition-colors text-xs sm:text-sm">
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
