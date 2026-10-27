import HeroSection from "@/components/landing/HeroSection"
import { ValueStrip } from "@/components/landing/ValueStrip"
import { AppsShowcase } from "@/components/landing/AppsShowcase"
import { CustomSoftwareSection } from "@/components/landing/CustomSoftwareSection"
import { TestimonialsCarousel } from "@/components/landing/TestimonialsCarousel"
import { NewsletterSection } from "@/components/landing/NewsletterSection"
import { SEO } from "@/components/seo"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SEO
        title="Home"
        description="Business software for Ghana: inventory, sales, printing and church management apps. Free trials, Mobile Money and instalments."
        keywords={['inventory software Ghana', 'POS', 'church management', 'printing business software', 'FMT Software']}
      />
      <HeroSection />

      {/* The hero's laptop overlaps into this section, hence the top padding. */}
      <section className="bg-background relative z-0 pt-40 pb-12 md:pt-56 lg:pt-72">
        <div className="container px-4 md:px-6">
          <ValueStrip />
        </div>
      </section>

      <AppsShowcase />
      <CustomSoftwareSection />
      <TestimonialsCarousel />
      <NewsletterSection />
    </div>
  )
}
