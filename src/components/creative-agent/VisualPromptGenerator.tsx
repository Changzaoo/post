import { ImagePlus } from 'lucide-react';
import { useMemo } from 'react';
import { generateVisualPrompts } from '../../services/creativeAgentService';
import type { CreativeFormData } from '../../types/creative';

export function VisualPromptGenerator({ formData }: { formData: CreativeFormData }) {
  const prompts = useMemo(() => generateVisualPrompts(formData, 5), [formData]);

  return (
    <section className="creative-agent-section">
      <div className="creative-agent-section-header">
        <div>
          <h2>Prompts Visuais</h2>
          <p>Prompts prontos para gerar imagens em IA por campanha.</p>
        </div>
        <ImagePlus size={22} style={{ color: '#20F5D8' }} />
      </div>

      <div className="creative-agent-prompt-grid">
        {prompts.map((prompt) => (
          <div className="glass-card creative-agent-prompt-card" key={prompt.id}>
            <h3>{prompt.title}</h3>
            <div className="creative-agent-prompt-fields">
              <span>Formato: {prompt.format}</span>
              <span>Estilo: {prompt.visualStyle}</span>
              <span>Cenário: {prompt.setting}</span>
              <span>Principal: {prompt.mainSubject}</span>
              <span>Iluminação: {prompt.lighting}</span>
              <span>Cores: {prompt.colors}</span>
              <span>Composição: {prompt.composition}</span>
              <span>Emoção: {prompt.emotion}</span>
              <span>Câmera: {prompt.cameraAngle}</span>
              <span>Qualidade: {prompt.quality}</span>
              <span>Proibidos: {prompt.forbiddenElements}</span>
              <span>Proporção: {prompt.aspectRatio}</span>
            </div>
            <p>{prompt.prompt}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
