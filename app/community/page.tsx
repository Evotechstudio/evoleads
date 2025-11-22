import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Users, MessageSquare, Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Community | Evo Lead AI',
  description: 'Join the Evo Lead AI community',
}

export default function CommunityPage() {
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

        <div className="max-w-4xl mx-auto text-center">
          <Users className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Join Our Community</h1>
          <p className="text-xl text-muted-foreground mb-12">
            Connect with other Evo Lead AI users, share insights, and grow together
          </p>

          <div className="grid gap-8 md:grid-cols-3 text-left">
            <div className="border rounded-lg p-6">
              <MessageSquare className="h-8 w-8 text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Discussions</h2>
              <p className="text-muted-foreground">
                Share ideas, ask questions, and learn from other users
              </p>
            </div>

            <div className="border rounded-lg p-6">
              <Heart className="h-8 w-8 text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Support</h2>
              <p className="text-muted-foreground">
                Get help from experienced community members
              </p>
            </div>

            <div className="border rounded-lg p-6">
              <Users className="h-8 w-8 text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Network</h2>
              <p className="text-muted-foreground">
                Build connections with like-minded professionals
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
