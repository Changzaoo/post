import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { Calendar, Edit3, Megaphone, Pause, Plus, Target, Trash2, TrendingUp } from 'lucide-react';
import { Layout } from '../components/Layout';
import { DataPanel } from '../components/ui/DataPanel';
import { EmptyState } from '../components/ui/EmptyState';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput, GlassSelect } from '../components/ui/GlassInput';
import { GlassModal } from '../components/ui/GlassModal';
import { MetricCard } from '../components/ui/MetricCard';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';

type CampaignStatus = 'active' | 'planned' | 'paused' | 'finished';

interface Campaign {
  id?: string;
  userId: string;
  name: string;
  objective: string;
  channel: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  createdAt?: unknown;
}

type CampaignFormData = Omit<Campaign, 'id' | 'userId' | 'createdAt'>;

const statusConfig: Record<CampaignStatus, { label: string; color: string; tone: string }> = {
  active: { label: 'Ativa', color: '#34d399', tone: 'active' },
  planned: { label: 'Planejada', color: '#5aa7ff', tone: 'planned' },
  paused: { label: 'Pausada', color: '#facc15', tone: 'paused' },
  finished: { label: 'Finalizada', color: '#a78bfa', tone: 'success' },
};

const statusFilters: Array<{ value: 'all' | CampaignStatus; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'active', label: 'Ativas' },
  { value: 'planned', label: 'Planejadas' },
  { value: 'paused', label: 'Pausadas' },
  { value: 'finished', label: 'Finalizadas' },
];

const emptyForm = (): CampaignFormData => ({
  name: '',
  objective: '',
  channel: '',
  status: 'planned',
  startDate: '',
  endDate: '',
});

