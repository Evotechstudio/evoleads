import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Activity } from 'lucide-react'

export const metadata: Metadata = {
  title: 'System Status | Evo Lead AI',
  description: 'Check the current status of Evo Lead AI services',
}

export default function StatusPage() {
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
          <h1 className="text-4xl font-bold mb-4">System Status</h1>
          <p className="text-xl text-muted-foreground mb-12">
            Current operational status of Evo Lead AI services
          </p>

          <div className="space-y-4">
            <div className="border rounded-lg p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <h3 className="font-semibold">API Services</h3>
                  <p className="text-sm text-muted-foreground">All systems operational</p>
                </div>
              </div>
              <span className="text-green-500 font-medium">Operational</span>
            </div>

            <div className="border rounded-lg p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <h3 className="font-semibold">Dashboard</h3>
                  <p className="text-sm text-muted-foreground">All systems operational</p>
                </div>
              </div>
              <span className="text-green-500 font-medium">Operational</span>
            </div>

            <div className="border rounded-lg p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <h3 className="font-semibold">Authentication</h3>
                  <p className="text-sm text-muted-foreground">All systems operational</p>
                </div>
              </div>
              <span className="text-green-500 font-medium">Operational</span>
            </div>

            <div className="border rounded-lg p-6 flex items-center gap-4">
              <Activity className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold mb-2">Performance Metrics</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Uptime</p>
                    <p className="font-semibold">99.9%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Response Time</p>
                    <p className="font-semibold">120ms</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">API Success Rate</p>
                    <p className="font-semibold">99.8%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
