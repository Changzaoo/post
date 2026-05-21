import { useEffect, useMemo, useState } from 'react';
import { Archive, BookOpen, Bot, FolderPlus, Plus, Sparkles } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Modal, ModalActions } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import {
  createCreativeCampaign,
  createVariationFromCreative,
  defaultCreativeFormData,
  duplicateCreative,
  generateCreativeBundle,
  loadCreativeCampaigns,
  loadCreatives,
  removeCreative,
  saveCreative,
  updateCreative,
  updateCreativeStatus,
} from '../services/creativeAgentService';
import type {
  Creative,
  CreativeCampaign,
  CreativeFormData,
  CreativeGenerationResult,
  CreativeStatus,
} from '../types/creative';
import { CopyGenerator } from '../components/creative-agent/CopyGenerator';
import { CreativeABTest } from '../components/creative-agent/CreativeABTest';
import { CreativeDetailsModal } from '../components/creative-agent/CreativeDetailsModal';
import { CreativeGeneratorForm } from '../components/creative-agent/CreativeGeneratorForm';
import { CreativeImprovementPanel } from '../components/creative-agent/CreativeImprovementPanel';
import { CreativeLibrary } from '../components/creative-agent/CreativeLibrary';
import { CreativeStatsCards } from '../components/creative-agent/CreativeStatsCards';
import { ScriptGenerator } from '../components/creative-agent/ScriptGenerator';
import { VisualPromptGenerator } from '../components/creative-agent/VisualPromptGenerator';

type AgentTab = 'gerador' | 'biblioteca' | 'ab' | 'melhoria' | 'roteiros' | 'prompts' | 'copies';

const tabs: Array<{ id: AgentTab; label: string }> = [
  { id: 'gerador', label: 'Gerador' },
  { id: 'biblioteca', label: 'Biblioteca' },
  { id: 'ab', label: 'Teste A/B' },
  { id: 'melhoria', label: 'Melhorias' },
  { id: 'roteiros', label: 'Roteiros' },
  { id: 'prompts', label: 'Prompts Visuais' },
  { id: 'copies', label: 'Copies' },
];

const emptyCampaignForm = {
  name: '',
  product: '',
  audience: '',
  objective: '',
};

function NewCampaignModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (campaign: Pick<CreativeCampaign, 'name' | 'product' | 'audience' | 'objective'>) => void;
}) {
  const [form, setForm] = useState(emptyCampaignForm);

  const closeAndReset = () => {
    setForm(emptyCampaignForm);
    onClose();
  };

  const createAndReset = () => {
    onCreate(form);
    setForm(emptyCampaignForm);
  };

  return (
    <Modal open={open} onClose={closeAndReset} title="Nova Campanha" description="Organize criativos por oferta, público e objetivo." size="md">
      <div className="creative-agent-form-grid single">
        <div className="creative-agent-field">
          <label className="creative-agent-label">Nome</label>
          <input className="input creative-agent-input" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
        </div>
        <div className="creative-agent-field">
          <label className="creative-agent-label">Produto</label>
          <input className="input creative-agent-input" value={form.product} onChange={(event) => setForm((current) => ({ ...current, product: event.target.value }))} />
        </div>
        <div className="creative-agent-field">
          <label className="creative-agent-label">Público</label>
          <input className="input creative-agent-input" value={form.audience} onChange={(event) => setForm((current) => ({ ...current, audience: event.target.value }))} />
        </div>
        <div className="creative-agent-field">
          <label className="creative-agent-label">Objetivo</label>
          <input className="input creative-agent-input" value={form.objective} onChange={(event) => setForm((current) => ({ ...current, objective: event.target.value }))} />
        </div>
      </div>
      <ModalActions>
        <button className="btn btn-secondary btn-md" type="button" onClick={closeAndReset}>Cancelar</button>
        <button className="btn btn-primary btn-md" type="button" disabled={!form.name.trim()} onClick={createAndReset}>
          <FolderPlus size={14} /> Criar Campanha
        </button>
      </ModalActions>
    </Modal>
  );
}

