import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MarkPage } from '@/pages/MarkPage'
import { PinSetupPage } from '@/pages/PinSetupPage'
import { QrPage } from '@/pages/QrPage'
import { LandingPage, NotFoundPage } from '@/pages/LandingPage'

/**
 * Paths are short on purpose: they go into a 160-character SMS, where every
 * character costs, and someone may have to read one off a scuffed poster.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Daily attendance link, from the morning SMS. */}
        <Route path="/a/:token" element={<MarkPage />} />
        {/* PIN setup / reset, from an admin-issued link. */}
        <Route path="/p/:token" element={<PinSetupPage />} />
        {/* Printed QR poster at the workplace. */}
        <Route path="/qr/:code" element={<QrPage />} />
        {/* A bare /qr is a mis-scan, not a page. */}
        <Route path="/qr" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
