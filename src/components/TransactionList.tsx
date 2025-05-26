import React, { memo } from 'react';
import { StatusBadge } from './StatusBadge';
import { useIsMobile } from '../hooks/useMediaQuery';
import { FixedSizeList as List } from 'react-window';

export interface Transaction {
  id: number | string;
  type: string;
  date: string;
  value: number;
  status?: string;
  hash?: string;
  from?: string;
  to?: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  tokenSymbol?: string;
  isLoading?: boolean;
  showExportOption?: boolean;
}

/**
 * Componente para exibir lista de transações
 */
export const TransactionList = memo(function TransactionList({
  transactions,
  tokenSymbol = 'PAVX',
  isLoading = false,
  showExportOption = true
}: TransactionListProps) {
  const isMobile = useIsMobile();

  if (isLoading) {
    return <TransactionListSkeleton />;
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="mb-4 text-white/40">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-white/60 text-sm">Nenhuma transação encontrada</p>
      </div>
    );
  }

  // Versão mobile com cards virtualizados
  if (isMobile) {
    const MobileRow = ({ index, style }: { index: number, style: React.CSSProperties }) => {
      const tx = transactions[index];
      return (
        <div 
          style={style}
          key={tx.id} 
          className="p-4 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors m-4"
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              {tx.type === 'Enviado' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              )}
              <span className="font-medium text-white">{tx.type}</span>
            </div>
            
            <span className={`font-medium ${tx.type === 'Enviado' ? 'text-red-400' : 'text-green-400'}`}>
              {tx.type === 'Enviado' ? '-' : '+'}{tx.value} {tokenSymbol}
            </span>
          </div>
          
          <div className="flex justify-between text-xs mb-2">
            <span className="text-white/60">Data:</span>
            <span className="text-white/80">{tx.date}</span>
          </div>
          
          <div className="flex justify-between text-xs mb-3">
            <span className="text-white/60">Hash:</span>
            <span className="text-white/80 font-mono">{tx.hash}</span>
          </div>
          
          <div className="flex items-center justify-between">
            {tx.status && <StatusBadge status={tx.status} label={tx.status} />}
            <button className="p-1 rounded hover:bg-white/10 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/40" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
      );
    };

    return (
      <div className="overflow-hidden">
        <div className="px-4 py-5 flex items-center justify-between border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Histórico de transações</h3>
          {showExportOption && (
            <div className="flex items-center space-x-2">
              <button className="text-xs text-white/70 py-1 px-3 rounded-lg hover:bg-white/5 transition-all">Exportar</button>
              <StatusBadge status="info" label="Privado" />
            </div>
          )}
        </div>
        
        <div className="px-4 py-2">
          <List
            height={500}
            width="100%"
            itemCount={transactions.length}
            itemSize={180}
          >
            {MobileRow}
          </List>
        </div>
      </div>
    );
  }

  // Versão desktop com tabela virtualizada
  const TableRow = ({ index, style }: { index: number, style: React.CSSProperties }) => {
    const tx = transactions[index];
    return (
      <tr style={style} key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
        <td className="py-4 px-6 text-white font-medium">
          <div className="flex items-center">
            {tx.type === 'Enviado' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            )}
            {tx.type}
          </div>
        </td>
        <td className="py-4 px-6 text-white/70 text-sm">{tx.date}</td>
        <td className="py-4 px-6 text-right font-medium">
          <span className={`${tx.type === 'Enviado' ? 'text-red-400' : 'text-green-400'}`}>
            {tx.type === 'Enviado' ? '-' : '+'}{tx.value} {tokenSymbol}
          </span>
        </td>
        <td className="py-4 px-6 text-center">
          {tx.status && <StatusBadge status={tx.status} label={tx.status} />}
        </td>
        <td className="py-4 px-6 text-right">
          <div className="flex items-center justify-end space-x-2">
            <span className="text-xs text-white/60 font-mono">{tx.hash}</span>
            <button className="p-1 rounded hover:bg-white/10 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/40" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="overflow-hidden">
      <div className="px-6 py-5 flex items-center justify-between border-b border-white/10">
        <h3 className="text-xl font-semibold text-white">Histórico de transações</h3>
        {showExportOption && (
          <div className="flex items-center space-x-2">
            <button className="text-xs text-white/70 py-1 px-3 rounded-lg hover:bg-white/5 transition-all">Exportar</button>
            <StatusBadge status="info" label="Privado" />
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-4 px-6 font-medium text-white/70">Tipo</th>
              <th className="text-left py-4 px-6 font-medium text-white/70">Data</th>
              <th className="text-right py-4 px-6 font-medium text-white/70">Valor</th>
              <th className="text-center py-4 px-6 font-medium text-white/70">Status</th>
              <th className="text-right py-4 px-6 font-medium text-white/70">Hash</th>
            </tr>
          </thead>
        </table>
        
        <div style={{ height: '400px', overflow: 'auto' }}>
          <List
            height={400}
            width="100%"
            itemCount={transactions.length}
            itemSize={70}
          >
            {TableRow}
          </List>
        </div>
      </div>
    </div>
  );
});

// Memoizando o componente de skeleton também
const TransactionListSkeleton = memo(function TransactionListSkeleton() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="overflow-hidden">
        <div className="px-4 py-5 flex items-center justify-between border-b border-white/10">
          <div className="h-6 w-48 bg-white/5 rounded-md"></div>
          <div className="h-6 w-20 bg-white/5 rounded-md"></div>
        </div>
        
        <div className="px-4 py-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 rounded-lg border border-white/5 bg-white/5 animate-pulse">
              <div className="flex justify-between items-center mb-3">
                <div className="h-5 w-24 bg-white/10 rounded-md"></div>
                <div className="h-5 w-20 bg-white/10 rounded-md"></div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-white/10 rounded-md"></div>
                  <div className="h-4 w-24 bg-white/10 rounded-md"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-white/10 rounded-md"></div>
                  <div className="h-4 w-20 bg-white/10 rounded-md"></div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div className="h-5 w-20 bg-white/10 rounded-full"></div>
                  <div className="h-5 w-5 bg-white/10 rounded-md"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="px-6 py-5 flex items-center justify-between border-b border-white/10">
        <div className="h-7 w-48 bg-white/5 rounded-md"></div>
        <div className="flex items-center space-x-2">
          <div className="h-6 w-16 bg-white/5 rounded-md"></div>
          <div className="h-6 w-20 bg-white/5 rounded-md"></div>
        </div>
      </div>
      
      <div className="p-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-32 bg-white/5 rounded-md"></div>
            </div>
            <div className="h-6 w-24 bg-white/5 rounded-md"></div>
            <div className="h-6 w-20 bg-white/5 rounded-md"></div>
            <div className="h-6 w-20 bg-white/5 rounded-md"></div>
            <div className="h-6 w-28 bg-white/5 rounded-md"></div>
          </div>
        ))}
      </div>
    </div>
  );
}); 