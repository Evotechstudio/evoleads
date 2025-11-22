import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | Evo Lead AI',
  description: 'Terms of service for Evo Lead AI platform',
}

export default function TermsPage() {
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

        <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
          <h1>Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: November 20, 2025</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Evo Lead AI, you accept and agree to be bound by the terms 
            and provision of this agreement.
          </p>

          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily access and use Evo Lead AI for personal or 
            commercial purposes. This is the grant of a license, not a transfer of title.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account and password. 
            You agree to accept responsibility for all activities that occur under your account.
          </p>

          <h2>4. Prohibited Uses</h2>
          <p>You may not use Evo Lead AI:</p>
          <ul>
            <li>In any way that violates applicable laws or regulations</li>
            <li>To transmit harmful or malicious code</li>
            <li>To impersonate or attempt to impersonate others</li>
            <li>To engage in unauthorized access or data scraping</li>
            <li>To interfere with the proper functioning of the service</li>
          </ul>

          <h2>5. Intellectual Property</h2>
          <p>
            The service and its original content, features, and functionality are owned by 
            Evo Lead AI and are protected by international copyright, trademark, and other 
            intellectual property laws.
          </p>

          <h2>6. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the service immediately, 
            without prior notice, for conduct that we believe violates these Terms of Service.
          </p>

          <h2>7. Limitation of Liability</h2>
          <p>
            In no event shall Evo Lead AI be liable for any indirect, incidental, special, 
            consequential, or punitive damages resulting from your use of the service.
          </p>

          <h2>8. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of 
            any material changes via email or through the service.
          </p>

          <h2>9. Contact Information</h2>
          <p>
            Questions about the Terms of Service should be sent to{' '}
            <a href="mailto:info@evotechstudio.dev">info@evotechstudio.dev</a>
          </p>
        </div>
      </div>
    </div>
  )
}
