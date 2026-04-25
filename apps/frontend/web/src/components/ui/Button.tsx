'use client';

import { type ButtonHTMLAttributes, forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'cta' | 'outline' | 'ghost' | 'white';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:opacity-90 active:scale-95 shadow-lg shadow-primary/20',
  cta: 'bg-cta text-white hover:opacity-90 active:scale-95 shadow-lg shadow-cta/20',
  outline: 'border border-primary/20 bg-transparent text-primary hover:bg-primary/5 active:scale-95',
  ghost: 'bg-transparent text-primary hover:bg-primary/5 active:scale-95',
  white: 'bg-white text-primary hover:bg-white/90 active:scale-95 shadow-xl shadow-black/5',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-5 py-2 text-sm',
  md: 'px-7 py-3 text-base',
  lg: 'px-10 py-4 text-lg',
  xl: 'px-12 py-5 text-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={[
          'cursor-pointer font-medium transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
