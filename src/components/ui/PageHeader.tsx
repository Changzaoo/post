import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, eyebrow, actions, breadcrumb, className }: PageHeaderProps) {
  return (
    <header className={cn('page-header', className)}>
      <div>
        {breadcrumb && <div className="page-header__eyebrow">{breadcrumb}</div>}
        {eyebrow && !breadcrumb && <div className="page-header__eyebrow">{eyebrow}</div>}
        <h1 className="page-header__title">{title}</h1>
        {description && <p className="page-header__description">{description}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}
