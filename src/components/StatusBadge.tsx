import type { PostStatus } from '../types';

const POST_STATUS_LIGHT: Record<string, { label: string; className: string }> = {
  draft:        { label: 'Draft',        className: 'bg-slate-100 text-slate-600' },
  scheduled:    { label: 'Scheduled',    className: 'bg-blue-100 text-blue-700' },
  publishing:   { label: 'Publishing',   className: 'bg-amber-100 text-amber-700' },
  published:    { label: 'Published',    className: 'bg-green-100 text-green-700' },
  failed:       { label: 'Failed',       className: 'bg-red-100 text-red-700' },
  under_review: { label: 'In Review',    className: 'bg-orange-100 text-orange-700' },
  rejected:     { label: 'Rejected',     className: 'bg-red-200 text-red-800' },
  expired:      { label: 'Expired',      className: 'bg-slate-100 text-slate-500' },
};

const PUBLISH_STATUS_LIGHT: Record<string, { label: string; className: string }> = {
  published:       { label: 'Published',    className: 'bg-green-100 text-green-700' },
  error:           { label: 'Error',        className: 'bg-red-100 text-red-700' },
  mocked:          { label: 'Simulated',    className: 'bg-purple-100 text-purple-700' },
  pending:         { label: 'Pending',      className: 'bg-amber-100 text-amber-700' },
  pending_auth:    { label: 'Needs Auth',   className: 'bg-orange-100 text-orange-700' },
  needs_reconnect: { label: 'Reconnect',    className: 'bg-red-100 text-red-700' },
};

interface StatusBadgeProps {
  status: PostStatus | string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = POST_STATUS_LIGHT[status] ?? { label: status, className: 'bg-slate-100 text-slate-500' };
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold whitespace-nowrap ${config.className}`}
      style={{ padding: size === 'sm' ? '2px 8px' : '3px 10px', fontSize: size === 'sm' ? '10px' : '11px' }}
    >
      {config.label}
    </span>
  );
}

interface PublishStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export function PublishStatusBadge({ status, size = 'md' }: PublishStatusBadgeProps) {
  const config = PUBLISH_STATUS_LIGHT[status] ?? { label: status, className: 'bg-slate-100 text-slate-500' };
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold whitespace-nowrap ${config.className}`}
      style={{ padding: size === 'sm' ? '2px 8px' : '3px 10px', fontSize: size === 'sm' ? '10px' : '11px' }}
    >
      {config.label}
    </span>
  );
}
