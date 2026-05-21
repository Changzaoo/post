import type { CreativeStatus } from '../../types/creative';

const statusTheme: Record<CreativeStatus, { color: string; bg: string; border: string }> = {
  Ideia: { color: '#7EB8FF', bg: 'rgba(59,110,255,0.12)', border: 'rgba(59,110,255,0.24)' },
  'Em produção': { color: '#A78BFA', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.24)' },
  'Em teste': { color: '#20F5D8', bg: 'rgba(32,245,216,0.10)', border: 'rgba(32,245,216,0.24)' },
  Vencedor: { color: '#10D97A', bg: 'rgba(16,217,122,0.12)', border: 'rgba(16,217,122,0.26)' },
  Perdedor: { color: '#FF6B7A', bg: 'rgba(255,71,87,0.10)', border: 'rgba(255,71,87,0.24)' },
  Pausado: { color: '#FFD84D', bg: 'rgba(255,216,77,0.10)', border: 'rgba(255,216,77,0.24)' },
  Arquivado: { color: 'var(--text-tertiary)', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.10)' },
};

export function CreativeStatusBadge({ status }: { status: CreativeStatus }) {
  const theme = statusTheme[status];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        borderRadius: 999,
        fontSize: 10.5,
        fontWeight: 700,
        color: theme.color,
        background: theme.bg,
        border: `0.5px solid ${theme.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  );
}
