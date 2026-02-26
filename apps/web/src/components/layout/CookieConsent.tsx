import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@repo/ui"
import { Cookie, X } from "lucide-react"
import { Link } from "react-router-dom"

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already accepted cookies
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      // Show popup after a small delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "true")
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined") 
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, type: "spring", damping: 20 }}
          className="fixed bottom-4 left-4 right-4 md:left-8 md:bottom-8 z-50 md:max-w-xl"
        >
          <div className="bg-background/95 backdrop-blur-sm border border-border shadow-lg rounded-lg p-4 md:p-6 flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-full shrink-0">
                <Cookie className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-lg leading-none">We use cookies</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                  By clicking "Accept", you consent to our use of cookies. 
                  <Link to="/privacy" className="text-primary hover:underline ml-1">
                    Read our Privacy Policy
                  </Link>.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 -mt-1 -mr-1 h-8 w-8"
                onClick={handleDecline}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end mt-2">
              <Button variant="outline" onClick={handleDecline} className="sm:w-auto">
                Decline
              </Button>
              <Button onClick={handleAccept} className="sm:w-auto">
                Accept All Cookies
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
