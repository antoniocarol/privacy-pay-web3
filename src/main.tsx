import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'
import './i18n';
import { AppKitProvider } from './providers/AppKitProvider';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { ToastProvider } from './providers/ToastProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppKitProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AppKitProvider>
  </React.StrictMode>,
)