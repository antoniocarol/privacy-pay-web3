import React, { memo } from 'react';
import { StatusBadge } from './StatusBadge';
import { useIsMobile } from '../hooks/useMediaQuery';
import { FixedSizeList as List } from 'react-window';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { type Transaction, getTransactionIcon, getTransactionColor } from '@/components/TransactionListUtils';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  showExportOption?: boolean;
}

/**
 * Componente para exibir lista de transações
 */
export const TransactionList = memo(function TransactionList({
  transactions,
  isLoading = false,
  showExportOption = true
}: TransactionListProps) {
  const { t } = useTranslation();
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
        <p className="text-white/60 text-sm">{t("history.empty")}</p>
      </div>
    );
  }

  // Versão mobile com cards virtualizados
  if (isMobile) {
    const MobileRow = ({ index, style }: { index: number, style: React.CSSProperties }) => {
      const tx = transactions[index];
      const formattedDate = tx.blockTimestamp 
        ? format(new Date(tx.blockTimestamp * 1000), 'dd/MM/yyyy HH:mm') 
        : (tx.date === 'history.status.soon' ? t('history.status.soon') : tx.date);
      const explorerUrl = tx.hash ? `https://testnet.snowtrace.io/tx/${tx.hash}` : '#';
      return (
        <div 
          style={style}
          key={tx.id} 
          className="p-4 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors m-4"
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              {tx.type === 'Enviado' || tx.type === 'Transferência Interna' || tx.type === 'Saque Público' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              )}
              <span className="font-medium text-white">{t(tx.type)}</span>
            </div>
            
            <span className={`font-medium ${getTransactionColor(tx.type).includes('red') ? 'text-red-400' : 'text-green-400'}`}>
              {tx.value >= 0 ? '+' : ''}
              {tx.value !== 0 ? tx.value.toFixed(tx.decimals || 2) : '-'} 
              {tx.tokenSymbol ? ` ${tx.tokenSymbol}` : ''}
            </span>
          </div>
          
          <div className="flex justify-between text-xs mb-2">
            <span className="text-white/60">{t("history.mobile.dateLabel")}</span>
            <span className="text-white/80">{formattedDate}</span>
          </div>
          
          <div className="flex justify-between text-xs mb-3 items-center">
            <span className="text-white/60">{t("history.mobile.hashLabel")}</span>
            {tx.hash ? (
              <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-secondary font-mono truncate max-w-[150px] md:max-w-xs">
                {tx.hash}
              </a>
            ) : (
              <span className="text-white/80 font-mono">-</span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            {tx.status && <StatusBadge status={tx.status === 'history.status.confirmed' ? 'success' : 'pending'} label={t(tx.status)} />}
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
          <h3 className="text-lg font-semibold text-white">{t("history.title")}</h3>
          {showExportOption && (
            <div className="flex items-center space-x-2">
              <button className="text-xs text-white/70 py-1 px-3 rounded-lg hover:bg-white/5 transition-all">{t("history.exportButton")}</button>
              <StatusBadge status="info" label={t("history.privacyBadge")} />
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
    const formattedDate = tx.blockTimestamp 
      ? format(new Date(tx.blockTimestamp * 1000), 'dd/MM/yyyy HH:mm') 
      : (tx.date === 'history.status.soon' ? t('history.status.soon') : tx.date);
    const explorerUrl = tx.hash ? `https://testnet.snowtrace.io/tx/${tx.hash}` : '#';

    return (
      <div style={{ ...style, display: 'flex' }} key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors items-center">
        <div className="py-4 px-6 text-white font-medium" style={{ flexBasis: '25%', display: 'flex', alignItems: 'center' }}>
          {tx.type === 'Enviado' || tx.type === 'Transferência Interna' || tx.type === 'Saque Público' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          )}
          <span className="truncate">{t(tx.type)}</span>
        </div>
        <div className="py-4 px-6 text-white/70 text-sm" style={{ flexBasis: '20%' }}>{formattedDate}</div>
        <div className="py-4 px-6 text-right font-medium" style={{ flexBasis: '20%' }}>
          <span className={`${getTransactionColor(tx.type).includes('red') ? 'text-red-400' : 'text-green-400'}`}>
            {tx.value >= 0 ? '+' : ''}
            {tx.value !== 0 ? tx.value.toFixed(tx.decimals || 2) : '-'} 
            {tx.tokenSymbol ? ` ${tx.tokenSymbol}` : ''}
          </span>
        </div>
        <div className="py-4 px-6 text-center" style={{ flexBasis: '15%' }}>
          {tx.status && <StatusBadge status={tx.status === 'history.status.confirmed' ? 'success' : 'pending'} label={t(tx.status)} />}
        </div>
        <div className="py-4 px-6 text-right" style={{ flexBasis: '20%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          {tx.hash ? (
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="p-1 rounded hover:bg-white/10 transition-all text-primary hover:text-secondary font-mono truncate max-w-[100px] md:max-w-[120px]">
              {tx.hash.substring(0, 6)}...{tx.hash.substring(tx.hash.length - 4)}
            </a>
          ) : (
            <span className="text-xs text-white/60 font-mono">-</span>
          )}
          {tx.hash && (
            <button 
              onClick={() => navigator.clipboard.writeText(tx.hash || '')}
              className="p-1 rounded hover:bg-white/10 transition-all ml-1"
              title={t("history.copyTooltip") as string}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/40" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-hidden">
      <div className="px-6 py-5 flex items-center justify-between border-b border-white/10">
        <h3 className="text-xl font-semibold text-white">{t("history.title")}</h3>
        {showExportOption && (
          <div className="flex items-center space-x-2">
            <button className="text-xs text-white/70 py-1 px-3 rounded-lg hover:bg-white/5 transition-all">{t("history.exportButton")}</button>
            <StatusBadge status="info" label={t("history.privacyBadge")} />
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <div className="w-full">
          <div className="flex border-b border-white/10 bg-white/5 sticky top-0 z-10">
            <div className="text-left py-4 px-6 font-medium text-white/70" style={{ flexBasis: '25%' }}>{t("history.tableHeader.type")}</div>
            <div className="text-left py-4 px-6 font-medium text-white/70" style={{ flexBasis: '20%' }}>{t("history.tableHeader.date")}</div>
            <div className="text-right py-4 px-6 font-medium text-white/70" style={{ flexBasis: '20%' }}>{t("history.tableHeader.amount")}</div>
            <div className="text-center py-4 px-6 font-medium text-white/70" style={{ flexBasis: '15%' }}>{t("history.tableHeader.status")}</div>
            <div className="text-right py-4 px-6 font-medium text-white/70" style={{ flexBasis: '20%' }}>{t("history.tableHeader.hash")}</div>
          </div>
          
          <List
            height={350}
            width="100%"
            itemCount={transactions.length}
            itemSize={60}
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
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="overflow-hidden animate-shimmer relative">
        <div className="px-4 py-5 flex items-center justify-between border-b border-white/10">
          <div className="h-6 w-48 bg-white/10 rounded-md"></div>
          <div className="h-6 w-20 bg-white/10 rounded-md"></div>
        </div>
        <div className="p-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 rounded-lg border border-white/10 bg-white/5">
              <div className="flex justify-between items-center mb-3">
                <div className="h-5 w-24 bg-white/10 rounded-md"></div>
                <div className="h-5 w-16 bg-white/10 rounded-md"></div>
              </div>
              <div className="h-4 w-3/4 bg-white/10 rounded-md mb-2"></div>
              <div className="h-4 w-1/2 bg-white/10 rounded-md"></div>
            </div>
          ))}
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-shimmer-gradient bg-no-repeat bg-shimmer-position animate-shimmer-move"></div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden animate-shimmer relative">
      <div className="px-6 py-5 flex items-center justify-between border-b border-white/10">
        <div className="h-7 w-56 bg-white/10 rounded-md"></div>
        <div className="h-7 w-32 bg-white/10 rounded-md"></div>
      </div>
      <div className="overflow-x-auto">
        <div className="w-full">
          <div className="flex border-b border-white/10 bg-white/5 sticky top-0 z-10">
            {[25, 20, 20, 15, 20].map((basis, i) => (
              <div key={i} className="py-4 px-6" style={{ flexBasis: `${basis}%` }}>
                <div className="h-5 bg-white/10 rounded-md w-3/4"></div>
              </div>
            ))}
          </div>
          <div className="divide-y divide-white/5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center">
                {[25, 20, 20, 15, 20].map((basis, j) => (
                  <div key={j} className="py-4 px-6" style={{ flexBasis: `${basis}%` }}>
                    <div className="h-5 bg-white/10 rounded-md w-full"></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-full bg-shimmer-gradient bg-no-repeat bg-shimmer-position animate-shimmer-move"></div>
    </div>
  );
}); 