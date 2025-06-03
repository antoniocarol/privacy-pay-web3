import React from 'react'; // Importar React

export interface Transaction {
  id: number | string;
  type: string; // Usará chaves de tradução como 'history.type.deposit'
  date: string; // ISO string ou chave de tradução 'history.status.soon'
  value: number;
  status: string; // Usará chaves de tradução como 'history.status.confirmed'
  hash?: string;
  from?: string;
  to?: string;
  tokenSymbol?: string;
  decimals?: number;
  blockTimestamp?: number; // Unix timestamp em segundos
}

export const getTransactionIcon = (type: string): JSX.Element => {
  if (type === 'history.type.deposit' || type === 'history.type.received') {
    return React.createElement('svg', {
      xmlns: "http://www.w3.org/2000/svg",
      className: "h-5 w-5 text-green-500",
      viewBox: "0 0 20 20",
      fill: "currentColor"
    }, React.createElement('path', {
      fillRule: "evenodd",
      d: "M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z",
      clipRule: "evenodd"
    }));
  }
  // Para 'history.type.sent' e 'history.type.withdrawal'
  return React.createElement('svg', {
    xmlns: "http://www.w3.org/2000/svg",
    className: "h-5 w-5 text-red-500",
    viewBox: "0 0 20 20",
    fill: "currentColor"
  }, React.createElement('path', {
    fillRule: "evenodd",
    d: "M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z",
    clipRule: "evenodd"
  }));
};

export const getTransactionColor = (type: string): string => {
  if (type === 'history.type.deposit' || type === 'history.type.received') {
    return 'text-green-400';
  }
  return 'text-red-400'; // Para 'history.type.sent' e 'history.type.withdrawal'
}; 