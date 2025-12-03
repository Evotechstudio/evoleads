'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '../ui/button'
import { AnimatedCounter } from '../ui/animated-counter'
import { FloatingElement, GradientOrb, PulsingDot } from '../ui/floating-elements'
import { ArrowRight, Sparkles, Target, Users, Zap, TrendingUp, Globe } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 dark:to-primary/10 py-20 sm:py-32">
      {/* Enhanced Background decoration */}
      <div className="absolute inset-0 -z-10">
        <GradientOrb 
          size="xl" 
          className="absolute left-1/2 top-0 -translate-x-1/2 transform" 
          colors={['primary', 'purple-500']}
        />
        <GradientOrb 
          size="lg" 
          className="absolute right-0 top-1/2 -translate-y-1/2 transform" 
          colors={['blue-500', 'cyan-500']}
        />
        
        {/* Floating elements */}
        <FloatingElement delay={0} className="absolute top-20 left-10">
          <PulsingDot size="sm" />
        </FloatingElement>
        <FloatingElement delay={2} className="absolute top-40 right-20">
          <PulsingDot size="md" />
        </FloatingElement>
        <FloatingElement delay={4} className="absolute bottom-40 left-20">
          <PulsingDot size="lg" />
        </FloatingElement>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Enhanced Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 inline-flex items-center rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-purple-500/10 dark:from-primary/20 dark:to-purple-500/20 px-6 py-3 text-sm backdrop-blur hover:from-primary/20 hover:to-purple-500/20 dark:hover:from-primary/30 dark:hover:to-purple-500/30 transition-all duration-300 cursor-default shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            <span className="text-primary font-medium">
              AI-Powered Lead Generation Platform
            </span>
            <Zap className="h-4 w-4 text-primary ml-2" />
          </motion.div>

          {/* Enhanced Main Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
          >
            Generate High-Quality{' '}
            <motion.span 
              className="bg-gradient-to-r from-primary from-blue-500 to-cyan-500 bg-clip-text text-transparent relative"
              animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              Business Leads
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-600/20 blur-lg -z-10"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.span>{' '}
            with AI
          </motion.h1>

          {/* Enhanced Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8 text-lg text-muted-foreground sm:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed"
          >
            Transform your sales pipeline with our intelligent lead generation platform. 
            Find verified business contacts, organize your team, and scale your outreach 
            with confidence scores and multi-tenant collaboration.
          </motion.p>

          {/* Enhanced CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-12 flex flex-col gap-4 sm:flex-row sm:justify-center"
          >
            <Link href="/sign-up">
              <Button variant="default" size="lg" className="w-full sm:w-auto group relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  whileHover={{ scale: 1.05 }}
                />
                <span className="relative z-10">Start Free Trial</span>
                <motion.div
                  className="relative z-10 ml-2"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.div>
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 group">
                <Globe className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                See How It Works
              </Button>
            </Link>
          </motion.div>

          {/* Enhanced Social Proof Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-2xl mx-auto"
          >
            <motion.div 
              className="text-center group cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-center mb-2">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                >
                  <Target className="h-6 w-6 text-primary mr-2 group-hover:text-purple-600 transition-colors" />
                </motion.div>
                <AnimatedCounter 
                  to={10} 
                  suffix="M+" 
                  className="text-2xl font-bold group-hover:text-primary transition-colors"
                />
              </div>
              <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Verified Business Contacts</p>
            </motion.div>
            
            <motion.div 
              className="text-center group cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-primary mr-2 group-hover:text-blue-600 transition-colors" />
                <AnimatedCounter 
                  to={100} 
                  suffix="+" 
                  className="text-2xl font-bold group-hover:text-primary transition-colors"
                />
              </div>
              <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Active Users</p>
            </motion.div>
            
            <motion.div 
              className="text-center group cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-6 w-6 text-primary mr-2 group-hover:text-green-600 transition-colors" />
                <AnimatedCounter 
                  to={95} 
                  suffix="%" 
                  className="text-2xl font-bold group-hover:text-primary transition-colors"
                />
              </div>
              <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Accuracy Rate</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}