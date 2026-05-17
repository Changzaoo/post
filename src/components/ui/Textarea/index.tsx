import * as React from 'react';
import { cn } from '../../../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, maxLength, showCount = true, value, ...props }, ref) => {
    const charCount = typeof value === 'string' ? value.length : 0;
    const nearLimit = maxLength ? charCount > maxLength * 0.85 : false;
    const overLimit = maxLength ? charCount > maxLength : false;

    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-slate-600 block">{label}</label>
        )}
        <textarea
          className={cn(
            'flex min-h-30 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm text-slate-800',
            'placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400',
            'disabled:cursor-not-allowed disabled:opacity-50 resize-y',
            'transition-all duration-150',
            error
              ? 'border-red-300 focus:ring-red-500/20'
              : 'border-black/10 hover:border-slate-300',
            className
          )}
          ref={ref}
          value={value}
          maxLength={maxLength}
          {...props}
        />
        <div className="flex items-center justify-between">
          <div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            {helperText && !error && <p className="text-xs text-slate-400">{helperText}</p>}
          </div>
          {maxLength && showCount && (
            <div className="flex items-center gap-2 ml-auto">
              <div className="w-16 h-1 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${Math.min((charCount / maxLength) * 100, 100)}%`,
                    backgroundColor: overLimit ? '#ef4444' : nearLimit ? '#f59e0b' : '#3b82f6',
                  }}
                />
              </div>
              <p className={`text-xs ${overLimit ? 'text-red-500' : nearLimit ? 'text-amber-500' : 'text-slate-400'}`}>
                {charCount}/{maxLength}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
