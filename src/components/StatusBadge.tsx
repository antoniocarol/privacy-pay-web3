import React from 'react';

export interface StatusBadgeProps {
  status: 'pending' | 'completed' | 'failed' | 'success' | 'privado';
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const statusConfig = {
    pending: {
      className: 'bg-yellow-100 text-yellow-800',
      label: 'Pendente'
    },
    completed: {
      className: 'bg-green-100 text-green-800',
      label: 'Confirmada'
    },
    failed: {
      className: 'bg-red-100 text-red-800',
      label: 'Falhou'
    },
    success: {
      className: 'bg-green-100 text-green-800',
      label: 'Ativo'
    },
    privado: {
      className: 'bg-primary/20 text-primary',
      label: 'Privado'
    }
  };

  const config = statusConfig[status];

  return (
    <span className={`text-sm px-2 py-1 rounded-full ${config.className}`}>
      {label || config.label}
    </span>
  );
} 