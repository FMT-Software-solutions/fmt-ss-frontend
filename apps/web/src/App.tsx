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

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "marketplace",
        element: <MarketplacePage />,
      },
      {
        path: "item/:id",
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
      // Add placeholders for other static pages
      {
        path: "contact",
        element: <div className="container py-20">Contact Page (Coming Soon)</div>,
      },
      {
        path: "privacy",
        element: <div className="container py-20">Privacy Policy (Coming Soon)</div>,
      },
      {
        path: "terms",
        element: <div className="container py-20">Terms of Use (Coming Soon)</div>,
      },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
