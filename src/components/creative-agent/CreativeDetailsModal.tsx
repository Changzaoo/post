import { useState } from 'react';
import { Save } from 'lucide-react';
import { Modal, ModalActions } from '../ui/Modal';
import { statusOptions } from '../../services/creativeAgentService';
import type { Creative, CreativeMetrics, CreativeStatus } from '../../types/creative';
import { CreativeStatusBadge } from './CreativeStatusBadge';

interface CreativeDetailsModalProps {
  creative: Creative | null;
  mode: 'view' | 'edit';
  onClose: () => void;
  onSave: (creative: Creative) => void;
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="creative-agent-detail-block">
      <span>{label}</span>
      <p>{value || 'Não preenchido'}</p>
    </div>
  );
}

function EditableText({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <div className="creative-agent-field">
      <label className="creative-agent-label">{label}</label>
      {multiline ? (
        <textarea className="input creative-agent-input creative-agent-textarea" value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input className="input creative-agent-input" value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </div>
  );
}

function MetricInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="creative-agent-field">
      <label className="creative-agent-label">{label}</label>
      <input
        className="input creative-agent-input"
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

export function CreativeDetailsModal({ creative, mode, onClose, onSave }: CreativeDetailsModalProps) {
  const [draftState, setDraftState] = useState<{ id: string; value: Creative } | null>(null);

  if (!creative) return null;

  const draft = draftState?.id === creative.id ? draftState.value : creative;
  const editable = mode === 'edit';
  const handleClose = () => {
    setDraftState(null);
    onClose();
  };
  const set = (updates: Partial<Creative>) => setDraftState({ id: creative.id, value: { ...draft, ...updates } });
  const setMetric = (key: keyof CreativeMetrics, value: number) => {
    setDraftState({
      id: creative.id,
      value: { ...draft, metrics: { ...draft.metrics, [key]: Number.isFinite(value) ? value : 0 } },
    });
  };

  return (
    <Modal
      open={Boolean(creative)}
      onClose={handleClose}
      title={editable ? 'Editar criativo' : creative.title}
      description={creative.campaignName}
      size="lg"
      className="creative-agent-modal"
    >
      {editable ? (
        <div className="creative-agent-modal-grid">
          <EditableText label="Nome do criativo" value={draft.title} onChange={(title) => set({ title })} />
          <div className="creative-agent-field">
            <label className="creative-agent-label">Status</label>
            <select className="input creative-agent-input" value={draft.status} onChange={(event) => set({ status: event.target.value as CreativeStatus })}>
              {statusOptions.map((status) => (
                <option key={status} value={status} style={{ background: '#020818' }}>{status}</option>
              ))}
            </select>
          </div>
          <EditableText label="Headline" value={draft.headline} onChange={(headline) => set({ headline })} />
          <EditableText label="CTA" value={draft.cta} onChange={(cta) => set({ cta })} />
          <EditableText label="Copy" value={draft.copy} onChange={(copy) => set({ copy, mainText: copy })} multiline />
          <EditableText label="Roteiro" value={draft.script} onChange={(script) => set({ script })} multiline />
          <EditableText label="Prompt visual" value={draft.visualPrompt} onChange={(visualPrompt) => set({ visualPrompt })} multiline />
          <EditableText label="Sugestão de imagem" value={draft.suggestedVisual} onChange={(suggestedVisual) => set({ suggestedVisual })} multiline />

          <div className="creative-agent-metrics-editor">
            <MetricInput label="Impressões" value={draft.metrics.impressions} onChange={(value) => setMetric('impressions', value)} />
            <MetricInput label="Cliques" value={draft.metrics.clicks} onChange={(value) => setMetric('clicks', value)} />
            <MetricInput label="CTR (%)" value={draft.metrics.ctr} onChange={(value) => setMetric('ctr', value)} />
            <MetricInput label="CPC" value={draft.metrics.cpc} onChange={(value) => setMetric('cpc', value)} />
            <MetricInput label="Conversões" value={draft.metrics.conversions} onChange={(value) => setMetric('conversions', value)} />
            <MetricInput label="CPA" value={draft.metrics.cpa} onChange={(value) => setMetric('cpa', value)} />
            <MetricInput label="ROI" value={draft.metrics.roi} onChange={(value) => setMetric('roi', value)} />
            <MetricInput label="Retenção (%)" value={draft.metrics.retention} onChange={(value) => setMetric('retention', value)} />
          </div>
        </div>
      ) : (
        <div className="creative-agent-details">
          <div className="creative-agent-details-top">
            <CreativeStatusBadge status={creative.status} />
            <span>{creative.platform}</span>
            <span>{creative.objective}</span>
          </div>

          <div className="creative-agent-detail-grid">
            <DetailBlock label="Headline" value={creative.headline} />
            <DetailBlock label="CTA" value={creative.cta} />
            <DetailBlock label="Copy" value={creative.copy} />
            <DetailBlock label="Roteiro" value={creative.script} />
            <DetailBlock label="Prompt visual" value={creative.visualPrompt} />
            <DetailBlock label="Sugestão de imagem" value={creative.suggestedVisual} />
          </div>

          <div className="creative-agent-detail-metrics">
            {[
              ['CTR', `${creative.metrics.ctr.toFixed(2)}%`],
              ['CPC', `R$ ${creative.metrics.cpc.toFixed(2)}`],
              ['Conversões', String(creative.metrics.conversions)],
              ['CPA', `R$ ${creative.metrics.cpa.toFixed(2)}`],
              ['ROI', `${creative.metrics.roi.toFixed(2)}x`],
              ['Retenção', `${creative.metrics.retention.toFixed(0)}%`],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <div className="creative-agent-analysis-grid">
            <DetailBlock label="Pontos fortes" value={creative.analysis.strengths.join('\n')} />
            <DetailBlock label="Pontos fracos" value={creative.analysis.weaknesses.join('\n')} />
            <DetailBlock label="Sugestões de melhoria" value={creative.analysis.improvementSuggestions.join('\n')} />
            <DetailBlock label="Próximos testes" value={creative.analysis.nextTests.join('\n')} />
          </div>
        </div>
      )}

      <ModalActions>
        <button className="btn btn-secondary btn-md" type="button" onClick={handleClose}>Fechar</button>
        {editable && (
          <button className="btn btn-primary btn-md" type="button" onClick={() => onSave(draft)}>
            <Save size={14} /> Salvar alterações
          </button>
        )}
      </ModalActions>
    </Modal>
  );
}
