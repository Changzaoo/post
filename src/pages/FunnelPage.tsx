import { useState } from 'react';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import { funnelStages, funnelMetrics, funnelChartData } from '../data/funnelData';
import {
  Eye, UserPlus, Zap, Star, ShoppingBag, CreditCard,
  CheckCircle, Heart, RefreshCw, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, Target, DollarSign, Users,
  ArrowDown,
} from 'lucide-react';
import {
  Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from 'recharts';

const iconMap: Record<string, React.ElementType> = {
  Eye, UserPlus, Zap, Star, ShoppingBag, CreditCard,
  CheckCircle, Heart, RefreshCw,
};

const metricCards = [
  { label: 'Visitantes', value: funnelMetrics.totalVisitors.toLocaleString('pt-BR'), icon: Eye, color: '#3B6EFF', bg: 'rgba(59,110,255,0.10)' },
  { label: 'Leads', value: funnelMetrics.totalLeads.toLocaleString('pt-BR'), icon: Users, color: '#20F5D8', bg: 'rgba(32,245,216,0.09)' },
  { label: 'Conversão', value: `${funnelMetrics.conversionRate}%`, icon: Target, color: '#10D97A', bg: 'rgba(16,217,122,0.09)' },
  { label: 'Receita Est.', value: `R$ ${(funnelMetrics.estimatedRevenue / 1000).toFixed(0)}k`, icon: DollarSign, color: '#FFD84D', bg: 'rgba(255,216,77,0.09)' },
];

export function FunnelPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [view, setView] = useState<'cards' | 'chart'>('cards');

  const toggle = (id: string) => setExpanded(prev => prev === id ? null : id);

  return (
    <Layout>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <motion.div style={{ marginBottom: 24 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 5 }}>
                <span style={{ background: 'linear-gradient(90deg, #7EB8FF, #20F5D8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Funil de Vendas</span>
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Veja onde seu público entra, onde abandona e onde compra</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['cards', 'chart'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`btn btn-sm ${view === v ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {v === 'cards' ? 'Etapas' : 'Gráfico'}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {metricCards.map((m, i) => (
            <motion.div key={m.label} className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <div className="stat-icon" style={{ background: m.bg }}>
                <m.icon size={20} style={{ color: m.color }} />
              </div>
              <div>
                <div className="stat-label">{m.label}</div>
                <div className="stat-value">{m.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {view === 'chart' ? (
          /* Chart view */
          <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="card-header"><span className="card-title">Funil de Conversão</span></div>
            <div className="card-content">
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={funnelChartData} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,110,255,0.07)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'rgba(140,170,220,0.50)' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="stage" tick={{ fontSize: 12, fill: 'rgba(180,200,240,0.70)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(4,12,40,0.95)', border: '0.5px solid rgba(59,110,255,0.25)', borderRadius: 10, fontSize: 12 }}
                    labelStyle={{ color: 'rgba(247,251,255,0.80)', fontWeight: 600 }}
                    itemStyle={{ color: 'rgba(140,170,220,0.70)' }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Pessoas">
                    {funnelChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ) : (
          /* Cards view */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {funnelStages.map((stage, i) => {
              const Icon = iconMap[stage.icon] ?? Eye;
              const isExpanded = expanded === stage.id;
              const nextStage = funnelStages[i + 1];

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  {/* Stage card */}
                  <div
                    className="funnel-step"
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggle(stage.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      {/* Icon */}
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                        background: `${stage.color}14`,
                        border: `0.5px solid ${stage.color}28`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon size={20} style={{ color: stage.color }} />
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{stage.name}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: `${stage.color}14`, color: stage.color, border: `0.5px solid ${stage.color}28` }}>
                            {stage.people.toLocaleString('pt-BR')} pessoas
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>{stage.description}</p>

                        {/* Progress bar */}
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${stage.advanceRate}%`, background: stage.color, borderRadius: 3, transition: 'width 0.6s ease' }} />
                          </div>
                          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                            <span style={{ fontSize: 11, color: '#10D97A', fontWeight: 600 }}>
                              <TrendingUp size={10} style={{ display: 'inline', marginRight: 3 }} />{stage.advanceRate}% avança
                            </span>
                            <span style={{ fontSize: 11, color: '#FF4757', fontWeight: 600 }}>
                              <TrendingDown size={10} style={{ display: 'inline', marginRight: 3 }} />{stage.dropRate}% sai
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expand toggle */}
                      <div style={{ flexShrink: 0, color: 'var(--text-tertiary)' }}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ marginTop: 16, paddingTop: 16, borderTop: '0.5px solid rgba(255,255,255,0.06)' }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Objetivo</div>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{stage.objective}</p>
                          </div>
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>CTA Recomendado</div>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{stage.recommendedCTA}</p>
                          </div>
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Ação Sugerida</div>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{stage.suggestedAction}</p>
                          </div>
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Conteúdo Ideal</div>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{stage.idealContent}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Arrow between stages */}
                  {nextStage && (
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '3px 0' }}>
                      <ArrowDown size={14} style={{ color: 'rgba(59,110,255,0.25)' }} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
