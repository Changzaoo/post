import type { PostStatus } from '../types';

const POST_STATUS: Record<string, { label: string; tone: string }> = {
  draft:        { label: 'Rascunho',     tone: 'pending' },
  scheduled:    { label: 'Agendado',     tone: 'pending' },
  publishing:   { label: 'Publicando',   tone: 'warning' },
  published:    { label: 'Publicado',    tone: 'success' },
  failed:       { label: 'Falhou',       tone: 'danger' },
  under_review: { label: 'Em revisao',   tone: 'warning' },
  rejected:     { label: 'Rejeitado',    tone: 'danger' },
  expired:      { label: 'Expirado',     tone: 'pending' },
};

const PUBLISH_STATUS: Record<string, { label: string; tone: string }> = {
  published:       { label: 'Publicado',   tone: 'success' },
  error:           { label: 'Erro',        tone: 'danger' },
  mocked:          { label: 'Demo',        tone: 'warning' },
  pending:         { label: 'Pendente',    tone: 'pending' },
  pending_auth:    { label: 'Autenticacao', tone: 'warning' },
  needs_reconnect: { label: 'Reconectar',  tone: 'danger' },
};

interface StatusBadgeProps {
  status: PostStatus | string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = POST_STATUS[status] ?? { label: status, tone: 'pending' };
  return (
    <span
      className="status-chip"
      data-status={config.tone}
      style={{ minHeight: size === 'sm' ? 22 : undefined, fontSize: size === 'sm' ? 10 : undefined }}
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
  const config = PUBLISH_STATUS[status] ?? { label: status, tone: 'pending' };
  return (
    <span
      className="status-chip"
      data-status={config.tone}
      style={{ minHeight: size === 'sm' ? 22 : undefined, fontSize: size === 'sm' ? 10 : undefined }}
    >
      {config.label}
    </span>
  );
}
