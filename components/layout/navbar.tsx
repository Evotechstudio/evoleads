'use client'

import Link from 'next/link'
import Image from 'next/image'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { Button } from '../ui/button'
import { GetStartedButton } from '../ui/get-started-button'
import { ThemeToggle } from '../theme/theme-toggle'
import {
  Menu,
  X
} from 'lucide-react'

interface NavbarProps {
  onMobileMenuToggle?: () => void
  isMobileMenuOpen?: boolean
}

export function Navbar({ onMobileMenuToggle, isMobileMenuOpen }: NavbarProps) {

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <nav className="mx-auto flex h-16 items-center justify-between max-w-screen-6xl">
          {/* Left section */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 shrink-0"
              onClick={onMobileMenuToggle}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity">
              <Image 
                src="/EvotechLogo.png" 
                alt="Evotech Logo" 
                width={32} 
                height={32}
                className="h-8 w-8 object-contain"
                priority
              />
              <span className="hidden font-bold sm:inline-block lg:text-lg">
                EvoLeads AI
              </span>
            </Link>
          </div>

          {/* Center navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 absolute left-1/2 -translate-x-1/2">
            <Link href="#features">
              <Button variant="ghost" size="sm" className="h-9 px-3 lg:px-4">
                Features
              </Button>
            </Link>
            <Link href="#pricing">
              <Button variant="ghost" size="sm" className="h-9 px-3 lg:px-4">
                Pricing
              </Button>
            </Link>
            <Link href="#testimonials">
              <Button variant="ghost" size="sm" className="h-9 px-3 lg:px-4">
                Testimonials
              </Button>
            </Link>
            <Link href="#faq">
              <Button variant="ghost" size="sm" className="h-9 px-3 lg:px-4">
                FAQ
              </Button>
            </Link>
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
            {/* Theme toggle */}
            <ThemeToggle />

            {/* Authentication */}
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    rootBox: "flex items-center",
                    avatarBox: "w-9 h-9",
                  }
                }}
              />
            </SignedIn>

            <SignedOut>
              <div className="flex items-center gap-2">
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm" className="h-9 px-3 sm:px-4 lg:px-6">
                    Sign In
                  </Button>
                </SignInButton>
                <Link href="/sign-up">
                  <GetStartedButton />
                </Link>
              </div>
            </SignedOut>
          </div>
        </nav>
      </div>
    </header>
  )
}