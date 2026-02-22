import { Link } from "react-router-dom"
import { Separator } from "@repo/ui"

export function Footer() {
  return (
    <footer className="bg-background py-12 border-t">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">FMT Software</h3>
            <p className="text-sm text-muted-foreground">
              Providing all kinds of software or website solutions, for your business/organization needs.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/marketplace" className="hover:text-primary">Software Marketplace</Link></li>
              <li><Link to="/request-quote" className="hover:text-primary">Website Design</Link></li>
              <li><Link to="/request-quote" className="hover:text-primary">Maintenance</Link></li>
              <li><Link to="/request-quote" className="hover:text-primary">Custom Solutions</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary">Contact Us</Link></li>
              <li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary">Terms of Use</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Twitter</a></li>
              <li><a href="#" className="hover:text-primary">LinkedIn</a></li>
              <li><a href="#" className="hover:text-primary">GitHub</a></li>
              <li><a href="mailto:contact@fmtsoftware.com" className="hover:text-primary">contact@fmtsoftware.com</a></li>
            </ul>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} FMT Software Solutions. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
