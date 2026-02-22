import { Button } from "@repo/ui"
import { Link } from "react-router-dom"
import { ArrowRight, MessageSquare } from "lucide-react"
import { motion } from "framer-motion"

export default function AboutPage() {
  return (
    <div className="container py-12 max-w-4xl">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <div className="relative py-20 px-6 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-primary/5 -z-10" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6"
          >

            <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              About FMT Software Solutions
            </h1>

          </motion.div>
        </div>
      </motion.div>

      <div className="prose dark:prose-invert max-w-none mb-12">
        <p className="text-lg text-muted-foreground mb-6">
          We are a dedicated team of developers, designers, and digital strategists committed to empowering businesses through technology.
        </p>
        <p className="mb-4">
          Founded with a vision to make premium software accessible to all, FMT Software Solutions provides a curated marketplace of high-quality tools and offers bespoke development services for clients with unique needs.
        </p>
        <p>
          Whether you're a startup looking for your first website or an enterprise needing a complex ERP system, we have the expertise to deliver results that drive growth.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Ready to start your project?</h2>
          <p className="text-muted-foreground mb-6">
            Get a detailed quote for your custom software or website needs.
          </p>
          <Button asChild className="w-full">
            <Link to="/request-quote">
              Request a Quote <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Have questions?</h2>
          <p className="text-muted-foreground mb-6">
            Reach out to our team for support, partnerships, or general inquiries.
          </p>
          <Button variant="outline" asChild className="w-full">
            <Link to="/contact">
              Contact Us <MessageSquare className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
