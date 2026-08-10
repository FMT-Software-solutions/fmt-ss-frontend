import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Layout from "./components/layout/Layout"
import LandingPage from "./pages/LandingPage"
import MarketplacePage from "./pages/MarketplacePage"
import ItemDetailsPage from "./pages/ItemDetailsPage"
import CheckoutPage from "./pages/CheckoutPage"
import RequestQuotePage from "./pages/RequestQuotePage"
import AboutPage from "./pages/AboutPage"
import ReviewPage from "./pages/ReviewPage"
import UnsubscribePage from "./pages/UnsubscribePage"
import ContactPage from "./pages/ContactPage"
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage"
import TermsOfUsePage from "./pages/TermsOfUsePage"
import SuccessPage from "./pages/SuccessPage"
import PaymentCompletePage from "./pages/PaymentCompletePage"
import { ErrorBoundary } from "./components/ui/error-boundary"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "success",
        element: <SuccessPage />,
      },
      {
        // Shared Paystack landing page for in-app purchases from any FMT
        // product. Desktop apps run from file:// URLs Paystack cannot redirect
        // to, so they send customers here instead.
        path: "payment-complete",
        element: <PaymentCompletePage />,
      },
      {
        path: "marketplace",
        element: <MarketplacePage />,
      },
      {
        path: "marketplace/:slug",
        element: <ItemDetailsPage />,
      },
      {
        path: "checkout/:id",
        element: <CheckoutPage />,
      },
      {
        path: "request-quote",
        element: <RequestQuotePage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "reviews",
        element: <ReviewPage />,
      },
      {
        path: "newsletter/unsubscribe",
        element: <UnsubscribePage />,
      },
      {
        path: "contact",
        element: <ContactPage />,
      },
      {
        path: "privacy",
        element: <PrivacyPolicyPage />,
      },
      {
        path: "terms",
        element: <TermsOfUsePage />,
      },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
