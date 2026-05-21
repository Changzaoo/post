import { ArrowRightLeft, Trophy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { calculateCreativeScore, compareCreatives } from '../../services/creativeAgentService';
import type { Creative } from '../../types/creative';

interface CreativeABTestProps {
  creatives: Creative[];
}

function MetricRow({ label, left, right }: { label: string; left: string; right: string }) {
  return (
    <div className="creative-agent-ab-row">
      <span>{label}</span>
      <strong>{left}</strong>
      <strong>{right}</strong>
    </div>
  );
}

export function CreativeABTest({ creatives }: CreativeABTestProps) {
  const comparableCreatives = creatives.filter((creative) => creative.status !== 'Arquivado');
  const [leftId, setLeftId] = useState(comparableCreatives[0]?.id ?? '');
  const [rightId, setRightId] = useState(comparableCreatives[1]?.id ?? '');
  const effectiveLeftId = leftId || comparableCreatives[0]?.id || '';
  const effectiveRightId = rightId || comparableCreatives.find((creative) => creative.id !== effectiveLeftId)?.id || '';
  const left = useMemo(() => comparableCreatives.find((creative) => creative.id === effectiveLeftId) ?? null, [comparableCreatives, effectiveLeftId]);
  const right = useMemo(() => comparableCreatives.find((creative) => creative.id === effectiveRightId) ?? null, [comparableCreatives, effectiveRightId]);
  const comparison = compareCreatives(left, right);

  return (
    <section className="creative-agent-section">
      <div className="creative-agent-section-header">
        <div>
          <h2>Teste A/B</h2>
          <p>Compare headline, copy, CTA, plataforma e performance.</p>
        </div>
        <ArrowRightLeft size={22} style={{ color: '#20F5D8' }} />
      </div>

      <div className="glass-card creative-agent-ab">
        <div className="creative-agent-ab-selectors">
          <select className="input creative-agent-input" value={effectiveLeftId} onChange={(event) => setLeftId(event.target.value)}>
            <option value="" style={{ background: '#020818' }}>Criativo A</option>
            {comparableCreatives.map((creative) => (
              <option key={creative.id} value={creative.id} style={{ background: '#020818' }}>{creative.title}</option>
            ))}
          </select>
          <select className="input creative-agent-input" value={effectiveRightId} onChange={(event) => setRightId(event.target.value)}>
            <option value="" style={{ background: '#020818' }}>Criativo B</option>
            {comparableCreatives.map((creative) => (
              <option key={creative.id} value={creative.id} style={{ background: '#020818' }}>{creative.title}</option>
            ))}
          </select>
        </div>

        <div className="creative-agent-ab-columns">
          <div>
            <span className="creative-agent-label">Criativo A</span>
            <h3>{left?.title ?? 'Selecione um criativo'}</h3>
            <p>{left?.headline ?? 'Aguardando seleção'}</p>
          </div>
          <div>
            <span className="creative-agent-label">Criativo B</span>
            <h3>{right?.title ?? 'Selecione um criativo'}</h3>
            <p>{right?.headline ?? 'Aguardando seleção'}</p>
          </div>
        </div>

        {left && right && (
          <>
            <div className="creative-agent-ab-table">
              <MetricRow label="Headline" left={left.headline} right={right.headline} />
              <MetricRow label="Copy" left={left.copy.slice(0, 120)} right={right.copy.slice(0, 120)} />
              <MetricRow label="CTA" left={left.cta} right={right.cta} />
              <MetricRow label="Plataforma" left={left.platform} right={right.platform} />
              <MetricRow label="CTR" left={`${left.metrics.ctr.toFixed(2)}%`} right={`${right.metrics.ctr.toFixed(2)}%`} />
              <MetricRow label="CPC" left={`R$ ${left.metrics.cpc.toFixed(2)}`} right={`R$ ${right.metrics.cpc.toFixed(2)}`} />
              <MetricRow label="Conversões" left={String(left.metrics.conversions)} right={String(right.metrics.conversions)} />
              <MetricRow label="ROI" left={`${left.metrics.roi.toFixed(2)}x`} right={`${right.metrics.roi.toFixed(2)}x`} />
              <MetricRow label="Retenção" left={`${left.metrics.retention.toFixed(0)}%`} right={`${right.metrics.retention.toFixed(0)}%`} />
              <MetricRow label="Score" left={String(calculateCreativeScore(left.metrics))} right={String(calculateCreativeScore(right.metrics))} />
            </div>

            <div className="creative-agent-ab-winner">
              <div>
                <Trophy size={18} />
                <span>Criativo vencedor</span>
                <strong>{comparison.winner?.title ?? 'Empate técnico'}</strong>
              </div>
              <p>{comparison.probableReason}</p>
              <div className="creative-agent-generated-list">
                <span>Elemento forte: {comparison.strongestElement}</span>
                <span>Elemento fraco: {comparison.weakestElement}</span>
                <span>{comparison.nextRecommendedTest}</span>
                {comparison.notes.map((note) => <span key={note}>{note}</span>)}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
