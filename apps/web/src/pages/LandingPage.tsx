import HeroSection from "@/components/landing/HeroSection"
import { FeaturedApps } from "@/components/landing/FeaturedApps"
import { WebAppsSection } from "@/components/landing/WebAppsSection"
import { DesktopAppsSection } from "@/components/landing/DesktopAppsSection"
import { MobileAppsSection } from "@/components/landing/MobileAppsSection"
import { TestimonialsCarousel } from "@/components/landing/TestimonialsCarousel"
import { NewsletterSection } from "@/components/landing/NewsletterSection"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Trusted By / Placeholder for White Region */}
      <section className="py-20 lg:py-32 bg-background relative z-0">
        <div className="container px-4 md:px-6 pt-32 lg:pt-48">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Trusted by Business and Organizations</h2>
            <p className="text-muted-foreground">We provide custom software solutions that help businesses and organizations achieve their goals.</p>
          </div>
        </div>
      </section>

      {/* Featured Apps Section */}
      <FeaturedApps />

      <WebAppsSection />
      <DesktopAppsSection />
      <MobileAppsSection />
      
      <TestimonialsCarousel />
      <NewsletterSection />

    </div>
  )
}
