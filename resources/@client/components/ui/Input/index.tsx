import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'underlined' | 'filled';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, icon: Icon, variant = 'default', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300",
            variant === 'underlined' && "text-slate-400 font-normal",
            variant === 'filled' && "text-[12px] text-slate-400 font-normal mb-1 block"
          )}>
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex w-full ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:ring-offset-slate-950 dark:placeholder:text-slate-400',
              variant === 'default' && 'h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:focus-visible:ring-blue-800',
              variant === 'underlined' && 'h-9 border-b border-slate-200 bg-transparent px-0 py-1 text-base focus-visible:border-blue-600 transition-all dark:border-slate-800 dark:focus-visible:border-blue-500 rounded-none shadow-none',
              variant === 'filled' && 'h-11 rounded-sm border-none bg-blue-50/50 px-3 py-2 text-sm focus-visible:ring-1 focus-visible:ring-blue-200 transition-all dark:bg-blue-900/20 dark:focus-visible:ring-blue-800',
              Icon && variant === 'default' && 'pl-10',
              error && variant === 'default' && 'border-red-500 focus-visible:ring-red-400',
              error && variant === 'underlined' && 'border-red-500 focus-visible:border-red-500',
              error && variant === 'filled' && 'bg-red-50 dark:bg-red-900/10 focus-visible:ring-red-200',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {helperText && !error && (
          <p className="text-[0.8rem] text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        )}
        {error && (
          <p className="text-[0.8rem] font-medium text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
export { Input };
