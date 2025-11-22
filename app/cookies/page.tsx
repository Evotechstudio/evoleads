import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cookie Policy | Evo Lead AI',
  description: 'Cookie policy for Evo Lead AI platform',
}

export default function CookiesPage() {
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
          <h1>Cookie Policy</h1>
          <p className="text-muted-foreground">Last updated: November 20, 2025</p>

          <h2>1. What Are Cookies</h2>
          <p>
            Cookies are small text files that are placed on your device when you visit our 
            website. They help us provide you with a better experience by remembering your 
            preferences and understanding how you use our service.
          </p>

          <h2>2. How We Use Cookies</h2>
          <p>We use cookies for the following purposes:</p>
          <ul>
            <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
            <li><strong>Authentication:</strong> To keep you logged in and secure your session</li>
            <li><strong>Preferences:</strong> To remember your settings and preferences</li>
            <li><strong>Analytics:</strong> To understand how visitors use our website</li>
            <li><strong>Performance:</strong> To improve website speed and functionality</li>
          </ul>

          <h2>3. Types of Cookies We Use</h2>
          
          <h3>Essential Cookies</h3>
          <p>
            These cookies are necessary for the website to function and cannot be switched off. 
            They are usually set in response to actions you take, such as logging in or filling 
            out forms.
          </p>

          <h3>Analytics Cookies</h3>
          <p>
            These cookies help us understand how visitors interact with our website by collecting 
            and reporting information anonymously.
          </p>

          <h3>Functional Cookies</h3>
          <p>
            These cookies enable enhanced functionality and personalization, such as remembering 
            your preferences and settings.
          </p>

          <h2>4. Third-Party Cookies</h2>
          <p>
            We may use third-party services that set cookies on your device. These services 
            include analytics providers and authentication services.
          </p>

          <h2>5. Managing Cookies</h2>
          <p>
            You can control and manage cookies through your browser settings. However, disabling 
            cookies may affect the functionality of our website.
          </p>

          <h2>6. Updates to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time. We will notify you of any 
            changes by posting the new policy on this page.
          </p>

          <h2>7. Contact Us</h2>
          <p>
            If you have questions about our use of cookies, please contact us at{' '}
            <a href="mailto:info@evotechstudio.dev">info@evotechstudio.dev</a>
          </p>
        </div>
      </div>
    </div>
  )
}
