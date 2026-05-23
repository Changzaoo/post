import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padded?: boolean;
}

export function GlassCard({ children, className, hover, padded = true, ...props }: GlassCardProps) {
  return (
    <div className={cn('glass-card', className)} data-hover={hover ? 'true' : undefined} {...props}>
      {padded ? <div className="glass-card__content">{children}</div> : children}
    </div>
  );
}
