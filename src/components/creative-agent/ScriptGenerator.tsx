import { Clapperboard } from 'lucide-react';
import { useMemo } from 'react';
import { generateShortVideoScripts } from '../../services/creativeAgentService';
import type { CreativeFormData } from '../../types/creative';

export function ScriptGenerator({ formData }: { formData: CreativeFormData }) {
  const scripts = useMemo(() => generateShortVideoScripts(formData, 5), [formData]);

  return (
    <section className="creative-agent-section">
      <div className="creative-agent-section-header">
        <div>
          <h2>Roteiros</h2>
          <p>Estrutura para vídeos curtos com gancho, prova, oferta e CTA.</p>
        </div>
        <Clapperboard size={22} style={{ color: '#FF9F0A' }} />
      </div>

      <div className="creative-agent-script-grid">
        {scripts.map((script) => (
          <div className="glass-card creative-agent-script-card" key={script.id}>
            <h3>{script.title}</h3>
            <div className="creative-agent-script-steps">
              <span><strong>0 a 3s:</strong> {script.hook}</span>
              <span><strong>3 a 15s:</strong> {script.development}</span>
              <span><strong>Quebra:</strong> {script.patternBreak}</span>
              <span><strong>Prova:</strong> {script.proof}</span>
              <span><strong>Oferta:</strong> {script.offer}</span>
              <span><strong>CTA:</strong> {script.finalCta}</span>
            </div>
            <div className="creative-agent-detail-grid compact">
              <div><span>Narração</span><p>{script.narration}</p></div>
              <div><span>Texto na tela</span><p>{script.onScreenText}</p></div>
              <div><span>Cena</span><p>{script.sceneSuggestion}</p></div>
              <div><span>Imagem</span><p>{script.imageSuggestion}</p></div>
              <div><span>Música/ritmo</span><p>{script.musicSuggestion}</p></div>
              <div><span>Corte</span><p>{script.cutSuggestion}</p></div>
              <div><span>Duração</span><p>{script.estimatedDuration}</p></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
