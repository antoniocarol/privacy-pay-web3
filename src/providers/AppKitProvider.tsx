import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { avalancheFuji } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import React from 'react';

// Criando fora do componente para evitar recriação
const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

const metadata = {
  name: 'Secret Points',
  description: 'Secret Points DApp',
  url: window.location.origin,
  icons: ['https://secret-points.vercel.app/icon.png'],
};

const networks = [avalancheFuji] as any;

// Criando adaptador fora do ciclo de renderização
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false, // Mudando para false para melhorar performance
});

// Criação do AppKit fora do ciclo de renderização
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: false,
  },
});

// Criando queryClient fora do ciclo de renderização para evitar recriação
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minuto
      gcTime: 5 * 60 * 1000, // 5 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function AppKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
} 