export function CreativeAgentPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AgentTab>('gerador');
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [campaigns, setCampaigns] = useState<CreativeCampaign[]>([]);
  const [formData, setFormData] = useState<CreativeFormData>(defaultCreativeFormData);
  const [generated, setGenerated] = useState<CreativeGenerationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [persistence, setPersistence] = useState<'firestore' | 'localStorage'>('firestore');
  const [message, setMessage] = useState('');
  const [selectedCreative, setSelectedCreative] = useState<Creative | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);

  const visibleCreatives = useMemo(() => creatives.filter((creative) => creative.status !== 'Arquivado'), [creatives]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      const [creativeResult, campaignResult] = await Promise.all([
        loadCreatives(user.uid),
        loadCreativeCampaigns(user.uid),
      ]);

      setCreatives(creativeResult.data);
      setCampaigns(campaignResult.data);
      setPersistence(creativeResult.source === 'localStorage' || campaignResult.source === 'localStorage' ? 'localStorage' : 'firestore');
      if (creativeResult.error || campaignResult.error) {
        setMessage('Firestore indisponível para esta coleção. Salvando temporariamente no navegador.');
      }
      setLoading(false);
    };

    load();
  }, [user]);

  const upsertCreativeInState = (creative: Creative) => {
    setCreatives((current) => (
      current.some((item) => item.id === creative.id)
        ? current.map((item) => (item.id === creative.id ? creative : item))
        : [creative, ...current]
    ));
  };

  const handleGenerate = () => {
    const result = generateCreativeBundle(formData);
    setGenerated(result);
    setMessage('Criativos gerados com templates locais.');
  };

  const handleSaveCreative = async (creative: Creative) => {
    if (!user) return;
    setSaving(true);
    const result = await saveCreative(user.uid, creative);
    upsertCreativeInState(result.data);
    setPersistence(result.source);
    setMessage(result.source === 'firestore' ? 'Criativo salvo no Firestore.' : 'Criativo salvo no localStorage.');
    setSaving(false);
  };

  const handleSaveAll = async (items: Creative[]) => {
    if (!user || items.length === 0) return;
    setSaving(true);
    const results = await Promise.all(items.map((creative) => saveCreative(user.uid, creative)));
    setCreatives((current) => {
      const next = [...current];
      results.forEach((result) => {
        const index = next.findIndex((item) => item.id === result.data.id);
        if (index >= 0) next[index] = result.data;
        else next.unshift(result.data);
      });
      return next;
    });
    setPersistence(results.some((result) => result.source === 'localStorage') ? 'localStorage' : 'firestore');
    setMessage(`${results.length} criativos salvos.`);
    setSaving(false);
  };

  const handleUpdateCreative = async (creative: Creative) => {
    if (!user) return;
    setSaving(true);
    const result = await updateCreative(user.uid, creative);
    upsertCreativeInState(result.data);
    setPersistence(result.source);
    setSelectedCreative(null);
    setMessage('Criativo atualizado.');
    setSaving(false);
  };

  const handleDuplicate = async (creative: Creative) => {
    await handleSaveCreative(duplicateCreative(creative));
  };

  const handleGenerateVariations = async (creative: Creative) => {
    if (!user) return;
    const variations = [
      createVariationFromCreative(creative, 'Emocional'),
      createVariationFromCreative(creative, 'Direto'),
      createVariationFromCreative(creative, 'Educativo'),
    ];
    await handleSaveAll(variations);
    setActiveTab('biblioteca');
  };

  const handleStatusChange = async (creative: Creative, status: CreativeStatus) => {
    if (!user) return;
    const nextCreative = updateCreativeStatus(creative, status);
    const result = await updateCreative(user.uid, nextCreative);
    upsertCreativeInState(result.data);
    setPersistence(result.source);
    setMessage(`Status atualizado para ${status}.`);
  };

  const handleDelete = async (creative: Creative) => {
    if (!user) return;
    const shouldDelete = window.confirm(`Excluir "${creative.title}"?`);
    if (!shouldDelete) return;
    const result = await removeCreative(user.uid, creative.id);
    setCreatives((current) => current.filter((item) => item.id !== result.data));
    setPersistence(result.source);
    setMessage('Criativo excluído.');
  };

  const handleCreateCampaign = async (campaign: Pick<CreativeCampaign, 'name' | 'product' | 'audience' | 'objective'>) => {
    if (!user) return;
    setSaving(true);
    const result = await createCreativeCampaign(user.uid, campaign);
    setCampaigns((current) => [result.data, ...current]);
    setFormData((current) => ({
      ...current,
      campaignName: result.data.name,
      product: current.product || result.data.product,
      audience: current.audience || result.data.audience,
      objective: current.objective,
    }));
    setPersistence(result.source);
    setCampaignModalOpen(false);
    setMessage('Campanha criada.');
    setSaving(false);
  };

  const openDetails = (creative: Creative) => {
    setModalMode('view');
    setSelectedCreative(creative);
  };

  const openEdit = (creative: Creative) => {
    setModalMode('edit');
    setSelectedCreative(creative);
  };

  return (
    <Layout>
      <div className="creative-agent-page">
        <header className="creative-agent-hero">
          <div>
            <div className="creative-agent-eyebrow">
              <Bot size={15} />
              Laboratório de marketing
            </div>
            <h1>Agente de Criativos</h1>
            <p>Crie, teste e otimize anúncios, copies, roteiros e prompts visuais em um só lugar.</p>
            <div className="creative-agent-storage-badge">
              Dados: {persistence === 'firestore' ? 'Firestore por usuário' : 'localStorage temporário'}
              {saving ? ' · salvando...' : ''}
            </div>
          </div>
          <div className="creative-agent-hero-actions">
            <button className="btn btn-primary btn-md" type="button" onClick={() => setActiveTab('gerador')}>
              <Plus size={15} /> Novo Criativo
            </button>
            <button className="btn btn-secondary btn-md" type="button" onClick={() => setCampaignModalOpen(true)}>
              <FolderPlus size={15} /> Nova Campanha
            </button>
            <button className="btn btn-cyan btn-md" type="button" onClick={() => { setActiveTab('gerador'); handleGenerate(); }}>
              <Sparkles size={15} /> Gerar com Agente
            </button>
            <button className="btn btn-secondary btn-md" type="button" onClick={() => setActiveTab('biblioteca')}>
              <BookOpen size={15} /> Biblioteca
            </button>
          </div>
        </header>

        {message && <div className="creative-agent-message">{message}</div>}

        <CreativeStatsCards creatives={creatives} />

        <nav className="creative-agent-tabs" aria-label="Seções do Agente de Criativos">
          {tabs.map((tab) => (
            <button key={tab.id} type="button" className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </nav>

        {loading ? (
          <div className="glass-card creative-agent-empty-state">
            <Archive size={34} />
            <strong>Carregando criativos...</strong>
            <span>Buscando dados do usuário autenticado.</span>
          </div>
        ) : (
          <>
            {activeTab === 'gerador' && (
              <CreativeGeneratorForm
                formData={formData}
                campaigns={campaigns}
                generated={generated}
                onChange={(updates) => setFormData((current) => ({ ...current, ...updates }))}
                onGenerate={handleGenerate}
                onSaveCreative={handleSaveCreative}
                onSaveAll={handleSaveAll}
                onCreateCampaign={() => setCampaignModalOpen(true)}
              />
            )}

            {activeTab === 'biblioteca' && (
              <CreativeLibrary
                creatives={creatives}
                onView={openDetails}
                onEdit={openEdit}
                onDuplicate={handleDuplicate}
                onGenerateVariations={handleGenerateVariations}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            )}

            {activeTab === 'ab' && <CreativeABTest creatives={visibleCreatives} />}
            {activeTab === 'melhoria' && <CreativeImprovementPanel creatives={visibleCreatives} />}
            {activeTab === 'roteiros' && <ScriptGenerator formData={formData} />}
            {activeTab === 'prompts' && <VisualPromptGenerator formData={formData} />}
            {activeTab === 'copies' && <CopyGenerator formData={formData} />}
          </>
        )}
      </div>

      <CreativeDetailsModal
        creative={selectedCreative}
        mode={modalMode}
        onClose={() => setSelectedCreative(null)}
        onSave={handleUpdateCreative}
      />

      <NewCampaignModal
        open={campaignModalOpen}
        onClose={() => setCampaignModalOpen(false)}
        onCreate={handleCreateCampaign}
      />
    </Layout>
  );
}
