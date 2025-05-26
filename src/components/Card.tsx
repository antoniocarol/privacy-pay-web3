import React, { memo } from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'premium';
}

/**
 * Componente reutilizável de Card
 */
export const Card = memo(function Card({ children, className = '', variant = 'default' }: CardProps) {
  const baseClasses = 'backdrop-blur-sm rounded-xl shadow-soft p-6';
  
  const variantClasses = variant === 'premium' 
    ? 'bg-gradient-card-premium border border-avax-red/10'
    : 'bg-gradient-card border border-white/10';
    
  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </div>
  );
});

/**
 * Cabeçalho do Card com título e área para componentes adicionais
 */
export const CardHeader = memo(function CardHeader({ 
  title, 
  children,
  className = ''
}: { 
  title?: string | React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      {title && (
        typeof title === 'string' 
          ? <h3 className="text-lg font-medium text-white">{title}</h3>
          : title
      )}
      {children}
    </div>
  );
});

/**
 * Rodapé do Card
 */
export const CardFooter = memo(function CardFooter({
  children,
  className = '',
  divider = true
}: {
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
}) {
  return (
    <div className={`${divider ? 'border-t border-white/10 pt-4 mt-4' : 'mt-auto pt-4'} ${className}`}>
      {children}
    </div>
  );
}); 