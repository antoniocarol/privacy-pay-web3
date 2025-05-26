import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';

// Usando lazy loading para componentes de página
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminPage = lazy(() => import('./pages/Admin').then(module => ({ default: module.Admin })));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'admin',
        element: (
          <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
            <AdminPage />
          </Suspense>
        ),
      },
    ],
  },
]); 