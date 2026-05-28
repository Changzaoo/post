import type { ReactNode } from 'react';
import { CalendarDays, ClipboardList, Hash, Layers, Megaphone, Save, Send, Sparkles, Video, Wand2 } from 'lucide-react';
import type {
  AgentCalendarItem,
  AgentCampaignPlan,
  AgentContentPlan,
  Creative,
  CreativeCampaign,
  CreativeFormData,
  CreativeGenerationResult,
} from '../../types/creative';

interface CreativeGeneratorFormProps {
  formData: CreativeFormData;
  campaigns: CreativeCampaign[];
  generated: CreativeGenerationResult | null;
  onChange: (updates: Partial<CreativeFormData>) => void;
  onGenerate: () => void;
  onSaveCreative: (creative: Creative) => void;
  onSaveAll: (creatives: Creative[]) => void;
}

const categoryExamples = [
  'curso online',
  'restaurante delivery',
  'moda e beleza',
  'fitness',
  'imobiliaria',
  'software SaaS',
  'loja online',
  'evento',
];

const emptyDerivedBrief: Partial<CreativeFormData> = {
  campaignName: '',
  product: '',
  audience: '',
  pain: '',
  desire: '',
  objections: '',
  promise: '',
};

function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="creative-agent-field">
      <label className="creative-agent-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        className="input creative-agent-input creative-agent-agent-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
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

function SummaryItem({ label, value }: { label: string; value: string | string[] }) {
  return (
    <div className="creative-agent-summary-item">
      <span>{label}</span>
      <p>{Array.isArray(value) ? value.join(' / ') : value}</p>
    </div>
  );
}

function CampaignPlanCard({ campaign }: { campaign: AgentCampaignPlan }) {
  return (
    <div className="glass-card creative-agent-plan-card">
      <div className="creative-agent-plan-card-top">
        <Megaphone size={15} />
        <strong>{campaign.title}</strong>
      </div>
      <p>{campaign.angle}</p>
      <div className="creative-agent-generated-meta">
        <span>{campaign.objective}</span>
        <span>{campaign.kpi}</span>
      </div>
      <div className="creative-agent-plan-list">
        {campaign.deliverables.map((deliverable) => (
          <span key={deliverable}>{deliverable}</span>
        ))}
      </div>
      <small>{campaign.channels.join(' / ')}</small>
    </div>
  );
}

function ContentPlanCard({ item }: { item: AgentContentPlan }) {
  return (
    <div className="glass-card creative-agent-content-card">
      <div className="creative-agent-copy-model">{item.format}</div>
      <h3>{item.title}</h3>
      <p>{item.hook}</p>
      <div className="creative-agent-copy-versions">
        <span><strong>Legenda:</strong> {item.caption}</span>
        <span><strong>CTA:</strong> {item.cta}</span>
        <span><strong>Producao:</strong> {item.productionNote}</span>
      </div>
    </div>
  );
}

