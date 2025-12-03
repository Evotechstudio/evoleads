'use client'

import Link from 'next/link'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Check, Zap, Users, Building2, ArrowRight } from 'lucide-react'

const plans = [
  {
    name: 'Trial',
    price: 'Free',
    period: '',
    description: 'Perfect for trying out our platform',
    credits: '2 search requests',
    icon: Zap,
    popular: false,
    isCurrent: true,
    features: [
      '2 search requests',
      '20 leads total',
      'Basic lead information',
      'CSV export',
    ],
  },
  {
    name: 'Starter',
    price: '₨4,200',
    period: '/month',
    description: 'Ideal for growing businesses and sales teams',
    credits: 'Unlimited search requests',
    icon: Users,
    popular: true,
    isCurrent: false,
    features: [
      'Unlimited search requests',
      '250 leads per month',
      'Advanced lead information',
      'CSV/Excel export',
      'Priority support',
    ],
  },
  {
    name: 'Pro',
    price: '₨13,720',
    period: '/month',
    description: 'Built for agencies and large enterprises',
    credits: 'Unlimited search requests',
    icon: Building2,
    popular: false,
    isCurrent: false,
    features: [
      'Unlimited search requests',
      '1,000 leads per month',
      'Premium lead information',
      'All export formats',
      'API access',
      'Team collaboration',
    ],
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Plan
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Unlock More Leads - Upgrade to get unlimited searches and more leads per month
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-stretch">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`group relative overflow-hidden flex flex-col ${
                plan.popular 
                  ? 'border-primary shadow-xl shadow-primary/20 lg:scale-105 bg-gradient-to-br from-primary/5 to-purple-500/5' 
                  : 'border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10'
              } transition-all duration-500 hover:scale-105 cursor-pointer`}
            >
              {plan.isCurrent && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                  <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-3 py-1 text-xs shadow-lg">
                    Basic Plan
                  </Badge>
                </div>
              )}
              {plan.popular && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                  <Badge className="bg-gradient-to-r from-blue-500 to-cyan-700 text-primary-foreground px-3 py-1 text-xs shadow-lg animate-pulse">
                    Most Popular
                  </Badge>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardHeader className={`text-center pb-6 relative z-10 ${plan.isCurrent || plan.popular ? 'pt-12' : 'pt-6'}`}>
                <div className="flex items-center justify-center mb-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 ${
                    plan.popular 
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-700 text-primary-foreground shadow-lg' 
                      : 'bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary group-hover:from-primary/20 group-hover:to-purple-500/20'
                  }`}>
                    <plan.icon className="h-7 w-7" />
                  </div>
                </div>
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-sm min-h-[40px]">{plan.description}</CardDescription>
                <div className="mt-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground text-base">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.credits}</p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 relative z-10 flex-grow flex flex-col pb-6">
                <Link href="/sign-up" className="block">
                  <Button 
                    className="w-full group/btn"
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </Link>

                <div className="space-y-3 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm text-muted-foreground leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>


      </div>
    </section>
  )
}