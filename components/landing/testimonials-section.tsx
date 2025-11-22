'use client'

import { Card, CardContent } from '../ui/card'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Sales Director',
    company: 'TechFlow Solutions',
    avatar: 'SC',
    content: 'Evo Lead AI transformed our lead generation process. We\'ve increased our qualified leads by 300% and our team loves the collaborative features.',
    rating: 5,
  },
  {
    name: 'Ahmed Hassan',
    role: 'Marketing Manager',
    company: 'Digital Growth Co.',
    avatar: 'AH',
    content: 'The AI-powered search is incredibly accurate. The confidence scores help us prioritize our outreach and focus on the best prospects.',
    rating: 5,
  },
  {
    name: 'Maria Rodriguez',
    role: 'Business Development',
    company: 'Scale Ventures',
    avatar: 'MR',
    content: 'Multi-tenant organizations are a game-changer. We can manage leads for multiple clients seamlessly while keeping data completely separate.',
    rating: 5,
  },
  {
    name: 'David Kim',
    role: 'Founder',
    company: 'StartupBoost',
    avatar: 'DK',
    content: 'The pricing is very reasonable for Pakistani businesses. We started with the trial and quickly upgraded to Growth plan.',
    rating: 5,
  },
  {
    name: 'Fatima Ali',
    role: 'Sales Team Lead',
    company: 'ProSales Agency',
    avatar: 'FA',
    content: 'Export features are excellent. We can easily integrate with our CRM and the CSV exports are perfectly formatted.',
    rating: 5,
  },
  {
    name: 'John Thompson',
    role: 'VP of Sales',
    company: 'Global Reach Ltd.',
    avatar: 'JT',
    content: 'Customer support is outstanding. The team is responsive and helped us set up our organization structure perfectly.',
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
            Trusted by{' '}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              sales teams
            </span>{' '}
            worldwide
          </h2>
          <p className="text-lg text-muted-foreground">
            See what our customers are saying about their experience with Evo Lead AI.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 bg-background/50 backdrop-blur hover:bg-background/80 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <blockquote className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium rounded-full">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20">
          <Card className="border-0 bg-gradient-to-r from-primary/5 to-purple-500/5">
            <CardContent className="p-8 sm:p-12">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">500+</div>
                  <div className="text-sm text-muted-foreground">Active Organizations</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">10M+</div>
                  <div className="text-sm text-muted-foreground">Leads Generated</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">95%</div>
                  <div className="text-sm text-muted-foreground">Customer Satisfaction</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                  <div className="text-sm text-muted-foreground">Support Available</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}