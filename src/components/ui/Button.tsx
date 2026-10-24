import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'destructive' | 'secondary' | 'ghost' | 'outline' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'sm', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:pointer-events-none select-none';

    const variants = {
      primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm border border-indigo-500/40 active:scale-[0.98]',
      destructive: 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.3)] border border-rose-500/40 active:scale-[0.98]',
      secondary: 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 active:scale-[0.98]',
      ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-100',
      outline: 'bg-transparent hover:bg-slate-900 text-slate-300 border border-slate-700 hover:border-slate-600',
      success: 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/40 active:scale-[0.98]',
    };

    const sizes = {
      xs: 'h-6 px-2 text-[11px] gap-1',
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-9 px-4 text-sm gap-2',
      lg: 'h-10 px-5 text-sm gap-2',
      icon: 'h-8 w-8 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-0.5 h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
