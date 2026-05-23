import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface MetricCardProps {
  icon?: ReactNode;
  label: ReactNode;
  value: ReactNode;
  trend?: ReactNode;
  state?: 'positive' | 'negative' | 'neutral';
  accent?: string;
  className?: string;
  hover?: boolean;
}

export function MetricCard({
  icon,
  label,
  value,
  trend,
  state = 'neutral',
  accent = 'var(--accent)',
  className,
  hover = true,
}: MetricCardProps) {
  const iconBackground = typeof accent === 'string' && accent.startsWith('#') ? `${accent}1f` : 'var(--accent-soft)';

  return (
    <div className={cn('metric-card', className)} data-hover={hover ? 'true' : undefined}>
      {icon && (
        <div className="metric-card__icon" style={{ color: accent, background: iconBackground }}>
          {icon}
        </div>
      )}
      <div style={{ minWidth: 0 }}>
        <div className="metric-card__label">{label}</div>
        <div className="metric-card__value" style={{ color: accent }}>
          {value}
        </div>
        {trend && (
          <div className="metric-card__trend" data-state={state}>
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}
