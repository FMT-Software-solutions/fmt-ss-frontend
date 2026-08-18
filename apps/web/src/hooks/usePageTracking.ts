import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { trackPageView } from "@/lib/analytics"

/**
 * Records a page view on every route change. React 18's StrictMode runs
 * effects twice in development, so the last recorded path is remembered to
 * avoid double-counting.
 */
export function usePageTracking() {
  const { pathname } = useLocation()
  const lastPath = useRef<string | null>(null)

  useEffect(() => {
    if (lastPath.current === pathname) return
    lastPath.current = pathname
    trackPageView(pathname)
  }, [pathname])
}
