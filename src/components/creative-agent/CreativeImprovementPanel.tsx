import { Lightbulb, TrendingDown, Wand2 } from 'lucide-react';
import { calculateCreativeScore, suggestCreativeImprovements } from '../../services/creativeAgentService';
import type { Creative } from '../../types/creative';

export function CreativeImprovementPanel({ creatives }: { creatives: Creative[] }) {
  const candidates = creatives
    .filter((creative) => creative.status !== 'Arquivado')
    .sort((a, b) => calculateCreativeScore(a.metrics) - calculateCreativeScore(b.metrics))
    .slice(0, 4);

  return (
    <section className="creative-agent-section">
      <div className="creative-agent-section-header">
        <div>
          <h2>Agente de melhoria automática</h2>
          <p>Diagnóstico por CTR, CPC, conversão, retenção e ROI.</p>
        </div>
        <Wand2 size={22} style={{ color: '#A78BFA' }} />
      </div>

      {candidates.length === 0 ? (
        <div className="glass-card creative-agent-empty-state">
          <Lightbulb size={34} />
          <strong>Nenhum criativo para analisar</strong>
          <span>Salve criativos e adicione métricas para receber sugestões.</span>
        </div>
      ) : (
        <div className="creative-agent-improvement-grid">
          {candidates.map((creative) => {
            const score = calculateCreativeScore(creative.metrics);
            const suggestions = suggestCreativeImprovements(creative.metrics);
            return (
              <div className="glass-card creative-agent-improvement-card" key={creative.id}>
                <div className="creative-agent-improvement-top">
                  <TrendingDown size={17} />
                  <div>
                    <strong>{creative.title}</strong>
                    <span>Score {score}</span>
                  </div>
                </div>
                <div className="creative-agent-generated-list">
                  {suggestions.map((suggestion) => (
                    <span key={suggestion}>{suggestion}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
