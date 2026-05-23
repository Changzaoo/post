import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface DataPanelProps {
  title?: ReactNode;
  description?: ReactNode;
  tools?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function DataPanel({ title, description, tools, children, className, bodyClassName }: DataPanelProps) {
  return (
    <section className={cn('data-panel', className)}>
      {(title || description || tools) && (
        <div className="data-panel__header">
          <div>
            {title && <div className="data-panel__title">{title}</div>}
            {description && <div className="data-panel__description">{description}</div>}
          </div>
          {tools && <div className="data-panel__tools">{tools}</div>}
        </div>
      )}
      <div className={cn('data-panel__body', bodyClassName)}>{children}</div>
    </section>
  );
}
