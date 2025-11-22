'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Input } from '../../../components/ui/input'
import { Separator } from '../../../components/ui/separator'
import {
  Search,
  BookOpen,
  Video,
  MessageCircle,
  Mail,
  FileText,
  HelpCircle,
  Zap,
  Users,
  Settings,
  CreditCard,
  Download,
  ExternalLink,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import Link from 'next/link'

interface FAQItem {
  question: string
  answer: string
  category: string
}

interface GuideItem {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  duration?: string
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const faqs: FAQItem[] = [
    {
      question: 'How do I generate leads?',
      answer: 'Navigate to the Lead Search page, enter your search criteria (business type, location, etc.), and click "Generate Leads". The system will use Google Maps data to find relevant businesses.',
      category: 'getting-started'
    },
    {
      question: 'What information is included in each lead?',
      answer: 'Each lead includes business name, address, phone number, website, rating, review count, business category, and Google Maps URL.',
      category: 'leads'
    },
    {
      question: 'How many leads can I generate?',
      answer: 'Free plan: 2 search requests and 20 leads total. Starter plan: 50 search requests and 250 leads per month.',
      category: 'plans'
    },
    {
      question: 'Can I export my leads?',
      answer: 'Yes! You can export your leads to CSV format from the Lead Management page. Click on any search result and use the "Export to CSV" button.',
      category: 'leads'
    },
    {
      question: 'How do I upgrade my plan?',
      answer: 'Go to Billing & Plans page and click "Upgrade to Starter". You\'ll be redirected to our secure payment processor (Safepay) to complete the upgrade.',
      category: 'plans'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major payment methods through Safepay, including credit/debit cards, bank transfers, and mobile wallets (JazzCash, Easypaisa).',
      category: 'billing'
    },
    {
      question: 'How accurate is the lead data?',
      answer: 'We use Google Maps API (Serper.dev) to fetch real-time business data, ensuring high accuracy. Data is cached for 7 days to improve performance.',
      category: 'leads'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time from the Billing page. You\'ll retain access until the end of your billing period.',
      category: 'billing'
    },
    {
      question: 'What happens when I reach my lead limit?',
      answer: 'Once you reach your monthly limit, you\'ll need to upgrade your plan or wait until the next billing cycle. Your existing leads remain accessible.',
      category: 'plans'
    },
    {
      question: 'How do I contact support?',
      answer: 'You can reach us via email at info@evotechstudio.dev or use the contact form below. Starter plan users get priority support.',
      category: 'support'
    }
  ]

  const guides: GuideItem[] = [
    {
      title: 'Getting Started Guide',
      description: 'Learn the basics of Evo Lead AI and generate your first leads',
      icon: Zap,
      href: '#getting-started',
      duration: '5 min read'
    },
    {
      title: 'Lead Management',
      description: 'How to view, filter, and export your generated leads',
      icon: Users,
      href: '#lead-management',
      duration: '3 min read'
    },
    {
      title: 'Account Settings',
      description: 'Manage your profile, preferences, and security settings',
      icon: Settings,
      href: '#account-settings',
      duration: '2 min read'
    },
    {
      title: 'Billing & Subscriptions',
      description: 'Understanding plans, billing, and payment options',
      icon: CreditCard,
      href: '#billing',
      duration: '4 min read'
    }
  ]

  const categories = [
    { id: 'all', label: 'All Topics', icon: BookOpen },
    { id: 'getting-started', label: 'Getting Started', icon: Zap },
    { id: 'leads', label: 'Lead Generation', icon: Users },
    { id: 'plans', label: 'Plans & Limits', icon: CreditCard },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'support', label: 'Support', icon: MessageCircle }
  ]

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center">
          <div className="p-3 rounded-full bg-primary/10">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Help & Documentation</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Everything you need to know about Evo Lead AI
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for help articles, guides, or FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
          <CardContent className="p-6 text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-blue-500/10">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="font-semibold">Documentation</h3>
            <p className="text-sm text-muted-foreground">Comprehensive guides and tutorials</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
          <CardContent className="p-6 text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-green-500/10">
                <Video className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="font-semibold">Video Tutorials</h3>
            <p className="text-sm text-muted-foreground">Watch step-by-step guides</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
          <CardContent className="p-6 text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-purple-500/10">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="font-semibold">Community</h3>
            <p className="text-sm text-muted-foreground">Join our user community</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
          <CardContent className="p-6 text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-orange-500/10">
                <Mail className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <h3 className="font-semibold">Contact Support</h3>
            <p className="text-sm text-muted-foreground">Get help from our team</p>
          </CardContent>
        </Card>
      </div>

      {/* Popular Guides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Popular Guides
          </CardTitle>
          <CardDescription>
            Step-by-step tutorials to help you get the most out of Evo Lead AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guides.map((guide, index) => {
              const Icon = guide.icon
              return (
                <Link key={index} href={guide.href}>
                  <div className="flex items-start gap-4 p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{guide.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{guide.description}</p>
                      {guide.duration && (
                        <Badge variant="outline" className="text-xs">
                          {guide.duration}
                        </Badge>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Find quick answers to common questions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                </Button>
              )
            })}
          </div>

          <Separator />

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq, index) => (
                <div key={index} className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-primary/10 shrink-0 mt-1">
                      <HelpCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">{faq.question}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No FAQs found matching your search.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Still Need Help?
          </CardTitle>
          <CardDescription>
            Our support team is here to assist you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 shrink-0">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Email Support</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Get help via email within 24 hours
                  </p>
                  <a href="mailto:info@evotechstudio.dev" className="text-sm text-primary hover:underline">
                    info@evotechstudio.dev
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-500/10 shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Priority Support</h4>
                  <p className="text-sm text-muted-foreground">
                    Starter plan users get priority email support with faster response times
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Support Hours
                </h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM PKT</p>
                  <p>Saturday: 10:00 AM - 4:00 PM PKT</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>

              <Button className="w-full" size="lg">
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Additional Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Link href="#" className="flex items-center justify-between p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">API Documentation</p>
                  <p className="text-sm text-muted-foreground">For developers integrating with Evo Lead AI</p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </Link>

            <Link href="#" className="flex items-center justify-between p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">User Guide PDF</p>
                  <p className="text-sm text-muted-foreground">Download the complete user manual</p>
                </div>
              </div>
              <Download className="h-4 w-4 text-muted-foreground" />
            </Link>

            <Link href="#" className="flex items-center justify-between p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all">
              <div className="flex items-center gap-3">
                <Video className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Video Tutorials</p>
                  <p className="text-sm text-muted-foreground">Watch our YouTube channel for tutorials</p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
