import React from 'react';
import { SupportedToken } from '@/config/tokens';

interface TokenIconProps {
  token: SupportedToken;
  size?: 'sm' | 'md' | 'lg';
}

// Mapeamento simples de símbolos para cores de fundo (pode ser expandido)
const tokenColorMap: Record<string, string> = {
  AVAX: 'bg-red-500',
  USDCe: 'bg-blue-500',
  WBTC: 'bg-yellow-500',
  // Adicione mais tokens conforme necessário
};

// Ícone SVG genérico para tokens não mapeados ou como fallback
const GenericTokenSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
  </svg>
);

export function TokenIcon({ token, size = 'md' }: TokenIconProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const bgColor = tokenColorMap[token.symbol.toUpperCase()] || 'bg-gray-400'; // Fallback para cinza

  // Por enquanto, vamos exibir a primeira letra do símbolo do token ou um ícone genérico.
  // TODO: Implementar SVGs específicos para cada token se disponível.

  return (
    <div
      className={`rounded-full flex items-center justify-center font-semibold text-white shadow-md ${sizeClasses[size]} ${bgColor} flex-shrink-0 leading-none`}
      title={token.symbol}
    >
      {/* Exemplo: Mostrar a primeira letra do token */}
      {/* Se tiver um SVG específico, poderia ser renderizado aqui em vez da letra */}
      {token.symbol ? token.symbol.charAt(0).toUpperCase() : <GenericTokenSvg />}
    </div>
  );
} 