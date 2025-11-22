import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Shield, Lock, Eye, Server } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Security | Evo Lead AI',
  description: 'Learn about our security practices and data protection',
}

export default function SecurityPage() {
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
          <Shield className="h-16 w-16 text-primary mb-6" />
          <h1 className="text-4xl font-bold mb-4">Security</h1>
          <p className="text-xl text-muted-foreground mb-12">
            Your data security and privacy are our top priorities
          </p>

          <div className="space-y-8">
            <div className="border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Lock className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h2 className="text-xl font-semibold mb-2">Data Encryption</h2>
                  <p className="text-muted-foreground">
                    All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. 
                    Your sensitive information is protected with industry-standard security protocols.
                  </p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Eye className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h2 className="text-xl font-semibold mb-2">Privacy Controls</h2>
                  <p className="text-muted-foreground">
                    We implement strict access controls and data isolation. Your organization's data 
                    is completely separate from other tenants, and you have full control over who can 
                    access your information.
                  </p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Server className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h2 className="text-xl font-semibold mb-2">Infrastructure Security</h2>
                  <p className="text-muted-foreground">
                    Our infrastructure is hosted on secure, SOC 2 compliant cloud providers. 
                    We perform regular security audits and maintain comprehensive backup systems 
                    to ensure data availability and integrity.
                  </p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Shield className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h2 className="text-xl font-semibold mb-2">Compliance</h2>
                  <p className="text-muted-foreground mb-4">
                    We are committed to maintaining compliance with major data protection regulations:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>GDPR (General Data Protection Regulation)</li>
                    <li>CCPA (California Consumer Privacy Act)</li>
                    <li>SOC 2 Type II compliance</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2">Report a Security Issue</h2>
              <p className="text-muted-foreground mb-4">
                If you discover a security vulnerability, please report it to us immediately.
              </p>
              <a 
                href="mailto:security@evotechstudio.dev" 
                className="text-primary hover:underline"
              >
                security@evotechstudio.dev
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
