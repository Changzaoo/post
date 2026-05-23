import { cn } from '../lib/utils';

interface BrandLogoProps {
  size?: number;
  full?: boolean;
  className?: string;
  showText?: boolean;
}

export function BrandLogo({ size = 42, full = false, className, showText = false }: BrandLogoProps) {
  if (full) {
    return (
      <img
        className={cn('brand-logo brand-logo--full', className)}
        src="/postflow-logo.svg"
        alt="PostFlow"
      />
    );
  }

  return (
    <span className={cn('brand-logo-wrap', className)}>
      <img
        className="brand-logo brand-logo--mark"
        src="/postflow-logo-mark.svg"
        alt="PostFlow"
        style={{ width: size, height: size }}
      />
      {showText && (
        <span className="brand-logo-text">
          <strong>PostFlow</strong>
          <small>Creator OS</small>
        </span>
      )}
    </span>
  );
}
