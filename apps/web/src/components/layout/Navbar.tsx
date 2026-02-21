import { Link } from "react-router-dom"
import { Button } from "@repo/ui"
import { useTheme } from "@repo/ui"
import { Menu, Moon, Sun, X } from "lucide-react"
import { useState } from "react"

export function Navbar() {
  const { setTheme, theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/fmt-logo_.png" alt="FMT Software" className="h-10 w-auto" />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
            Home
          </Link>
          <Link to="/marketplace" className="text-sm font-medium transition-colors hover:text-primary">
            Marketplace
          </Link>
          <Link to="/request-quote" className="text-sm font-medium transition-colors hover:text-primary">
            Request Quote
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button asChild>
            <Link to="/marketplace">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="mr-2"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="container md:hidden pb-4">
          <div className="flex flex-col space-y-4 mt-4">
            <Link
              to="/"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/marketplace"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Marketplace
            </Link>
            <Link
              to="/request-quote"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Request Quote
            </Link>
            <Button asChild className="w-full">
              <Link to="/marketplace" onClick={() => setIsOpen(false)}>Get Started</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
}
