'use client'

import Link from 'next/link'
import { Button } from '../ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-20 sm:py-32 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 dark:from-primary/10 dark:to-purple-500/10 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Background decoration */}
          <div className="relative">
            <div className="absolute inset-0 -z-10">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                <div className="h-96 w-96 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 dark:from-primary/30 dark:to-purple-500/30 blur-3xl animate-pulse" />
              </div>
              <div className="absolute left-1/4 top-1/4 transform">
                <div className="h-64 w-64 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
              </div>
            </div>

            {/* Content */}
            <div className="relative">
              <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-purple-500/10 dark:from-primary/20 dark:to-purple-500/20 px-4 py-2 text-sm backdrop-blur hover:from-primary/20 hover:to-purple-500/20 dark:hover:from-primary/30 dark:hover:to-purple-500/30 transition-all duration-300">
                <Sparkles className="mr-2 h-4 w-4 text-primary animate-pulse" />
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent font-medium">
                  Ready to transform your lead generation?
                </span>
              </div>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-6">
                Start generating{' '}
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  quality leads
                </span>{' '}
                today
              </h2>

              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join hundreds of businesses already using Evo Lead AI to scale their sales. 
                Get started with 2 free searches and see the difference AI-powered lead generation can make.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center mb-8">
                <Link href="/sign-up">
                  <Button variant="default" size="lg" className="w-full sm:w-auto group">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10">
                    Sign In
                  </Button>
                </Link>
              </div>

              <div className="text-sm text-muted-foreground">
                No credit card required • 2 free searches • Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}