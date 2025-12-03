import { HeroSection } from '../components/landing/hero-section'
import { FeaturesSection } from '../components/landing/features-section'
import { PricingSection } from '../components/landing/pricing-section'
import { TestimonialsSection } from '../components/landing/testimonials-section'
import { FAQSection } from '../components/landing/faq-section'
import { ROICalculator } from '../components/landing/roi-calculator'
import { LandingHeader } from '../components/landing/landing-header'
import { LandingFooter } from '../components/landing/landing-footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
      </main>
      <LandingFooter />
      <ROICalculator />
    </div>
  )
}