import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Search, MessageCircle, Book, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Help Center | Evo Lead AI',
  description: 'Get help and support for Evo Lead AI platform',
}

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-muted-foreground mb-12">
            Find answers and get support for Evo Lead AI
          </p>

          <div className="grid gap-6 md:grid-cols-2 mb-12">
            <div className="border rounded-lg p-6 hover:border-primary transition-colors">
              <Book className="h-8 w-8 text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Documentation</h2>
              <p className="text-muted-foreground mb-4">
                Comprehensive guides and tutorials to get you started
              </p>
              <Link href="/docs" className="text-primary hover:underline">
                View Documentation →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:border-primary transition-colors">
              <MessageCircle className="h-8 w-8 text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Community</h2>
              <p className="text-muted-foreground mb-4">
                Connect with other users and share experiences
              </p>
              <Link href="/community" className="text-primary hover:underline">
                Join Community →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:border-primary transition-colors">
              <Search className="h-8 w-8 text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">FAQs</h2>
              <p className="text-muted-foreground mb-4">
                Quick answers to common questions
              </p>
              <Link href="/#faq" className="text-primary hover:underline">
                Browse FAQs →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:border-primary transition-colors">
              <Mail className="h-8 w-8 text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Contact Support</h2>
              <p className="text-muted-foreground mb-4">
                Get in touch with our support team
              </p>
              <a 
                href="mailto:info@evotechstudio.dev" 
                className="text-primary hover:underline"
              >
                Email Support →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
