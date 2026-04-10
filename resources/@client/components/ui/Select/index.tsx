import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { label: string; value: string | number }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={cn(
              'flex h-10 w-full appearance-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-blue-800',
              error && 'border-red-500 focus:ring-red-400',
              className
            )}
            ref={ref}
            {...props}
          >
            <option value="" disabled>
              Select an option
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
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

Select.displayName = 'Select';

export default Select;
export { Select };
