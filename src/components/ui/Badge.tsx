import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-[0.01em] transition-colors',
  {
    variants: {
      variant: {
        default:     'bg-[rgba(99,102,241,0.12)] text-[var(--accent-light)]',
        secondary:   'bg-[rgba(255,255,255,0.07)] text-[var(--text-secondary)]',
        destructive: 'bg-[rgba(255,69,58,0.12)] text-[#ff6b6b]',
        outline:     'border border-[var(--border-strong)] text-[var(--text-secondary)]',
        success:     'bg-[rgba(48,209,88,0.12)] text-[#34d399]',
        warning:     'bg-[rgba(255,214,10,0.12)] text-[#fbbf24]',
        error:       'bg-[rgba(255,69,58,0.12)] text-[#ff6b6b]',
        info:        'bg-[rgba(10,132,255,0.12)] text-[#60a5fa]',
        pending:     'bg-[rgba(139,92,246,0.12)] text-[#c4b5fd]',
        muted:       'bg-[rgba(255,255,255,0.06)] text-[var(--text-tertiary)]',
        purple:      'bg-[rgba(139,92,246,0.12)] text-[#c4b5fd]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
