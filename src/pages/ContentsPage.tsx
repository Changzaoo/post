import { useState } from 'react';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import { contents, statusContentConfig } from '../data/contentData';
import type { ContentFunnelStage, ContentStatus } from '../data/contentData';
import { FileText, Plus, Eye, TrendingUp, Bookmark, Filter } from 'lucide-react';

const stageFilters: Array<{ value: 'all' | ContentFunnelStage; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'Visitante', label: 'Visitante' },
  { value: 'Lead', label: 'Lead' },
  { value: 'Engajado', label: 'Engajado' },
  { value: 'Interessado', label: 'Interessado' },
  { value: 'Oferta', label: 'Oferta' },
  { value: 'Pós-Venda', label: 'Pós-Venda' },
];

const stageColors: Record<ContentFunnelStage, string> = {
  'Visitante': '#3B6EFF',
  'Lead': '#20F5D8',
  'Engajado': '#8B5CF6',
  'Interessado': '#FFD84D',
  'Oferta': '#FF9F0A',
  'Pós-Venda': '#10D97A',
};

export function ContentsPage() {
  const [stageFilter, setStageFilter] = useState<'all' | ContentFunnelStage>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ContentStatus>('all');

  const filtered = contents.filter(c => {
    const stageOk = stageFilter === 'all' || c.funnelStage === stageFilter;
    const statusOk = statusFilter === 'all' || c.status === statusFilter;
    return stageOk && statusOk;
  });

  return (
    <Layout>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <motion.div style={{ marginBottom: 24 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 5 }}>
                <span style={{ background: 'linear-gradient(90deg, #20F5D8, #3B6EFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Conteúdos</span>
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Organize e analise conteúdos por etapa do funil</p>
            </div>
            <button className="btn btn-primary btn-md" style={{ gap: 7 }}>
              <Plus size={15} />
              Novo Conteúdo
            </button>
          </div>
        </motion.div>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
          {[
            { label: 'Total', value: contents.length, color: '#3B6EFF', bg: 'rgba(59,110,255,0.09)', icon: FileText },
            { label: 'Publicados', value: contents.filter(c => c.status === 'published').length, color: '#10D97A', bg: 'rgba(16,217,122,0.08)', icon: Eye },
            { label: 'Retenção Média', value: `${Math.round(contents.filter(c => c.retentionRate > 0).reduce((a, c) => a + c.retentionRate, 0) / contents.filter(c => c.retentionRate > 0).length)}%`, color: '#20F5D8', bg: 'rgba(32,245,216,0.08)', icon: Bookmark },
            { label: 'Conversão Média', value: `${Math.round(contents.filter(c => c.conversionRate > 0).reduce((a, c) => a + c.conversionRate, 0) / contents.filter(c => c.conversionRate > 0).length)}%`, color: '#FFD84D', bg: 'rgba(255,216,77,0.08)', icon: TrendingUp },
          ].map((s, i) => (
            <motion.div key={s.label} className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <div className="stat-icon" style={{ background: s.bg }}><s.icon size={18} style={{ color: s.color }} /></div>
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ fontSize: 22 }}>{s.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <Filter size={13} style={{ color: 'var(--text-tertiary)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, marginRight: 4 }}>ETAPA</span>
            {stageFilters.map(f => (
              <button key={f.value} onClick={() => setStageFilter(f.value)} className={`btn btn-sm ${stageFilter === f.value ? 'btn-primary' : 'btn-secondary'}`}>
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, marginRight: 4, marginLeft: 17 }}>STATUS</span>
            {(['all', 'published', 'scheduled', 'draft', 'optimizing'] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}>
                {s === 'all' ? 'Todos' : statusContentConfig[s as ContentStatus]?.label ?? s}
              </button>
            ))}
          </div>
        </div>

        {/* Content table */}
        <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid var(--border)' }}>
                  {['Conteúdo', 'Tipo', 'Plataforma', 'Etapa do Funil', 'Gancho', 'Retenção', 'Conversão', 'Status'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((content, i) => {
                  const sc = statusContentConfig[content.status];
                  const stageColor = stageColors[content.funnelStage];
                  return (
                    <motion.tr
                      key={content.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 150ms' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(59,110,255,0.04)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = ''; }}
                    >
                      <td style={{ padding: '13px 16px', maxWidth: 220 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{content.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{content.objective}</div>
                      </td>
                      <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 8, border: '0.5px solid var(--border)' }}>{content.type}</span>
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 12.5, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{content.platform}</td>
                      <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: `${stageColor}12`, color: stageColor, border: `0.5px solid ${stageColor}25` }}>{content.funnelStage}</span>
                      </td>
                      <td style={{ padding: '13px 16px', maxWidth: 180 }}>
                        <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{content.hook}</div>
                      </td>
                      <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                        {content.retentionRate > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${content.retentionRate}%`, background: '#3B6EFF', borderRadius: 2 }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{content.retentionRate}%</span>
                          </div>
                        ) : <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>—</span>}
                      </td>
                      <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                        {content.conversionRate > 0 ? (
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#10D97A' }}>{content.conversionRate}%</span>
                        ) : <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>—</span>}
                      </td>
                      <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: `${sc.bg}`, color: sc.color, border: '0.5px solid rgba(255,255,255,0.08)' }}>{sc.label}</span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
