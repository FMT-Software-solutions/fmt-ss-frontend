import { Button } from "@repo/ui"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPolicyPage() {
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
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
            <div className="prose dark:prose-invert max-w-none space-y-8">
                <p className="text-muted-foreground">
                    Last updated: {new Date().toLocaleDateString()}
                </p>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
                    <p>
                        We collect information you provide directly to us, such as when you create an account, request a quote, contact us, or sign up for our newsletter. This information may include:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Name and contact information (email address, phone number)</li>
                        <li>Company details and job title</li>
                        <li>Project requirements and budget information</li>
                        <li>Payment information (processed securely by our payment providers)</li>
                        <li>Any other information you choose to provide</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
                    <p>We use the information we collect to:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Provide, maintain, and improve our services</li>
                        <li>Process transactions and send related information</li>
                        <li>Respond to your comments, questions, and requests</li>
                        <li>Communicate with you about products, services, offers, and events</li>
                        <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
                        <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
                    <p>
                        We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction. We use industry-standard encryption and security protocols to safeguard your data.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Your Choices</h2>
                    <p>
                        You may update, correct, or delete your account information at any time by logging into your online account or contacting us. You may also opt out of receiving promotional communications from us by following the instructions in those communications.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Cookie Policy</h2>
                    <p className="mb-4">
                        We use cookies and similar technologies to help us understand how people use our services and to improve them.
                    </p>

                    <h3 className="text-xl font-medium mb-2">Essential Cookies</h3>
                    <p className="mb-4">
                        These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in, or filling in forms.
                    </p>

                    <h3 className="text-xl font-medium mb-2">Analytics Cookies</h3>
                    <p className="mb-4">
                        These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.
                    </p>

                    <h3 className="text-xl font-medium mb-2">Preference Cookies</h3>
                    <p>
                        These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
                    <p>
                        We reserve the right to update or change this Privacy Policy at any time. Any changes will be effective immediately upon posting the revised policy on our website. We encourage you to review this Privacy Policy periodically for any updates.
                    </p>
                </section>

                <section className="bg-muted p-6 rounded-lg mt-8">
                    <p className="mb-4">
                        If you have any questions or concerns about our Privacy Policy, please contact us at:
                    </p>
                    <a
                        href="mailto:privacy@fmtsoftware.com"
                        className="text-primary hover:underline font-medium"
                    >
                        privacy@fmtsoftware.com
                    </a>
                </section>
            </div>
        </div>
    )
}
