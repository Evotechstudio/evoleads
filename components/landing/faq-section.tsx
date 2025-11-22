'use client'

import { useState } from 'react'
import { Card, CardContent } from '../ui/card'
import { ChevronDown, ChevronUp } from 'lucide-react'

const faqs = [
  {
    question: 'How does the free trial work?',
    answer: 'You get 2 free searches (up to 200 leads total) when you sign up. No credit card required. You can explore all features and see the quality of our data before deciding to upgrade.',
  },
  {
    question: 'What is a credit and how many leads do I get?',
    answer: 'One credit equals 100 leads. So with the Starter plan (20 credits), you get up to 2,000 leads per month. The Growth plan (80 credits) gives you 8,000 leads, and the Agency plan (300 credits) provides 30,000 leads.',
  },
  {
    question: 'How accurate is your lead data?',
    answer: 'Our AI-powered system maintains a 95% accuracy rate. Each lead comes with a confidence score so you can prioritize your outreach. We continuously update our database and verify contact information.',
  },
  {
    question: 'Can I use Evo Lead AI for multiple businesses?',
    answer: 'Yes! Our multi-tenant organization system allows you to create separate workspaces for different businesses or clients. Each organization has its own data, credits, and team members.',
  },
  {
    question: 'What export formats do you support?',
    answer: 'You can export leads in CSV and Excel formats. We also provide API access for custom integrations and plan to add direct CRM integrations (Salesforce, HubSpot, Pipedrive) soon.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use enterprise-grade security with OAuth authentication, encrypted data storage, and Row Level Security (RLS) to ensure complete data isolation between organizations.',
  },
  {
    question: 'Can I invite team members to my organization?',
    answer: 'Yes, you can invite unlimited team members to collaborate within your organization. Each member can access shared leads and contribute to your lead generation efforts.',
  },
  {
    question: 'What countries and regions do you cover?',
    answer: 'We provide global coverage with detailed business data from major markets. Our location search includes country, state/province, and city-level targeting for precise lead generation.',
  },
  {
    question: 'How does billing work?',
    answer: 'We use Safepay for secure payment processing in Pakistani Rupees (PKR). Plans are billed monthly, and you can upgrade, downgrade, or cancel anytime. Unused credits don\'t roll over to the next month.',
  },
  {
    question: 'Do you offer customer support?',
    answer: 'Yes! Starter plan includes email support, Growth plan gets priority email support, and Agency plan includes a dedicated account manager. We also have comprehensive documentation and tutorials.',
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
            Frequently asked{' '}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              questions
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about Evo Lead AI. Can't find what you're looking for? 
            Contact our support team.
          </p>
        </div>

        <div className="mx-auto max-w-3xl space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="group border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 overflow-hidden">
              <CardContent className="p-0">
                <button
                  className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg transition-all duration-200 hover:bg-accent/50"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={openIndex === index}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold pr-4 group-hover:text-primary transition-colors duration-200">{faq.question}</h3>
                    <div className="flex-shrink-0">
                      {openIndex === index ? (
                        <ChevronUp className="h-5 w-5 text-primary transition-transform duration-200" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all duration-200" />
                      )}
                    </div>
                  </div>
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-6 pb-6">
                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4" />
                    <p className="text-muted-foreground leading-relaxed animate-in">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Support CTA */}
        <div className="mt-16 text-center">
          <Card className="border-0 bg-gradient-to-r from-primary/5 to-purple-500/5 inline-block">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
              <p className="text-muted-foreground mb-4">
                Our support team is here to help you get the most out of Evo Lead AI.
              </p>
              <div className="space-x-4">
                <a 
                  href="mailto:support@evoleadai.com" 
                  className="text-primary hover:underline font-medium"
                >
                  info@evotechstudio.dev
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}