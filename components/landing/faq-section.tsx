'use client'

import { useState } from 'react'
import { Card, CardContent } from '../ui/card'
import { ChevronDown, ChevronUp } from 'lucide-react'

const faqs = [
  {
    question: 'How does the free trial work?',
    answer: 'You get 2 free search requests with up to 20 leads total when you sign up. No credit card required. You can explore all features including basic lead information and CSV export to see the quality of our data before deciding to upgrade.',
  },
  {
    question: 'What are the differences between plans?',
    answer: 'Trial plan offers 2 search requests and 20 leads total. Starter plan (₨4,200/month) provides unlimited search requests with 250 leads per month, advanced lead information, CSV/Excel export, and priority support. Pro plan (₨13,720/month) includes unlimited searches, 1,000 leads per month, premium lead information, all export formats, API access, and team collaboration features.',
  },
  {
    question: 'What does "unlimited search requests" mean?',
    answer: 'With Starter and Pro plans, you can perform as many searches as you need without any restrictions. The only limit is the total number of leads you can generate per month (250 for Starter, 1,000 for Pro). This allows you to refine your searches and target specific industries and locations without worrying about search limits.',
  },
  {
    question: 'How accurate is your lead data?',
    answer: 'Our AI-powered system maintains a 95% accuracy rate. Each lead comes with a confidence score so you can prioritize your outreach. We source data from verified business directories and continuously update our database to ensure you get the most current and accurate contact information.',
  },
  {
    question: 'What information is included in each lead?',
    answer: 'Basic leads include business name and contact details. Advanced leads (Starter plan) add location data, ratings, and reviews. Premium leads (Pro plan) include comprehensive business information, social profiles, and enhanced verification. All leads come with confidence scores to help you prioritize outreach.',
  },
  {
    question: 'What export formats do you support?',
    answer: 'Trial and Starter plans support CSV export. Starter plan also includes Excel format. Pro plan provides all export formats including CSV, Excel, and JSON, plus API access for custom integrations with your existing tools and CRM systems.',
  },
  {
    question: 'Can I use Evo Lead AI for team collaboration?',
    answer: 'Yes! The Pro plan includes team collaboration features, allowing multiple team members to work together, share leads, and coordinate outreach efforts. Each team member can access shared leads and contribute to your lead generation strategy.',
  },
  {
    question: 'What countries and regions do you cover?',
    answer: 'We provide global coverage with detailed business data from major markets worldwide. Our location search includes country, state/province, and city-level targeting for precise lead generation. You can target specific geographic areas to find businesses in your desired locations.',
  },
  {
    question: 'How does billing work?',
    answer: 'We accept payments in Pakistani Rupees (PKR) through secure payment processing. Plans are billed monthly. You can upgrade or downgrade your plan anytime, and changes take effect immediately. You can also cancel your subscription at any time with no long-term commitments.',
  },
  {
    question: 'What kind of support do you offer?',
    answer: 'Trial plan users have access to our documentation and tutorials. Starter plan includes priority email support with faster response times. Pro plan users get dedicated support with API assistance and team onboarding help. All plans have access to our comprehensive knowledge base.',
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
            <span className="bg-gradient-to-r from-primary from-blue-500 to-cyan-500 bg-clip-text text-transparent">
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