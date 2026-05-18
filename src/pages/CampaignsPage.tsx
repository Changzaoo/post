import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  collection, query, where, orderBy, getDocs,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Megaphone, X, Plus, Calendar, TrendingUp, Target, Trash2 } from 'lucide-react';

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
  createdAt?: any;
}

const statusConfig: Record<CampaignStatus, { label: string; color: string; bg: string; border: string }> = {
  active:   { label: 'Ativa',       color: '#10D97A', bg: 'rgba(16,217,122,0.10)',  border: 'rgba(16,217,122,0.22)' },
  planned:  { label: 'Planejada',   color: '#94A3B8', bg: 'rgba(148,163,184,0.09)', border: 'rgba(148,163,184,0.20)' },
  paused:   { label: 'Pausada',     color: '#FFD84D', bg: 'rgba(255,216,77,0.09)',  border: 'rgba(255,216,77,0.22)' },
  finished: { label: 'Finalizada',  color: '#3B6EFF', bg: 'rgba(59,110,255,0.09)',  border: 'rgba(59,110,255,0.22)' },
};

const statusFilters: Array<{ value: 'all' | CampaignStatus; label: string }> = [
  { value: 'all',      label: 'Todas' },
  { value: 'active',   label: 'Ativas' },
  { value: 'planned',  label: 'Planejadas' },
  { value: 'paused',   label: 'Pausadas' },
  { value: 'finished', label: 'Finalizadas' },
];

const emptyForm = (): Omit<Campaign, 'id' | 'userId' | 'createdAt'> => ({
  name: '', objective: '', channel: '', status: 'planned',
  startDate: '', endDate: '',
});

