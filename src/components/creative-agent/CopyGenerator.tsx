import { FileText } from 'lucide-react';
import { useMemo } from 'react';
import { generateCopyModels } from '../../services/creativeAgentService';
import type { CreativeFormData } from '../../types/creative';

export function CopyGenerator({ formData }: { formData: CreativeFormData }) {
  const copies = useMemo(() => generateCopyModels(formData), [formData]);

  return (
    <section className="creative-agent-section">
      <div className="creative-agent-section-header">
        <div>
          <h2>Copies</h2>
          <p>Modelos AIDA, PAS, PASTOR, BAB, prova social, oferta e variações.</p>
        </div>
        <FileText size={22} style={{ color: '#7EB8FF' }} />
      </div>

      <div className="creative-agent-copy-grid">
        {copies.map((copy) => (
          <div className="glass-card creative-agent-copy-card" key={copy.id}>
            <div className="creative-agent-copy-model">{copy.model}</div>
            <h3>{copy.headline}</h3>
            <p>{copy.mainText}</p>
            <div className="creative-agent-copy-versions">
              <span><strong>CTA:</strong> {copy.cta}</span>
              <span><strong>Curta:</strong> {copy.shortVersion}</span>
              <span><strong>Longa:</strong> {copy.longVersion}</span>
              <span><strong>Agressiva:</strong> {copy.aggressiveVersion}</span>
              <span><strong>Emocional:</strong> {copy.emotionalVersion}</span>
              <span><strong>Profissional:</strong> {copy.professionalVersion}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
