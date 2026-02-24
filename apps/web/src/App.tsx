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
