import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'GDPR Compliance | Evo Lead AI',
  description: 'GDPR compliance information for Evo Lead AI platform',
}

export default function GDPRPage() {
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
          <Shield className="h-16 w-16 text-primary mb-6" />
          <h1>GDPR Compliance</h1>
          <p className="text-muted-foreground">Last updated: November 20, 2025</p>

          <h2>1. Our Commitment to GDPR</h2>
          <p>
            Evo Lead AI is committed to protecting your personal data and respecting your privacy 
            rights under the General Data Protection Regulation (GDPR).
          </p>

          <h2>2. Your Rights Under GDPR</h2>
          <p>As a data subject, you have the following rights:</p>
          <ul>
            <li><strong>Right to Access:</strong> Request access to your personal data</li>
            <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
            <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
            <li><strong>Right to Restriction:</strong> Request restriction of processing</li>
            <li><strong>Right to Data Portability:</strong> Receive your data in a structured format</li>
            <li><strong>Right to Object:</strong> Object to processing of your personal data</li>
            <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
          </ul>

          <h2>3. Legal Basis for Processing</h2>
          <p>We process your personal data based on:</p>
          <ul>
            <li>Your consent</li>
            <li>Performance of a contract</li>
            <li>Compliance with legal obligations</li>
            <li>Legitimate interests</li>
          </ul>

          <h2>4. Data Protection Measures</h2>
          <p>
            We implement appropriate technical and organizational measures to ensure a level of 
            security appropriate to the risk, including:
          </p>
          <ul>
            <li>Encryption of personal data</li>
            <li>Regular security assessments</li>
            <li>Access controls and authentication</li>
            <li>Data backup and recovery procedures</li>
            <li>Employee training on data protection</li>
          </ul>

          <h2>5. Data Retention</h2>
          <p>
            We retain personal data only for as long as necessary to fulfill the purposes for 
            which it was collected, or as required by law.
          </p>

          <h2>6. International Data Transfers</h2>
          <p>
            When we transfer personal data outside the EEA, we ensure appropriate safeguards 
            are in place, such as standard contractual clauses.
          </p>

          <h2>7. Data Breach Notification</h2>
          <p>
            In the event of a data breach, we will notify the relevant supervisory authority 
            within 72 hours and affected individuals without undue delay.
          </p>

          <h2>8. Exercising Your Rights</h2>
          <p>
            To exercise any of your GDPR rights, please contact our Data Protection Officer at{' '}
            <a href="mailto:dpo@evotechstudio.dev">dpo@evotechstudio.dev</a>
          </p>

          <h2>9. Supervisory Authority</h2>
          <p>
            You have the right to lodge a complaint with your local data protection supervisory 
            authority if you believe your rights have been violated.
          </p>

          <h2>10. Contact Information</h2>
          <p>
            For any questions regarding GDPR compliance, please contact us at{' '}
            <a href="mailto:info@evotechstudio.dev">info@evotechstudio.dev</a>
          </p>
        </div>
      </div>
    </div>
  )
}
