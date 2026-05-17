import * as React from 'react';
import { cn } from '../../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[12.5px] font-medium tracking-[-0.005em]"
            style={{ color: 'var(--text-secondary)' }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              'flex h-10 w-full font-[-apple-system,BlinkMacSystemFont,Inter,system-ui]',
              'rounded-[10px] px-3 py-2 text-[13.5px]',
              'transition-all duration-[220ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
              'focus:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-40',
              'tracking-[-0.005em]',
              error
                ? 'border border-red-500/40 bg-[rgba(255,69,58,0.06)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-red-500/20 focus:border-red-500/60'
                : [
                    'bg-[var(--bg-input)] border border-[var(--border-strong)] text-[var(--text-primary)]',
                    'placeholder:text-[var(--text-tertiary)]',
                    'hover:border-[var(--border-focus)] hover:bg-[var(--bg-input-focus)]',
                    'focus:ring-2 focus:ring-[var(--accent)]/15 focus:border-[var(--border-focus)]',
                  ].join(' '),
              leftIcon  && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            ref={ref}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {rightIcon && (
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-[12px]" style={{ color: 'var(--danger)' }} role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