function ContentPlanGrid({
  title,
  description,
  icon,
  items,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  items: AgentContentPlan[];
}) {
  return (
    <div className="creative-agent-pack-section">
      <div className="creative-agent-mini-header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        {icon}
      </div>
      <div className="creative-agent-content-grid">
        {items.map((item) => (
          <ContentPlanCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function ContentCalendar({ items }: { items: AgentCalendarItem[] }) {
  return (
    <div className="glass-card creative-agent-calendar">
      <div className="creative-agent-plan-card-top">
        <CalendarDays size={15} />
        <strong>Calendario sugerido</strong>
      </div>
      <div className="creative-agent-calendar-list">
        {items.map((item) => (
          <div key={item.id} className="creative-agent-calendar-row">
            <span>{item.day}</span>
            <strong>{item.title}</strong>
            <p>{item.channel} - {item.goal}</p>
          </div>
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
}: CreativeGeneratorFormProps) {
  const canGenerate = Boolean((formData.agentName || formData.product).trim() && formData.contentCategory.trim());

  const updateName = (agentName: string) => {
    onChange({ ...emptyDerivedBrief, agentName });
  };

  const updateCategory = (contentCategory: string) => {
    onChange({ ...emptyDerivedBrief, contentCategory });
  };

  return (
    <section className="creative-agent-section">
      <div className="creative-agent-section-header">
        <div>
          <h2>Agente criativo automatico</h2>
          <p>Preencha o nome e a categoria. O agente infere o resto e entrega um plano de conteudo completo.</p>
        </div>
        <button className="btn btn-primary btn-md" type="button" onClick={onGenerate} disabled={!canGenerate}>
          <Wand2 size={15} /> Criar Pacote
        </button>
      </div>

      <div className="glass-card creative-agent-generator creative-agent-agent-panel">
        <div className="creative-agent-agent-intro">
          <div className="creative-agent-agent-icon">
            <Sparkles size={22} />
          </div>
          <div>
            <h3>Briefing minimo</h3>
            <p>O agente monta publico, promessa, canais, campanhas, posts, reels, stories, copies, roteiros e prompts visuais.</p>
          </div>
        </div>

        <div className="creative-agent-agent-fields">
          <TextField
            id="agent-name"
            label="Nome"
            value={formData.agentName || formData.product}
            onChange={updateName}
            placeholder="Ex: Bella Fit, Escola Alfa, Burger Prime"
          />
          <TextField
            id="content-category"
            label="Categoria do conteudo"
            value={formData.contentCategory}
            onChange={updateCategory}
            placeholder="Ex: academia feminina, curso online, delivery artesanal"
          />
        </div>

        <div className="creative-agent-category-chips" aria-label="Sugestoes de categoria">
          {categoryExamples.map((category) => (
            <button key={category} type="button" onClick={() => updateCategory(category)}>
              {category}
            </button>
          ))}
        </div>

        <div className="creative-agent-agent-note">
          <ClipboardList size={14} />
          {campaigns.length} campanha{campaigns.length === 1 ? '' : 's'} salva{campaigns.length === 1 ? '' : 's'} na biblioteca.
        </div>
      </div>

      {generated && (
        <div className="creative-agent-generated">
          <div className="creative-agent-generated-header">
            <div>
              <h2>Pacote criado para {generated.agentBrief.name}</h2>
              <p>
                {generated.campaigns.length} campanhas, {generated.postIdeas.length} posts, {generated.reelIdeas.length} reels,
                {' '}{generated.storyIdeas.length} stories e {generated.ideas.length} criativos prontos para teste.
              </p>
            </div>
            <button className="btn btn-cyan btn-md" type="button" onClick={() => onSaveAll(generated.ideas)}>
              <Save size={15} /> Salvar criativos
            </button>
          </div>

          <div className="glass-card creative-agent-brief-panel">
            <div className="creative-agent-plan-card-top">
              <Layers size={15} />
              <strong>Estrategia inferida</strong>
            </div>
            <div className="creative-agent-summary-grid">
              <SummaryItem label="Categoria" value={generated.agentBrief.category} />
              <SummaryItem label="Publico" value={generated.agentBrief.audience} />
              <SummaryItem label="Promessa" value={generated.agentBrief.promise} />
              <SummaryItem label="Posicionamento" value={generated.agentBrief.positioning} />
              <SummaryItem label="Canais" value={generated.agentBrief.channels} />
              <SummaryItem label="Ritmo" value={generated.agentBrief.productionRhythm} />
            </div>
          </div>

          <div className="creative-agent-pack-section">
            <div className="creative-agent-mini-header">
              <div>
                <h3>Campanhas sugeridas</h3>
                <p>Linhas de ataque para atrair, aquecer, converter e reativar.</p>
              </div>
              <Megaphone size={22} style={{ color: '#20F5D8' }} />
            </div>
            <div className="creative-agent-plan-grid">
              {generated.campaigns.map((campaign) => (
                <CampaignPlanCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </div>

          <ContentPlanGrid
            title="Postagens e carrosseis"
            description="Ideias prontas para feed, carrossel e posts de autoridade."
            icon={<Send size={22} style={{ color: '#7EB8FF' }} />}
            items={generated.postIdeas}
          />

          <ContentPlanGrid
            title="Reels e shorts"
            description="Ganchos e direcao de producao para videos curtos."
            icon={<Video size={22} style={{ color: '#FF9F0A' }} />}
            items={generated.reelIdeas}
          />

          <ContentPlanGrid
            title="Stories"
            description="Sequencias curtas para relacionamento, prova e chamada."
            icon={<Sparkles size={22} style={{ color: '#B794FF' }} />}
            items={generated.storyIdeas}
          />

          <div className="creative-agent-ops-grid">
            <ContentCalendar items={generated.contentCalendar} />
            <div className="glass-card creative-agent-calendar">
              <div className="creative-agent-plan-card-top">
                <Hash size={15} />
                <strong>Hashtags e checklist</strong>
              </div>
              <div className="creative-agent-generated-list">
                {generated.hashtagSets.map((set) => (
                  <span key={set}>{set}</span>
                ))}
              </div>
              <div className="creative-agent-plan-list">
                {generated.launchChecklist.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="creative-agent-pack-section">
            <div className="creative-agent-mini-header">
              <div>
                <h3>Criativos para teste</h3>
                <p>Variações salvas entram na biblioteca para acompanhar status, metricas e teste A/B.</p>
              </div>
              <Sparkles size={22} style={{ color: '#20F5D8' }} />
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
                    <span>{creative.type}</span>
                    <span>{creative.emotion}</span>
                    <span>{creative.estimatedConversionProbability}% conv.</span>
                  </div>
                  <button className="btn btn-secondary btn-sm" type="button" onClick={() => onSaveCreative(creative)}>
                    <Save size={12} /> Salvar
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="creative-agent-generated-grid">
            <GeneratedList title="Headlines" items={generated.headlines} />
            <GeneratedList title="Chamadas curtas" items={generated.shortCalls} />
            <GeneratedList title="Ideias de carrossel" items={generated.carouselIdeas} />
            <GeneratedList title="CTAs" items={generated.ctas} />
            <GeneratedList title="Angulos de venda" items={generated.salesAngles} />
            <GeneratedList title="Variacoes emocionais" items={generated.emotionalVariations} />
            <GeneratedList title="Variacoes diretas" items={generated.directVariations} />
            <GeneratedList title="Variacoes educativas" items={generated.educationalVariations} />
          </div>
        </div>
      )}
    </section>
  );
}
