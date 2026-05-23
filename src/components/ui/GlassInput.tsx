import * as React from 'react';
import { cn } from '../../lib/utils';

interface FieldFrameProps {
  label?: string;
  helperText?: string;
  error?: string;
  children: React.ReactNode;
  id?: string;
}

function FieldFrame({ label, helperText, error, children, id }: FieldFrameProps) {
  return (
    <div className="glass-field">
      {label && <label htmlFor={id}>{label}</label>}
      {children}
      {error && (
        <p role="alert" style={{ color: 'var(--danger)', fontSize: 12 }}>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
          {helperText}
        </p>
      )}
    </div>
  );
}

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, label, helperText, error, id, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <FieldFrame label={label} helperText={helperText} error={error} id={inputId}>
        <input
          ref={ref}
          id={inputId}
          className={cn('glass-input', className)}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        />
      </FieldFrame>
    );
  }
);

GlassInput.displayName = 'GlassInput';

export interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const GlassTextarea = React.forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  ({ className, label, helperText, error, id, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <FieldFrame label={label} helperText={helperText} error={error} id={inputId}>
        <textarea
          ref={ref}
          id={inputId}
          className={cn('glass-input', className)}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        />
      </FieldFrame>
    );
  }
);

GlassTextarea.displayName = 'GlassTextarea';

export interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const GlassSelect = React.forwardRef<HTMLSelectElement, GlassSelectProps>(
  ({ className, label, helperText, error, id, children, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <FieldFrame label={label} helperText={helperText} error={error} id={inputId}>
        <select
          ref={ref}
          id={inputId}
          className={cn('glass-input', className)}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        >
          {children}
        </select>
      </FieldFrame>
    );
  }
);

GlassSelect.displayName = 'GlassSelect';
