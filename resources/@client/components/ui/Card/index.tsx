import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  footer?: React.ReactNode;
  headerAction?: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, subtitle, icon: Icon, footer, headerAction, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50',
          className
        )}
        {...props}
      >
        {(title || Icon || headerAction) && (
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {Icon && <Icon className="h-5 w-5 text-blue-600" />}
                {title && (
                  <h3 className="text-lg font-semibold leading-none tracking-tight">
                    {title}
                  </h3>
                )}
              </div>
              {headerAction && <div>{headerAction}</div>}
            </div>
            {subtitle && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className={cn('p-6 pt-0', !title && !Icon && 'pt-6')}>
          {children}
        </div>
        {footer && (
          <div className="flex items-center p-6 pt-0 text-sm italic text-slate-500 dark:text-slate-400">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
export { Card };
