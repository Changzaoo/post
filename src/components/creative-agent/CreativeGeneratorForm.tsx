import { Save, Sparkles, Wand2 } from 'lucide-react';
import {
  creativeTypeOptions,
  objectiveOptions,
  platformOptions,
  toneOptions,
} from '../../services/creativeAgentService';
import type {
  CampaignObjective,
  Creative,
  CreativeCampaign,
  CreativeFormData,
  CreativeGenerationResult,
  CreativePlatform,
  CreativeTone,
  CreativeType,
} from '../../types/creative';
import { CampaignSelector } from './CampaignSelector';

interface CreativeGeneratorFormProps {
  formData: CreativeFormData;
  campaigns: CreativeCampaign[];
  generated: CreativeGenerationResult | null;
  onChange: (updates: Partial<CreativeFormData>) => void;
  onGenerate: () => void;
  onSaveCreative: (creative: Creative) => void;
  onSaveAll: (creatives: Creative[]) => void;
  onCreateCampaign: () => void;
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <div className="creative-agent-field">
      <label className="creative-agent-label">{label}</label>
      {multiline ? (
        <textarea
          className="input creative-agent-input creative-agent-textarea"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          className="input creative-agent-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="creative-agent-field">
      <label className="creative-agent-label">{label}</label>
      <select className="input creative-agent-input" value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option} value={option} style={{ background: '#020818' }}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function GeneratedList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="creative-agent-generated-box">
      <h3>{title}</h3>
      <div className="creative-agent-generated-list">
        {items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}

export function CreativeGeneratorForm({
  formData,
  campaigns,
  generated,
  onChange,
  onGenerate,
  onSaveCreative,
  onSaveAll,
  onCreateCampaign,
}: CreativeGeneratorFormProps) {
  return (
    <section className="creative-agent-section">
      <div className="creative-agent-section-header">
        <div>
          <h2>Gerador local de criativos</h2>
          <p>Templates internos com base no produto, público, dor, desejo e promessa.</p>
        </div>
        <button className="btn btn-primary btn-md" type="button" onClick={onGenerate}>
          <Wand2 size={15} /> Gerar Criativos
        </button>
      </div>

      <div className="glass-card creative-agent-generator">
        <div className="creative-agent-form-grid">
          <CampaignSelector
            value={formData.campaignName}
            campaigns={campaigns}
            onChange={(campaignName) => onChange({ campaignName })}
            onCreate={onCreateCampaign}
          />
          <TextField label="Produto ou serviço" value={formData.product} onChange={(product) => onChange({ product })} placeholder="Ex: curso de cripto para iniciantes" />
          <TextField label="Público-alvo" value={formData.audience} onChange={(audience) => onChange({ audience })} placeholder="Ex: iniciantes que querem investir com segurança" />
          <TextField label="Dor principal do público" value={formData.pain} onChange={(pain) => onChange({ pain })} placeholder="Ex: medo de perder dinheiro" />
          <TextField label="Desejo principal do público" value={formData.desire} onChange={(desire) => onChange({ desire })} placeholder="Ex: investir com confiança" />
          <TextField label="Objeções do público" value={formData.objections} onChange={(objections) => onChange({ objections })} placeholder="Ex: parece arriscado ou difícil" />
          <TextField label="Promessa principal" value={formData.promise} onChange={(promise) => onChange({ promise })} placeholder="Ex: aprender o básico sem cair em armadilhas" />
          <SelectField<CreativeTone> label="Tom de voz" value={formData.tone} options={toneOptions} onChange={(tone) => onChange({ tone })} />
          <SelectField<CreativePlatform> label="Plataforma" value={formData.platform} options={platformOptions} onChange={(platform) => onChange({ platform })} />
          <SelectField<CreativeType> label="Tipo de criativo" value={formData.type} options={creativeTypeOptions} onChange={(type) => onChange({ type })} />
          <SelectField<CampaignObjective> label="Objetivo da campanha" value={formData.objective} options={objectiveOptions} onChange={(objective) => onChange({ objective })} />
        </div>
      </div>

      {generated && (
        <div className="creative-agent-generated">
          <div className="creative-agent-generated-header">
            <div>
              <h2>Resultados gerados</h2>
              <p>{generated.ideas.length} ideias, {generated.headlines.length} headlines e variações prontas.</p>
            </div>
            <button className="btn btn-cyan btn-md" type="button" onClick={() => onSaveAll(generated.ideas)}>
              <Save size={15} /> Salvar todos
            </button>
          </div>

          <div className="creative-agent-generated-ideas">
            {generated.ideas.map((creative) => (
              <div className="glass-card creative-agent-generated-card" key={creative.id}>
                <div className="creative-agent-generated-card-top">
                  <Sparkles size={15} />
                  <strong>{creative.title}</strong>
                </div>
                <h3>{creative.headline}</h3>
                <p>{creative.description}</p>
                <div className="creative-agent-generated-meta">
                  <span>{creative.platform}</span>
                  <span>{creative.emotion}</span>
                  <span>{creative.estimatedConversionProbability}% conv.</span>
                </div>
                <button className="btn btn-secondary btn-sm" type="button" onClick={() => onSaveCreative(creative)}>
                  <Save size={12} /> Salvar
                </button>
              </div>
            ))}
          </div>

          <div className="creative-agent-generated-grid">
            <GeneratedList title="Headlines" items={generated.headlines} />
            <GeneratedList title="Chamadas curtas" items={generated.shortCalls} />
            <GeneratedList title="Ideias de carrossel" items={generated.carouselIdeas} />
            <GeneratedList title="CTAs" items={generated.ctas} />
            <GeneratedList title="Ângulos de venda" items={generated.salesAngles} />
            <GeneratedList title="Variações emocionais" items={generated.emotionalVariations} />
            <GeneratedList title="Variações diretas" items={generated.directVariations} />
            <GeneratedList title="Variações educativas" items={generated.educationalVariations} />
          </div>
        </div>
      )}
    </section>
  );
}
