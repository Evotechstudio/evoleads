'use client'

import React, { useState, useEffect } from 'react'
import { Navbar } from './navbar'
import { Sidebar } from './sidebar'
import { ErrorBoundary } from '../ui/error-boundary'
import { cn } from '../../lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
  className?: string
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false)
  }

  // Lock body scroll when mobile menu is open
  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = '0px' // Prevent layout shift
    } else {
      document.body.style.overflow = 'unset'
      document.body.style.paddingRight = 'unset'
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
      document.body.style.paddingRight = 'unset'
    }
  }, [isMobileMenuOpen])

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar 
        onMobileMenuToggle={handleMobileMenuToggle}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex">
          <Sidebar />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
              onClick={handleMobileMenuClose}
            />
            
            {/* Mobile Sidebar */}
            <aside className="fixed left-0 top-0 z-50 h-full w-72 md:hidden animate-in slide-in-from-left duration-300 ease-out">
              <Sidebar 
                onClose={handleMobileMenuClose}
                className="h-full border-r-0 shadow-2xl"
              />
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className={cn(
          'flex-1 overflow-auto',
          className
        )}>
          <ErrorBoundary>
            <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
              {children}
            </div>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}

// Simple layout for pages that don't need sidebar
interface SimpleLayoutProps {
  children: React.ReactNode
  className?: string
}

export function SimpleLayout({ children, className }: SimpleLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className={cn('mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6', className)}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
    </div>
  )
}