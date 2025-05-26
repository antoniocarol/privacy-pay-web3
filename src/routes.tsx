import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';

// Usando lazy loading para componentes de página
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PrivacyDashboardComponent = lazy(() => import('./pages/PrivacyDashboard').then(module => ({ default: module.PrivacyDashboard })));
const AdminPage = lazy(() => import('./pages/Admin').then(module => ({ default: module.Admin })));
const TransactionHistoryPage = lazy(() => import('./pages/TransactionHistory'));

// Componente de carregamento
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-pulse flex flex-col items-center">
      <div className="w-16 h-16 rounded-full bg-gradient-btn flex items-center justify-center shadow-glow mb-4">
        <span className="text-white text-2xl font-bold animate-pulse">P</span>
      </div>
      <div className="text-white/70">Carregando...</div>
    </div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <PrivacyDashboardComponent />
          </Suspense>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'privacy',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PrivacyDashboardComponent />
          </Suspense>
        ),
      },
      {
        path: 'transactions',
        element: (
          <Suspense fallback={<PageLoader />}>
            <TransactionHistoryPage />
          </Suspense>
        ),
      },
      {
        path: 'admin',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdminPage />
          </Suspense>
        ),
      },
    ],
  },
]); 