import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <section className={cn('empty-state', className)}>
      <div className="empty-state__inner">
        <div className="empty-state__icon">{icon ?? <Sparkles size={28} />}</div>
        <div className="empty-state__title">{title}</div>
        {description && <div className="empty-state__description">{description}</div>}
        {action}
      </div>
    </section>
  );
}
