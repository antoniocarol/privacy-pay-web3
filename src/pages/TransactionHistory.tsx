import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { TransactionList } from '../components/TransactionList';
import { useAccount } from 'wagmi';
import { useHistory } from '@/hooks/useHistory';

export function TransactionHistory() {
  const { isConnected } = useAccount();
  const { data: transactionsData, isLoading: isLoadingHistory } = useHistory();
  
  return (
    <div className="py-8 px-4 md:px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Histórico de Transações</h1>
      </div>
      
      {!isConnected ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="text-xl font-medium text-white mb-2">Conecte sua carteira</h2>
            <p className="text-white/60 mb-6">Conecte sua carteira para visualizar seu histórico de transações.</p>
            <appkit-button />
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <TransactionList
            transactions={transactionsData || []}
            isLoading={isLoadingHistory}
          />
        </Card>
      )}
      
      <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-4">Sobre o Histórico de Transações</h3>
        <p className="text-sm text-white/70 mb-4">
          O histórico de transações mostra suas operações privadas (shield, transfer, unshield) 
          realizadas através do protocolo eERC20 da Avalanche.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/5 p-3 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center mr-2">
                <span className="text-green-500 text-xs">✓</span>
              </div>
              <span className="text-white/80 font-medium">Transações Shield</span>
            </div>
            <p className="text-white/60 text-xs">
              Conversões de tokens públicos para o formato privado.
            </p>
          </div>
          <div className="bg-white/5 p-3 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center mr-2">
                <span className="text-blue-500 text-xs">↔</span>
              </div>
              <span className="text-white/80 font-medium">Transferências Privadas</span>
            </div>
            <p className="text-white/60 text-xs">
              Transferências anônimas entre carteiras.
            </p>
          </div>
          <div className="bg-white/5 p-3 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                <span className="text-primary text-xs">↑</span>
              </div>
              <span className="text-white/80 font-medium">Transações Unshield</span>
            </div>
            <p className="text-white/60 text-xs">
              Conversões de tokens privados de volta para o formato público.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionHistory; 