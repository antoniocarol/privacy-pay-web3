import React from 'react';

type StatusType = 'success' | 'warning' | 'danger' | 'info';

interface StatusBadgeProps {
  status: StatusType | string;
  label: string;
  className?: string;
}

export function StatusBadge({ status, label, className = '' }: StatusBadgeProps) {
  // Mapeia o status para as classes corretas
  const getStatusClasses = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'confirmada':
      case 'ativo':
        return 'bg-green-500/20 text-green-500';
      case 'warning':
      case 'pendente':
      case 'alerta':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'danger':
      case 'erro':
      case 'falha':
        return 'bg-red-500/20 text-red-400';
      case 'info':
      case 'privado':
        return 'bg-primary/20 text-primary';
      default:
        return 'bg-white/10 text-white/70';
    }
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${getStatusClasses(status)} ${className}`}>
      {label}
    </span>
  );
} 