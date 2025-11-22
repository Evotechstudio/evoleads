'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { ModernCard, ModernCardContent, ModernCardHeader } from './modern-card'
import { AnimatedCounter } from './animated-counter'
import { ProgressRing } from './progress-ring'
import { cn } from '../../lib/utils'

interface StatsCardProps {
  title: string
  value: number | string
  suffix?: string
  prefix?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  progress?: number
  color?: 'primary' | 'green' | 'blue' | 'purple' | 'orange' | 'red'
  className?: string
  showProgress?: boolean
  animated?: boolean
}

const colorVariants = {
  primary: {
    bg: 'from-primary/5 to-primary/10',
    icon: 'text-primary',
    iconBg: 'bg-primary/10 group-hover:bg-primary/20',
    text: 'group-hover:text-primary',
    progress: 'hsl(var(--primary))'
  },
  green: {
    bg: 'from-green-500/5 to-green-500/10',
    icon: 'text-green-600',
    iconBg: 'bg-green-500/10 group-hover:bg-green-500/20',
    text: 'group-hover:text-green-600',
    progress: 'hsl(142 76% 36%)'
  },
  blue: {
    bg: 'from-blue-500/5 to-blue-500/10',
    icon: 'text-blue-600',
    iconBg: 'bg-blue-500/10 group-hover:bg-blue-500/20',
    text: 'group-hover:text-blue-600',
    progress: 'hsl(217 91% 60%)'
  },
  purple: {
    bg: 'from-purple-500/5 to-purple-500/10',
    icon: 'text-purple-600',
    iconBg: 'bg-purple-500/10 group-hover:bg-purple-500/20',
    text: 'group-hover:text-purple-600',
    progress: 'hsl(262 83% 58%)'
  },
  orange: {
    bg: 'from-orange-500/5 to-orange-500/10',
    icon: 'text-orange-600',
    iconBg: 'bg-orange-500/10 group-hover:bg-orange-500/20',
    text: 'group-hover:text-orange-600',
    progress: 'hsl(25 95% 53%)'
  },
  red: {
    bg: 'from-red-500/5 to-red-500/10',
    icon: 'text-red-600',
    iconBg: 'bg-red-500/10 group-hover:bg-red-500/20',
    text: 'group-hover:text-red-600',
    progress: 'hsl(0 84% 60%)'
  }
}

export function StatsCard({
  title,
  value,
  suffix = '',
  prefix = '',
  icon: Icon,
  trend,
  progress,
  color = 'primary',
  className,
  showProgress = false,
  animated = true
}: StatsCardProps) {
  const colors = colorVariants[color]

  return (
    <ModernCard 
      variant="interactive" 
      className={cn(
        'border-0 shadow-lg group relative overflow-hidden',
        `bg-gradient-to-br ${colors.bg}`,
        className
      )}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg.replace('/5', '/10').replace('/10', '/20')} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      <ModernCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <h3 className={cn('text-sm font-medium transition-colors', colors.text)}>
          {title}
        </h3>
        <motion.div 
          className={cn('p-2 rounded-lg transition-all duration-300', colors.iconBg)}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <Icon className={cn('h-4 w-4', colors.icon)} />
        </motion.div>
      </ModernCardHeader>
      
      <ModernCardContent className="relative z-10">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <div className={cn('text-2xl font-bold transition-colors', colors.text)}>
              {animated && typeof value === 'number' ? (
                <AnimatedCounter 
                  to={value} 
                  suffix={suffix}
                  prefix={prefix}
                />
              ) : (
                `${prefix}${value}${suffix}`
              )}
            </div>
            
            {trend && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={cn(
                  'text-xs mt-1 flex items-center',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                <span className="mr-1">
                  {trend.isPositive ? '↗' : '↘'}
                </span>
                {Math.abs(trend.value)}%
              </motion.div>
            )}
          </div>
          
          {showProgress && progress !== undefined && (
            <ProgressRing 
              progress={progress} 
              size={40} 
              strokeWidth={4}
              showPercentage={false}
              color={colors.progress}
            />
          )}
        </div>
      </ModernCardContent>
    </ModernCard>
  )
}