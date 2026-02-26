import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Outlet } from "react-router-dom"
import { WhatsAppWidget } from "@/components/landing/WhatsAppWidget"
import { Toaster } from "sonner"
import { CookieConsent } from "@/components/layout/CookieConsent"

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <WhatsAppWidget />
      <CookieConsent />
      <Footer />
      <Toaster />
    </div>
  )
}