function CampaignModal({
  campaign,
  onClose,
  onSave,
}: {
  campaign?: Campaign | null;
  onClose: () => void;
  onSave: (data: CampaignFormData) => void;
}) {
  const [form, setForm] = useState<CampaignFormData>(() => campaign ? {
    name: campaign.name,
    objective: campaign.objective,
    channel: campaign.channel,
    status: campaign.status,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
  } : emptyForm());

  const set = (key: keyof CampaignFormData, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const canSubmit = form.name.trim().length > 0;

  return (
    <GlassModal
      open
      onClose={onClose}
      title={campaign ? 'Editar campanha' : 'Nova campanha'}
      description="Organize objetivo, canal, periodo e status sem sair do fluxo."
      size="lg"
    >
      <div className="campaign-modal-form">
        <GlassInput label="Nome da campanha" value={form.name} onChange={(event) => set('name', event.target.value)} placeholder="Ex: Lancamento Produto X" />
        <GlassInput label="Objetivo" value={form.objective} onChange={(event) => set('objective', event.target.value)} placeholder="Ex: Gerar 200 leads qualificados" />
        <GlassInput label="Canal" value={form.channel} onChange={(event) => set('channel', event.target.value)} placeholder="Instagram, TikTok, Email..." />
        <GlassSelect label="Status" value={form.status} onChange={(event) => set('status', event.target.value)}>
          {(Object.keys(statusConfig) as CampaignStatus[]).map((status) => (
            <option key={status} value={status}>{statusConfig[status].label}</option>
          ))}
        </GlassSelect>
        <GlassInput label="Data de inicio" type="date" value={form.startDate} onChange={(event) => set('startDate', event.target.value)} />
        <GlassInput label="Data de fim" type="date" value={form.endDate} onChange={(event) => set('endDate', event.target.value)} />
        <div className="campaign-modal-actions">
          <GlassButton variant="ghost" onClick={onClose}>Cancelar</GlassButton>
          <GlassButton variant="primary" onClick={() => canSubmit && onSave(form)} disabled={!canSubmit}>
            {campaign ? 'Salvar alteracoes' : 'Criar campanha'}
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  );
}

export function CampaignsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | CampaignStatus>('all');
  const [modalCampaign, setModalCampaign] = useState<Campaign | null | undefined>(undefined);

  const loadCampaigns = async () => {
    if (!user) return;
    const snap = await getDocs(
      query(collection(db, 'campaigns'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'))
    );
    setCampaigns(snap.docs.map((item) => ({ ...item.data(), id: item.id } as Campaign)));
    setLoading(false);
  };

  useEffect(() => {
    loadCampaigns();
  }, [user]);

  const handleSave = async (data: CampaignFormData) => {
    if (!user) return;

    if (modalCampaign?.id) {
      await updateDoc(doc(db, 'campaigns', modalCampaign.id), data);
      setCampaigns((prev) => prev.map((campaign) => campaign.id === modalCampaign.id ? { ...campaign, ...data } : campaign));
    } else {
      await addDoc(collection(db, 'campaigns'), { ...data, userId: user.uid, createdAt: serverTimestamp() });
      await loadCampaigns();
    }

    setModalCampaign(undefined);
  };

  const handleStatusChange = async (id: string, status: CampaignStatus) => {
    await updateDoc(doc(db, 'campaigns', id), { status });
    setCampaigns((prev) => prev.map((campaign) => campaign.id === id ? { ...campaign, status } : campaign));
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'campaigns', id));
    setCampaigns((prev) => prev.filter((campaign) => campaign.id !== id));
  };

  const filtered = filter === 'all' ? campaigns : campaigns.filter((campaign) => campaign.status === filter);

  const stats = [
    { label: 'Ativas', value: campaigns.filter((campaign) => campaign.status === 'active').length, color: '#34d399', icon: <TrendingUp size={20} /> },
    { label: 'Planejadas', value: campaigns.filter((campaign) => campaign.status === 'planned').length, color: '#5aa7ff', icon: <Calendar size={20} /> },
    { label: 'Pausadas', value: campaigns.filter((campaign) => campaign.status === 'paused').length, color: '#facc15', icon: <Pause size={20} /> },
    { label: 'Finalizadas', value: campaigns.filter((campaign) => campaign.status === 'finished').length, color: '#a78bfa', icon: <Target size={20} /> },
  ];

  return (
    <Layout>
      <div className="pf-page campaigns-page">
        <PageHeader
          eyebrow={<><Megaphone size={14} /> Marketing OS</>}
          title="Campanhas"
          description="Planeje, acompanhe e ajuste iniciativas com cards, status e acoes consistentes no mesmo visual do PostFlow."
          actions={<GlassButton variant="primary" onClick={() => setModalCampaign(null)}><Plus size={16} /> Nova campanha</GlassButton>}
        />

        <div className="metric-grid">
          {stats.map((stat) => (
            <MetricCard key={stat.label} label={stat.label} value={loading ? '-' : stat.value} icon={stat.icon} accent={stat.color} />
          ))}
        </div>

        <DataPanel
          title="Lista de campanhas"
          description={`${filtered.length} campanha(s) no filtro atual`}
          tools={
            <div className="segmented-control">
              {statusFilters.map((item) => (
                <button
                  key={item.value}
                  className={filter === item.value ? 'active' : ''}
                  onClick={() => setFilter(item.value)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          }
        >
          {loading ? (
            <div className="loading-state">
              <div className="animate-spin" />
              <span>Carregando campanhas...</span>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Megaphone size={30} />}
              title={campaigns.length === 0 ? 'Nenhuma campanha criada' : 'Nenhuma campanha neste filtro'}
              description={campaigns.length === 0 ? 'Crie sua primeira campanha para organizar objetivos, canais e periodos.' : 'Altere o filtro de status para ver outras campanhas.'}
              action={campaigns.length === 0 ? <GlassButton variant="primary" onClick={() => setModalCampaign(null)}><Plus size={16} /> Nova campanha</GlassButton> : undefined}
            />
          ) : (
            <div className="campaign-card-grid">
              {filtered.map((campaign) => {
                const status = statusConfig[campaign.status];
                return (
                  <article className="campaign-card glass-card" key={campaign.id}>
                    <div className="campaign-card__top">
                      <div>
                        <h2>{campaign.name}</h2>
                        <div className="campaign-card__chips">
                          <span className="status-chip" data-status={status.tone}>{status.label}</span>
                          {campaign.channel && <span className="status-chip">{campaign.channel}</span>}
                        </div>
                      </div>
                      <div className="campaign-card__icon" style={{ color: status.color, background: `${status.color}1f` }}>
                        <Megaphone size={18} />
                      </div>
                    </div>

                    {campaign.objective && <p>{campaign.objective}</p>}

                    <div className="campaign-card__date">
                      <Calendar size={14} />
                      <span>{campaign.startDate || 'Sem inicio'} ate {campaign.endDate || 'sem fim'}</span>
                    </div>

                    <div className="campaign-card__actions">
                      <GlassButton variant="secondary" size="sm" onClick={() => setModalCampaign(campaign)}>
                        <Edit3 size={14} /> Editar
                      </GlassButton>
                      <GlassButton variant="secondary" size="sm" onClick={() => campaign.id && handleStatusChange(campaign.id, campaign.status === 'paused' ? 'active' : 'paused')}>
                        <Pause size={14} /> {campaign.status === 'paused' ? 'Retomar' : 'Pausar'}
                      </GlassButton>
                      <GlassSelect aria-label="Alterar status" value={campaign.status} onChange={(event) => campaign.id && handleStatusChange(campaign.id, event.target.value as CampaignStatus)}>
                        {(Object.keys(statusConfig) as CampaignStatus[]).map((item) => (
                          <option key={item} value={item}>{statusConfig[item].label}</option>
                        ))}
                      </GlassSelect>
                      <GlassButton variant="danger" size="icon" aria-label="Excluir campanha" onClick={() => campaign.id && handleDelete(campaign.id)}>
                        <Trash2 size={14} />
                      </GlassButton>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </DataPanel>
      </div>

      {modalCampaign !== undefined && (
        <CampaignModal campaign={modalCampaign} onClose={() => setModalCampaign(undefined)} onSave={handleSave} />
      )}
    </Layout>
  );
}
