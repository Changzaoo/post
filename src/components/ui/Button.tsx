import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap font-medium',
    'transition-all duration-[220ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-transparent',
    'disabled:pointer-events-none disabled:opacity-40 cursor-pointer',
    'select-none active:scale-[0.97]',
    'tracking-[-0.005em]',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'bg-[var(--accent)] text-white shadow-[0_1px_4px_rgba(99,102,241,0.38),inset_0_0.5px_0_rgba(255,255,255,0.18)] hover:bg-[#4f46e5] hover:shadow-[0_2px_10px_rgba(99,102,241,0.48)] hover:-translate-y-px',
        primary:
          'bg-[var(--accent)] text-white shadow-[0_1px_4px_rgba(99,102,241,0.38),inset_0_0.5px_0_rgba(255,255,255,0.18)] hover:bg-[#4f46e5] hover:shadow-[0_2px_10px_rgba(99,102,241,0.48)] hover:-translate-y-px',
        secondary:
          'bg-white/7 text-[var(--text-primary)] border border-[var(--border-strong)]/80 hover:bg-white/11 hover:border-[var(--border-strong)]',
        outline:
          'bg-transparent text-[var(--text-secondary)] border border-[var(--border-strong)] hover:bg-white/6 hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]',
        ghost:
          'bg-transparent text-[var(--text-secondary)] hover:bg-white/6 hover:text-[var(--text-primary)]',
        danger:
          'bg-[rgba(255,69,58,0.10)] text-[#ff6b6b] border border-[rgba(255,69,58,0.22)] hover:bg-[rgba(255,69,58,0.18)]',
        destructive:
          'bg-[rgba(255,69,58,0.10)] text-[#ff6b6b] border border-[rgba(255,69,58,0.22)] hover:bg-[rgba(255,69,58,0.18)]',
        success:
          'bg-[rgba(52,211,153,0.12)] text-[var(--success)] border border-[rgba(52,211,153,0.25)] hover:bg-[rgba(52,211,153,0.18)]',
        gradient:
          'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-sm hover:from-violet-600 hover:to-indigo-600 hover:-translate-y-px',
        link:
          'text-[var(--accent)] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm:      'h-7 rounded-[8px] px-3 text-[12.5px] gap-1.5',
        default: 'h-9 rounded-[9px] px-4 py-2 text-[13.5px] gap-2',
        md:      'h-9 rounded-[9px] px-4 py-2 text-[13.5px] gap-2',
        lg:      'h-10 rounded-[10px] px-5 text-[14px] gap-2',
        xl:      'h-11 rounded-[11px] px-6 text-[14.5px] gap-2',
        icon:    'h-8 w-8 rounded-[9px]',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <svg
          className="h-3.5 w-3.5 animate-spin shrink-0 opacity-70"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
);
Button.displayName = 'Button';

export { Button, buttonVariants };
