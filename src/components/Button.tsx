import React from 'react';
import { useTranslation } from 'react-i18next';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

const buttonVariants = cva(
  'font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-0',
  {
    variants: {
      variant: {
    primary: 'bg-gradient-btn text-white shadow-glow hover:shadow-lg hover:scale-[1.02]',
    secondary: 'bg-white/5 border border-white/10 text-white hover:bg-white/10',
    outline: 'bg-transparent border border-primary text-primary hover:bg-primary/5',
    ghost: 'bg-transparent text-white/80 hover:text-white hover:bg-white/5',
      },
      size: {
    sm: 'text-xs py-2 px-3',
    md: 'text-sm py-2.5 px-4',
    lg: 'text-base py-3 px-6',
      },
      isLoading: {
        true: 'opacity-70 cursor-not-allowed hover:scale-100 hover:shadow-none',
        false: '',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      isLoading: false,
      fullWidth: false,
    },
  }
);

/**
 * Componente de Button reutilizável
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((
  { 
    className,
    variant,
    size,
    isLoading,
    fullWidth,
    children,
    leftIcon,
    rightIcon,
    ...otherHTMLProps
  }, 
  ref
) => {
  const { t } = useTranslation();
  const finalDisabled = otherHTMLProps.disabled || isLoading;

  const motionProps: Omit<HTMLMotionProps<"button">, "ref"> = {
    whileHover: { scale: finalDisabled ? 1 : 1.03, transition: { duration: 0.2 } },
    whileTap: { scale: finalDisabled ? 1 : 0.98, transition: { duration: 0.1 } },
    className: buttonVariants({ variant, size, className, isLoading, fullWidth }),
    disabled: finalDisabled,
    type: otherHTMLProps.type,
    onClick: otherHTMLProps.onClick,
    title: otherHTMLProps.title,
    form: otherHTMLProps.form,
    name: otherHTMLProps.name,
    value: otherHTMLProps.value,
  };

  return (
    <motion.button
      ref={ref}
      {...motionProps}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {t("Processando...")}
        </div>
      ) : (
        <div className="flex items-center justify-center">
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </div>
      )}
    </motion.button>
  );
});

export default Button; 