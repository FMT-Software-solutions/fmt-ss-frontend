import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { MessagesPage } from '@/pages/site/MessagesPage';
import { QuotesPage } from '@/pages/site/QuotesPage';
import { PurchasesPage } from '@/pages/site/PurchasesPage';
import { ReviewsPage } from '@/pages/site/ReviewsPage';
import { NewsletterPage } from '@/pages/site/NewsletterPage';
import { TrainingPage } from '@/pages/site/TrainingPage';
import { IssuesPage } from '@/pages/site/IssuesPage';
import { OrganizationsPage } from '@/pages/apps/OrganizationsPage';
import { OrganizationDetailPage } from '@/pages/apps/OrganizationDetailPage';
import { ProvisioningPage } from '@/pages/ProvisioningPage';
import { DefaultsPage } from '@/pages/defaults/DefaultsPage';
import { SmsDashboardPage } from '@/pages/SmsDashboardPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <DashboardPage /> },

          { path: '/site/messages', element: <MessagesPage /> },
          { path: '/site/quotes', element: <QuotesPage /> },
          { path: '/site/purchases', element: <PurchasesPage /> },
          { path: '/site/reviews', element: <ReviewsPage /> },
          { path: '/site/newsletter', element: <NewsletterPage /> },
          { path: '/site/training', element: <TrainingPage /> },
          { path: '/site/issues', element: <IssuesPage /> },

          { path: '/organizations', element: <OrganizationsPage /> },
          { path: '/organizations/:appId', element: <OrganizationsPage /> },
          { path: '/organizations/:appId/:orgId', element: <OrganizationDetailPage /> },
          { path: '/provisioning', element: <ProvisioningPage /> },
          { path: '/defaults', element: <DefaultsPage /> },
          { path: '/defaults/:appId', element: <DefaultsPage /> },

          { path: '/sms', element: <SmsDashboardPage /> },
          { path: '/analytics', element: <AnalyticsPage /> },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
