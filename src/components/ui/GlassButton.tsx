import * as React from 'react';
import { cn } from '../../lib/utils';

type GlassButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type GlassButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GlassButtonVariant;
  size?: GlassButtonSize;
  loading?: boolean;
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = 'secondary', size = 'md', loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'glass-button',
        `glass-button--${variant}`,
        `glass-button--${size}`,
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading ? 'true' : undefined}
      {...props}
    >
      {loading && (
        <span
          className="animate-spin"
          aria-hidden="true"
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            opacity: 0.72,
          }}
        />
      )}
      {children}
    </button>
  )
);

GlassButton.displayName = 'GlassButton';
