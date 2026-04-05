'use client';

import { type InputHTMLAttributes, forwardRef } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  id: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    return (
      <div className="flex w-full flex-col gap-2">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-semibold text-gray-700 select-none"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={[
            'h-14 w-full rounded-2xl border-2 px-5 py-2 text-base outline-none transition-all duration-200',
            'bg-[#fdfcfd] border-black/5 text-gray-900',
            'placeholder:text-gray-400',
            'focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5',
            error ? 'border-red-500/50 focus:border-red-500/50' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {error && <span className="text-xs font-medium text-red-500">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
