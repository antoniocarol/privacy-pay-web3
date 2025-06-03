import React, { memo, Children, isValidElement } from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'premium';
}

/**
 * Componente reutilizável de Card
 */
export const Card = memo(function Card({ children, className = '', variant = 'default' }: CardProps) {
  const baseClasses = 'backdrop-blur-sm rounded-xl shadow-soft p-6 flex flex-col h-full';
  
  const variantClasses = variant === 'premium' 
    ? 'bg-gradient-card-premium border border-avax-red/10'
    : 'bg-gradient-card border border-white/10';
    
  // Separar Header, Footer e Body
  let header: React.ReactNode = null;
  let footer: React.ReactNode = null;
  const bodyChildren: React.ReactNode[] = [];

  Children.forEach(children, child => {
    if (isValidElement(child)) {
      // Tentativa de identificar por tipo de componente. Isso é um pouco frágil.
      // Uma abordagem mais robusta seria esperar que CardHeader/CardFooter fossem passados via props específicas
      // ou usar context, ou que CardBody fosse um componente explícito.
      if (child.type === CardHeader) {
        header = child;
      } else if (child.type === CardFooter) {
        footer = child;
      } else {
        bodyChildren.push(child);
      }
    } else {
      bodyChildren.push(child); // Adiciona texto ou outros nós não-elementos ao body
    }
  });
    
  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`}>
      {header}
      <div className="flex-grow">
        {bodyChildren}
      </div>
      {footer}
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
    <div className={`${divider ? 'border-t border-white/10 pt-4' : 'pt-4'} mt-auto ${className}`}>
      {children}
    </div>
  );
}); 