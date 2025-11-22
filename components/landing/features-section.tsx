'use client'

import { motion } from 'framer-motion'
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { FloatingElement } from '../ui/floating-elements'
import { 
  Users, 
  Shield, 
  Zap, 
  Target, 
  Download,
  Search,
  BarChart3,
  Globe
} from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'AI-Powered Search',
    description: 'Advanced AI algorithms analyze business data to find the most relevant leads with high confidence scores.',
  },
  {
    icon: Shield,
    title: 'Multi-Tenant Organizations',
    description: 'Collaborate with your team in shared workspaces with role-based access and data isolation.',
  },
  {
    icon: Search,
    title: 'Precision Targeting',
    description: 'Filter by business type, location, company size, and industry to find your ideal prospects.',
  },
  {
    icon: Zap,
    title: 'Data Security',
    description: 'Enterprise-grade security with OAuth authentication and encrypted data storage.',
  },
  {
    icon: Users,
    title: 'Easy Export',
    description: 'Export leads to CSV, Excel, or integrate directly with your favorite CRM platforms.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Results',
    description: 'Get instant lead generation results with live progress tracking and notifications.',
  },
  {
    icon: Globe,
    title: 'Advanced Filtering',
    description: 'Powerful search capabilities with location cascading and custom field filtering.',
  },
  {
    icon: Target,
    title: 'Usage Analytics',
    description: 'Track your team\'s performance with detailed analytics and usage insights.',
  },
  {
    icon: Download,
    title: 'Global Coverage',
    description: 'Access business data from multiple countries with localized search capabilities.',
  },
]

export function FeaturesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <section id="features" className="py-20 sm:py-32 bg-gradient-to-b from-muted/30 via-background to-muted/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <FloatingElement delay={0} className="absolute top-20 left-10 opacity-30">
          <div className="w-2 h-2 bg-primary rounded-full" />
        </FloatingElement>
        <FloatingElement delay={2} className="absolute top-40 right-20 opacity-30">
          <div className="w-3 h-3 bg-purple-500 rounded-full" />
        </FloatingElement>
        <FloatingElement delay={4} className="absolute bottom-40 left-1/4 opacity-30">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
        </FloatingElement>
      </div>

      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-2xl text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
            Everything you need to{' '}
            <span className="text-blue-600 dark:text-blue-400">
              scale your outreach
            </span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Our comprehensive platform provides all the tools your team needs to generate, 
            manage, and convert high-quality business leads.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <ModernCard 
                hover={false}
                className="h-full relative overflow-hidden"
              >
                <ModernCardHeader className="pb-4 relative z-10">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10"
                    >
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <ModernCardTitle className="text-lg">
                      {feature.title}
                    </ModernCardTitle>
                  </div>
                </ModernCardHeader>
                <ModernCardContent className="relative z-10">
                  <ModernCardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </ModernCardDescription>
                </ModernCardContent>
              </ModernCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Feature Highlight */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20"
        >
          <ModernCard variant="gradient" hover={false} className="overflow-hidden border-0">
            <ModernCardContent className="p-8 sm:p-12">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-center">
                <div>
                  <motion.h3 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-3xl font-bold mb-6 text-foreground"
                  >
                    Powered by Advanced AI Technology
                  </motion.h3>
                  <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-muted-foreground mb-4 text-lg leading-relaxed"
                  >
                    Our proprietary AI engine combines multiple data sources, natural language processing, 
                    and machine learning to deliver the most accurate and up-to-date business contact information. 
                    Each lead comes with a confidence score so you know exactly how reliable the data is.
                  </motion.p>
                  <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.45 }}
                    className="text-muted-foreground mb-6 text-base leading-relaxed"
                  >
                    Leverage cutting-edge artificial intelligence to automate your lead generation process. 
                    Our system continuously learns and adapts to provide better results, helping you identify 
                    high-value prospects faster than ever before. With real-time data validation and enrichment, 
                    you can trust that every lead is verified and ready for outreach.
                  </motion.p>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="grid grid-cols-2 gap-4 mb-6"
                  >
                    <div className="text-center p-4 rounded-lg bg-background/50 backdrop-blur">
                      <div className="text-3xl font-bold text-primary mb-1">95%</div>
                      <div className="text-sm text-muted-foreground">Data Accuracy</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-background/50 backdrop-blur">
                      <div className="text-3xl font-bold text-primary mb-1">&lt;2s</div>
                      <div className="text-sm text-muted-foreground">Average Response Time</div>
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.55 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="text-center p-4 rounded-lg bg-background/50 backdrop-blur">
                      <div className="text-3xl font-bold text-primary mb-1">10M+</div>
                      <div className="text-sm text-muted-foreground">Leads Generated</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-background/50 backdrop-blur">
                      <div className="text-3xl font-bold text-primary mb-1">24/7</div>
                      <div className="text-sm text-muted-foreground">AI Processing</div>
                    </div>
                  </motion.div>
                </div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="relative"
                >
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center relative overflow-hidden">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                    />
                    <motion.div
                      animate={{ 
                        scale: [1, 1.05, 1],
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="relative z-10 w-full h-full"
                    >
                      <img 
                        src="https://img.freepik.com/free-vector/isometric-business-concept-man-thinking-crm-system-artificial-intelligence-robot-ai_39422-771.jpg"
                        alt="AI-Powered CRM System"
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </motion.div>
      </div>
    </section>
  )
}