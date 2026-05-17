import { useState } from 'react';
import { Layout } from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { campaigns, statusConfig } from '../data/campaignData';
import type { Campaign, CampaignStatus } from '../data/campaignData';
import { Megaphone, X, Plus, BarChart3, Users, Target, Calendar, TrendingUp, DollarSign } from 'lucide-react';

const statusFilters: Array<{ value: 'all' | CampaignStatus; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'active', label: 'Ativas' },
  { value: 'planned', label: 'Planejadas' },
  { value: 'optimizing', label: 'Otimizando' },
  { value: 'paused', label: 'Pausadas' },
  { value: 'finished', label: 'Finalizadas' },
];

function CampaignModal({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) {
  const s = statusConfig[campaign.status];
  return (
    <AnimatePresence>
      <motion.div
        style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <motion.div style={{ position: 'absolute', inset: 0, background: 'rgba(2,8,24,0.80)', backdropFilter: 'blur(8px)' }} onClick={onClose} />
        <motion.div
          style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 560, background: 'rgba(4,12,40,0.97)', backdropFilter: 'blur(40px)', border: '0.5px solid rgba(59,110,255,0.25)', borderRadius: 22, boxShadow: '0 40px 120px rgba(0,0,40,0.80)', overflow: 'hidden' }}
          initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
        >
          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(59,110,255,0.50), rgba(32,245,216,0.30), transparent)' }} />
          <div style={{ padding: '22px 26px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>{campaign.name}</h2>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color, border: `0.5px solid ${s.border}` }}>{s.label}</span>
              </div>
              <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={14} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
              {[
                { label: 'Objetivo', value: campaign.objective, icon: Target },
                { label: 'Público', value: campaign.audience, icon: Users },
                { label: 'Canal', value: campaign.channel, icon: Megaphone },
                { label: 'Etapa do Funil', value: campaign.funnelStage, icon: TrendingUp },
                { label: 'CTA Principal', value: campaign.mainCTA, icon: BarChart3 },
                { label: 'Métrica Principal', value: campaign.mainMetric, icon: BarChart3 },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon size={9} />{label}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { label: 'Início', value: campaign.startDate },
                { label: 'Fim', value: campaign.endDate },
              ].map(({ label, value }) => (
                <div key={label} style={{ flex: 1, padding: '10px 14px', borderRadius: 12, background: 'rgba(59,110,255,0.06)', border: '0.5px solid rgba(59,110,255,0.14)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={13} style={{ color: '#3B6EFF', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {campaign.results && (
              <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 14, background: 'rgba(16,217,122,0.05)', border: '0.5px solid rgba(16,217,122,0.15)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#10D97A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Resultados</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
                  {campaign.results.reach !== undefined && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{campaign.results.reach.toLocaleString('pt-BR')}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Alcance</div>
                    </div>
                  )}
                  {campaign.results.clicks !== undefined && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{campaign.results.clicks.toLocaleString('pt-BR')}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Cliques</div>
                    </div>
                  )}
                  {campaign.results.conversions !== undefined && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#10D97A' }}>{campaign.results.conversions}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Conversões</div>
                    </div>
                  )}
                  {campaign.results.revenue !== undefined && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#FFD84D' }}>R$ {campaign.results.revenue.toLocaleString('pt-BR')}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Receita</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function CampaignsPage() {
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [filter, setFilter] = useState<'all' | CampaignStatus>('all');

  const filtered = filter === 'all' ? campaigns : campaigns.filter(c => c.status === filter);
  const activeCampaigns = campaigns.filter(c => c.status === 'active');

  return (
    <Layout>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <motion.div style={{ marginBottom: 24 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 5 }}>
                <span style={{ background: 'linear-gradient(90deg, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Campanhas</span>
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{activeCampaigns.length} campanhas ativas · {campaigns.length} no total</p>
            </div>
            <button className="btn btn-primary btn-md" style={{ gap: 7 }}>
              <Plus size={15} />
              Nova Campanha
            </button>
          </div>
        </motion.div>

        {/* Summary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
          {[
            { label: 'Ativas', value: campaigns.filter(c => c.status === 'active').length, color: '#10D97A', bg: 'rgba(16,217,122,0.09)', icon: TrendingUp },
            { label: 'Planejadas', value: campaigns.filter(c => c.status === 'planned').length, color: '#94A3B8', bg: 'rgba(148,163,184,0.08)', icon: Calendar },
            { label: 'Otimizando', value: campaigns.filter(c => c.status === 'optimizing').length, color: '#20F5D8', bg: 'rgba(32,245,216,0.08)', icon: BarChart3 },
            { label: 'Receita Total', value: `R$ ${campaigns.reduce((acc, c) => acc + (c.results?.revenue ?? 0), 0).toLocaleString('pt-BR')}`, color: '#FFD84D', bg: 'rgba(255,216,77,0.08)', icon: DollarSign },
          ].map((s, i) => (
            <motion.div key={s.label} className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <div className="stat-icon" style={{ background: s.bg }}><s.icon size={18} style={{ color: s.color }} /></div>
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ fontSize: 20 }}>{s.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
          {statusFilters.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)} className={`btn btn-sm ${filter === f.value ? 'btn-primary' : 'btn-secondary'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Campaign cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {filtered.map((campaign, i) => {
            const s = statusConfig[campaign.status];
            return (
              <motion.div
                key={campaign.id}
                className="glass-card"
                style={{ padding: 20, cursor: 'pointer' }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                onClick={() => setSelected(campaign)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 5, lineHeight: 1.3 }}>{campaign.name}</h3>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: s.bg, color: s.color, border: `0.5px solid ${s.border}` }}>{s.label}</span>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(59,110,255,0.08)', color: '#7EB8FF', border: '0.5px solid rgba(59,110,255,0.15)' }}>{campaign.channel}</span>
                    </div>
                  </div>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(139,92,246,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Megaphone size={16} style={{ color: '#8B5CF6' }} />
                  </div>
                </div>

                <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginBottom: 14, lineHeight: 1.5 }}>{campaign.objective}</p>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Target size={10} />{campaign.funnelStage}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={10} />{campaign.startDate} → {campaign.endDate}
                  </span>
                </div>

                {campaign.results && (
                  <div style={{ display: 'flex', gap: 14, paddingTop: 14, borderTop: '0.5px solid var(--border)' }}>
                    {campaign.results.reach !== undefined && (
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{(campaign.results.reach / 1000).toFixed(0)}k</div>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Alcance</div>
                      </div>
                    )}
                    {campaign.results.conversions !== undefined && (
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#10D97A' }}>{campaign.results.conversions}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Conversões</div>
                      </div>
                    )}
                    {campaign.results.revenue !== undefined && (
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#FFD84D' }}>R$ {campaign.results.revenue.toLocaleString('pt-BR')}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Receita</div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {selected && <CampaignModal campaign={selected} onClose={() => setSelected(null)} />}
    </Layout>
  );
}