function NewCampaignModal({ onClose, onSave }: { onClose: () => void; onSave: (data: Omit<Campaign, 'id' | 'userId' | 'createdAt'>) => void }) {
  const [form, setForm] = useState(emptyForm());

  const set = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <AnimatePresence>
      <motion.div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div style={{ position: 'absolute', inset: 0, background: 'rgba(2,8,24,0.80)', backdropFilter: 'blur(8px)' }} onClick={onClose} />
        <motion.div
          style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 520, background: 'rgba(4,12,40,0.97)', backdropFilter: 'blur(40px)', border: '0.5px solid rgba(59,110,255,0.25)', borderRadius: 22, boxShadow: '0 40px 120px rgba(0,0,40,0.80)', overflow: 'hidden' }}
          initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.25 }}
        >
          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(59,110,255,0.50), rgba(32,245,216,0.30), transparent)' }} />
          <div style={{ padding: '22px 26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>Nova Campanha</h2>
              <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { key: 'name' as const, label: 'Nome da campanha *', placeholder: 'Ex: Lançamento Produto X' },
                { key: 'objective' as const, label: 'Objetivo', placeholder: 'Ex: Gerar 200 leads qualificados' },
                { key: 'channel' as const, label: 'Canal', placeholder: 'Ex: Instagram, TikTok, Email' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>{label}</label>
                  <input
                    value={form[key]}
                    onChange={e => set(key, e.target.value)}
                    placeholder={placeholder}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.12)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.12)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}>
                  {(Object.keys(statusConfig) as CampaignStatus[]).map(s => (
                    <option key={s} value={s} style={{ background: '#020818' }}>{statusConfig[s].label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { key: 'startDate' as const, label: 'Data de início' },
                  { key: 'endDate' as const, label: 'Data de fim' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>{label}</label>
                    <input type="date" value={form[key]} onChange={e => set(key, e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.12)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.10)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleSubmit} disabled={!form.name.trim()} style={{ flex: 2, padding: '10px', borderRadius: 10, background: form.name.trim() ? 'linear-gradient(135deg, #3B6EFF, #1A5CFF)' : 'rgba(59,110,255,0.25)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: form.name.trim() ? 'pointer' : 'default', border: 'none' }}>
                Criar Campanha
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function CampaignsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | CampaignStatus>('all');
  const [showModal, setShowModal] = useState(false);

  const loadCampaigns = async () => {
    if (!user) return;
    const snap = await getDocs(
      query(collection(db, 'campaigns'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'))
    );
    setCampaigns(snap.docs.map(d => ({ ...d.data(), id: d.id } as Campaign)));
    setLoading(false);
  };

  useEffect(() => { loadCampaigns(); }, [user]);

  const handleCreate = async (data: Omit<Campaign, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    await addDoc(collection(db, 'campaigns'), { ...data, userId: user.uid, createdAt: serverTimestamp() });
    setShowModal(false);
    loadCampaigns();
  };

  const handleStatusChange = async (id: string, status: CampaignStatus) => {
    await updateDoc(doc(db, 'campaigns', id), { status });
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'campaigns', id));
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  const filtered = filter === 'all' ? campaigns : campaigns.filter(c => c.status === filter);

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2.5px solid rgba(59,110,255,0.15)', borderTopColor: '#3B6EFF', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Carregando campanhas...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div style={{ marginBottom: 24 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 5 }}>
                <span style={{ background: 'linear-gradient(90deg, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Campanhas</span>
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                {campaigns.filter(c => c.status === 'active').length} ativa{campaigns.filter(c => c.status === 'active').length !== 1 ? 's' : ''} · {campaigns.length} no total
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(135deg, #3B6EFF, #1A5CFF)', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,110,255,0.35)' }}
            >
              <Plus size={15} /> Nova Campanha
            </button>
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
          {[
            { label: 'Ativas',      value: campaigns.filter(c => c.status === 'active').length,   color: '#10D97A', bg: 'rgba(16,217,122,0.09)',  icon: TrendingUp },
            { label: 'Planejadas',  value: campaigns.filter(c => c.status === 'planned').length,  color: '#94A3B8', bg: 'rgba(148,163,184,0.08)', icon: Calendar },
            { label: 'Pausadas',    value: campaigns.filter(c => c.status === 'paused').length,   color: '#FFD84D', bg: 'rgba(255,216,77,0.08)',  icon: Target },
            { label: 'Finalizadas', value: campaigns.filter(c => c.status === 'finished').length, color: '#3B6EFF', bg: 'rgba(59,110,255,0.09)',  icon: Megaphone },
          ].map((s, i) => (
            <motion.div key={s.label} className="glass-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <s.icon size={17} style={{ color: s.color }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
          {statusFilters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{ padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 150ms', ...(filter === f.value ? { background: 'linear-gradient(135deg, #3B6EFF, #1A5CFF)', color: '#fff' } : { background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '0.5px solid rgba(255,255,255,0.10)' }) }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <motion.div className="glass-card" style={{ padding: 60, textAlign: 'center' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Megaphone size={40} style={{ color: 'var(--text-tertiary)', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              {campaigns.length === 0 ? 'Nenhuma campanha criada' : 'Nenhuma campanha para este filtro'}
            </p>
            <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginBottom: 16 }}>
              {campaigns.length === 0 ? 'Crie sua primeira campanha para organizar suas ações de marketing.' : 'Tente outro filtro de status.'}
            </p>
            {campaigns.length === 0 && (
              <button onClick={() => setShowModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #3B6EFF, #1A5CFF)', color: '#fff', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer' }}>
                <Plus size={13} /> Nova Campanha
              </button>
            )}
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {filtered.map((campaign, i) => {
              const s = statusConfig[campaign.status];
              return (
                <motion.div
                  key={campaign.id}
                  className="glass-card"
                  style={{ padding: 20 }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.3 }}>{campaign.name}</h3>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: s.bg, color: s.color, border: `0.5px solid ${s.border}` }}>{s.label}</span>
                        {campaign.channel && (
                          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(59,110,255,0.08)', color: '#7EB8FF', border: '0.5px solid rgba(59,110,255,0.15)' }}>{campaign.channel}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(139,92,246,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Megaphone size={15} style={{ color: '#8B5CF6' }} />
                      </div>
                    </div>
                  </div>

                  {campaign.objective && (
                    <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginBottom: 12, lineHeight: 1.5 }}>{campaign.objective}</p>
                  )}

                  {(campaign.startDate || campaign.endDate) && (
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 14, fontSize: 11, color: 'var(--text-tertiary)' }}>
                      <Calendar size={10} />
                      <span>{campaign.startDate || '—'} → {campaign.endDate || '—'}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '0.5px solid rgba(255,255,255,0.06)', alignItems: 'center' }}>
                    <select
                      value={campaign.status}
                      onChange={e => campaign.id && handleStatusChange(campaign.id, e.target.value as CampaignStatus)}
                      onClick={e => e.stopPropagation()}
                      style={{ flex: 1, height: 30, padding: '0 8px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.10)', color: 'var(--text-secondary)', fontSize: 12, outline: 'none', cursor: 'pointer' }}
                    >
                      {(Object.keys(statusConfig) as CampaignStatus[]).map(st => (
                        <option key={st} value={st} style={{ background: '#020818' }}>{statusConfig[st].label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => campaign.id && handleDelete(campaign.id)}
                      style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,71,87,0.08)', border: '0.5px solid rgba(255,71,87,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FF4757', flexShrink: 0 }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && <NewCampaignModal onClose={() => setShowModal(false)} onSave={handleCreate} />}
    </Layout>
  );
}
