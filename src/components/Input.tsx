import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  fullWidth?: boolean;
  className?: string;
  containerClassName?: string;
}

/**
 * Componente Input reutilizável
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    helperText, 
    leftIcon, 
    rightIcon, 
    error, 
    fullWidth = true, 
    className = '', 
    containerClassName = '',
    ...props 
  }, ref) => {
    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
        {label && (
          <label className="block text-white/80 mb-2 text-sm font-medium">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            className={`
              w-full rounded-lg border border-white/10 
              ${leftIcon ? 'pl-10' : 'px-4'} 
              ${rightIcon ? 'pr-10' : 'pr-4'} 
              py-3 bg-white/5 text-white 
              focus:ring-2 focus:ring-primary/50 focus:border-primary 
              transition-all placeholder-white/30
              ${error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : ''}
              ${className}
            `}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        
        {helperText && !error && (
          <p className="mt-1 text-xs text-white/50">{helperText}</p>
        )}
        
        {error && (
          <p className="mt-1 text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input'; 