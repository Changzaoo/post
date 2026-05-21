import {
  Archive,
  Copy,
  Eye,
  MoreHorizontal,
  Pause,
  Pencil,
  Sparkles,
  Trash2,
  Trophy,
} from 'lucide-react';
import { calculateCreativeScore } from '../../services/creativeAgentService';
import type { Creative, CreativeStatus } from '../../types/creative';
import { CreativeStatusBadge } from './CreativeStatusBadge';

interface CreativeCardProps {
  creative: Creative;
  onView: (creative: Creative) => void;
  onEdit: (creative: Creative) => void;
  onDuplicate: (creative: Creative) => void;
  onGenerateVariations: (creative: Creative) => void;
  onStatusChange: (creative: Creative, status: CreativeStatus) => void;
  onDelete: (creative: Creative) => void;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="creative-agent-metric-cell">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function CreativeCard({
  creative,
  onView,
  onEdit,
  onDuplicate,
  onGenerateVariations,
  onStatusChange,
  onDelete,
}: CreativeCardProps) {
  const score = calculateCreativeScore(creative.metrics);
  const scoreColor = score >= 75 ? '#10D97A' : score >= 50 ? '#FFD84D' : '#FF6B7A';

  return (
    <div className="glass-card creative-agent-card">
      <div className="creative-agent-card-top">
        <div style={{ minWidth: 0 }}>
          <div className="creative-agent-card-title">{creative.title}</div>
          <div className="creative-agent-card-meta">
            <span>{creative.platform}</span>
            <span>{creative.type}</span>
          </div>
        </div>
        <div className="creative-agent-score" style={{ borderColor: `${scoreColor}55`, color: scoreColor }}>
          {score}
        </div>
      </div>

      <div className="creative-agent-card-headline">{creative.headline}</div>

      <div className="creative-agent-card-tags">
        <CreativeStatusBadge status={creative.status} />
        <span className="creative-agent-soft-badge">{creative.emotion}</span>
        <span className="creative-agent-soft-badge">{new Date(creative.createdAt).toLocaleDateString('pt-BR')}</span>
      </div>

      <div className="creative-agent-metrics-grid">
        <Metric label="CTR" value={`${creative.metrics.ctr.toFixed(2)}%`} />
        <Metric label="CPC" value={`R$ ${creative.metrics.cpc.toFixed(2)}`} />
        <Metric label="Conv." value={String(creative.metrics.conversions)} />
        <Metric label="ROI" value={`${creative.metrics.roi.toFixed(2)}x`} />
        <Metric label="Ret." value={`${creative.metrics.retention.toFixed(0)}%`} />
      </div>

      <div className="creative-agent-card-actions">
        <button className="creative-agent-icon-button" type="button" onClick={() => onView(creative)} title="Ver detalhes">
          <Eye size={14} />
        </button>
        <button className="creative-agent-icon-button" type="button" onClick={() => onEdit(creative)} title="Editar">
          <Pencil size={14} />
        </button>
        <button className="creative-agent-icon-button" type="button" onClick={() => onDuplicate(creative)} title="Duplicar">
          <Copy size={14} />
        </button>
        <button className="creative-agent-icon-button" type="button" onClick={() => onGenerateVariations(creative)} title="Gerar variações">
          <Sparkles size={14} />
        </button>
        <button className="creative-agent-icon-button" type="button" onClick={() => onStatusChange(creative, 'Vencedor')} title="Marcar como vencedor">
          <Trophy size={14} />
        </button>
        <button className="creative-agent-icon-button" type="button" onClick={() => onStatusChange(creative, 'Pausado')} title="Pausar">
          <Pause size={14} />
        </button>
        <button className="creative-agent-icon-button" type="button" onClick={() => onStatusChange(creative, 'Arquivado')} title="Arquivar">
          <Archive size={14} />
        </button>
        <button className="creative-agent-icon-button danger" type="button" onClick={() => onDelete(creative)} title="Excluir">
          <Trash2 size={14} />
        </button>
        <MoreHorizontal size={14} style={{ color: 'var(--text-tertiary)', marginLeft: 'auto' }} />
      </div>
    </div>
  );
}
