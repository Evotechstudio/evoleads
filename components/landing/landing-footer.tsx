'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Mail, MapPin, Phone } from 'lucide-react'

const footerLinks = {
  product: [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'FAQ', href: '#faq' },
  ],
  company: [
    { name: 'About Us', href: 'https://www.evotechstudio.dev/about/', target: '_blank' },
    { name: 'Blog', href: 'https://www.evotechstudio.dev/blogs/', target: '_blank' },
    { name: 'Portfolio', href: 'https://www.evotechstudio.dev/portfolio/', target: '_blank' },
    { name: 'Contact', href: 'https://www.evotechstudio.dev/contact/', target: '_blank' },
  ],
  support: [
    { name: 'Help Center', href: '/help' },
    { name: 'Community', href: '/community' },
    { name: 'Status', href: '/status' },
    { name: 'Security', href: '/security' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'GDPR', href: '/gdpr' },
  ],
}

export function LandingFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-6">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <Image 
                src="/EvotechLogo.png" 
                alt="Evotech Logo" 
                width={32} 
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold">EvoLeads AI</span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-md">
              AI-powered lead generation platform that helps businesses find and convert 
              high-quality prospects with confidence scores and multi-tenant collaboration.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@evotechstudio.dev</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+92 370 0589908</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Karachi, Pakistan</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    target={link.target}
                    rel={link.target === '_blank' ? 'noopener noreferrer' : undefined}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              © 2024 Evo Lead AI. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <Link 
                href="/privacy" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy
              </Link>
              <Link 
                href="/terms" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Terms
              </Link>
              <Link 
                href="/cookies" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}