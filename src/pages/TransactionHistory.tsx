import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { TransactionList } from '../components/TransactionList';
import { useAccount } from 'wagmi';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useEERC20 } from '../hooks/useEERC20';

// Tipo para transações
interface Transaction {
  id: string | number;
  type: string;
  date: string;
  value: number;
  status?: string;
  hash?: string;
  from?: string;
  to?: string;
}

export function TransactionHistory() {
  const { address, isConnected } = useAccount();
  const { availableSecrets } = useEERC20();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Armazenamento local para histórico de transações
  const [transactionHistory, setTransactionHistory] = useLocalStorage<Transaction[]>(
    'privacy-pay-transaction-history',
    []
  );
  
  // Carrega transações do armazenamento local e combina com os segredos
  useEffect(() => {
    if (!isConnected) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Converter segredos em transações
      const secretTransactions: Transaction[] = availableSecrets.map(secret => ({
        id: secret.id,
        type: 'Shield',
        date: new Date(secret.timestamp).toLocaleDateString('pt-BR'),
        value: parseFloat(secret.amount),
        status: secret.spent ? 'Gasto' : 'Disponível',
        hash: secret.commitment.substring(0, 10) + '...',
      }));
      
      // Combinar com histórico salvo
      const allTransactions = [...secretTransactions, ...transactionHistory]
        .sort((a, b) => {
          // Converter datas para timestamps para comparação
          const dateA = new Date(a.date.split('/').reverse().join('-')).getTime();
          const dateB = new Date(b.date.split('/').reverse().join('-')).getTime();
          return dateB - dateA; // Ordem decrescente (mais recente primeiro)
        });
      
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, availableSecrets, transactionHistory]);
  
  // Adicionar uma transação de demonstração
  const addDemoTransaction = () => {
    const demoTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: Math.random() > 0.5 ? 'Enviado' : 'Recebido',
      date: new Date().toLocaleDateString('pt-BR'),
      value: parseFloat((Math.random() * 100).toFixed(2)),
      status: 'Confirmada',
      hash: `0x${Math.random().toString(16).substring(2, 10)}`,
    };
    
    setTransactionHistory(prev => [demoTx, ...prev]);
  };
  
  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Histórico de Transações</h1>
        
        {isConnected && (
          <button 
            onClick={addDemoTransaction}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 hover:bg-white/10 transition-all"
          >
            + Adicionar Demo
          </button>
        )}
      </div>
      
      {!isConnected ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="text-xl font-medium text-white mb-2">Conecte sua carteira</h2>
            <p className="text-white/60 mb-6">Conecte sua carteira para visualizar seu histórico de transações</p>
            <appkit-button />
          </div>
        </Card>
      ) : (
        <Card>
          <TransactionList
            transactions={transactions}
            isLoading={isLoading}
            tokenSymbol="PAVX"
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