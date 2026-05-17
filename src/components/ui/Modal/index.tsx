import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({ open, onClose, title, description, children, className, size = 'md' }: ModalProps) {
  // Lock body scroll
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'rgba(0,0,0,0.54)',
              backdropFilter: 'blur(12px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(12px) saturate(1.4)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className={cn(
              'relative z-10 w-full mx-auto',
              sizeClasses[size],
              'rounded-[18px]',
              'border border-[var(--border-strong)]',
              'shadow-[0_40px_100px_rgba(0,0,0,0.65),0_8px_32px_rgba(0,0,0,0.5)]',
              className
            )}
            style={{
              background: 'var(--bg-window)',
              backdropFilter: 'blur(40px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
            }}
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Header */}
            {(title || description) && (
              <div
                className="flex items-start justify-between px-6 py-5"
                style={{ borderBottom: '0.5px solid var(--border)' }}
              >
                <div>
                  {title && (
                    <h2
                      className="text-[15px] font-semibold tracking-[-0.015em]"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {description}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  aria-label="Fechar"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 28, height: 28,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.07)',
                    border: '0.5px solid var(--border)',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    transition: 'all 220ms cubic-bezier(0.25,0.46,0.45,0.94)',
                    flexShrink: 0, marginLeft: 12, marginTop: 1,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="px-6 py-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface ModalActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalActions({ children, className }: ModalActionsProps) {
  return (
    <div
      className={cn('flex items-center justify-end gap-2.5 mt-5 pt-4', className)}
      style={{ borderTop: '0.5px solid var(--border)' }}
    >
      {children}
    </div>
  );
}
