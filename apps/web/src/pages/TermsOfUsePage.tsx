import { Button } from "@repo/ui"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

export default function TermsOfUsePage() {
  return (
    <div className="container py-12 max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" asChild className="pl-0 hover:bg-transparent">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>
      </div>
      <h1 className="text-4xl font-bold mb-8">Terms of Use</h1>
      <div className="prose dark:prose-invert max-w-none space-y-8">
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using the website and services of FMT Software Solutions ("we," "us," or "our"), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Services Description</h2>
          <p>
            FMT Software Solutions provides software development services, including but not limited to custom software development, website design, and a marketplace for software products. We reserve the right to modify, suspend, or discontinue any aspect of our services at any time.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. User Obligations</h2>
          <p>You agree to use our services only for lawful purposes and in accordance with these Terms. You agree not to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Use our services in any way that violates any applicable local, national, or international law</li>
            <li>Attempt to gain unauthorized access to any portion of our services or systems</li>
            <li>Interfere with or disrupt the integrity or performance of our services</li>
            <li>Upload or transmit any malicious code, viruses, or harmful content</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
          <p>
            All content, features, and functionality of our website and services, including but not limited to code, designs, text, graphics, and logos, are the exclusive property of FMT Software Solutions and are protected by copyright, trademark, and other intellectual property laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Payment Terms</h2>
          <p>
            For paid services and marketplace purchases, you agree to provide accurate and complete payment information. All fees are stated in the applicable currency (GHS or USD) and are non-refundable unless otherwise stated in our refund policy or service agreement.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
          <p>
            In no event shall FMT Software Solutions be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of Ghana, without regard to its conflict of law provisions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
          <p>
            We reserve the right to replace or modify these Terms at any time. We will provide notice of any significant changes by posting the new Terms on this page. Your continued use of the service after any such changes constitutes your acceptance of the new Terms.
          </p>
        </section>

        <section className="bg-muted p-6 rounded-lg mt-8">
          <p className="mb-4">
            If you have any questions about these Terms, please contact us at:
          </p>
          <a
            href="mailto:legal@fmtsoftware.com"
            className="text-primary hover:underline font-medium"
          >
            legal@fmtsoftware.com
          </a>
        </section>
      </div>
    </div>
  )
}
