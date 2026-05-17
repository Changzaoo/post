import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import {
  retentionMetrics, topContents, retentionSuggestions,
  weeklyRetentionData, trafficSources,
} from '../data/retentionData';
import { TrendingUp, TrendingDown, Zap, Clock, Share2, Bookmark } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const impactColors = { high: '#FF4757', medium: '#FFD84D', low: '#10D97A' };
const impactLabels = { high: 'Alto Impacto', medium: 'Médio Impacto', low: 'Baixo Impacto' };

export function RetentionPage() {
  return (
    <Layout>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <motion.div style={{ marginBottom: 24 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 5 }}>
            <span style={{ background: 'linear-gradient(90deg, #7EB8FF, #20F5D8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Retenção de Público</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Entenda como seu público consome, volta e compartilha seu conteúdo</p>
        </motion.div>

        {/* Metrics grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
          {retentionMetrics.map((m, i) => (
            <motion.div key={m.label} className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <div className="stat-icon" style={{ background: `${m.color}12` }}>
                {m.trend === 'up' ? <TrendingUp size={18} style={{ color: m.color }} /> : <TrendingDown size={18} style={{ color: m.color }} />}
              </div>
              <div>
                <div className="stat-label">{m.label}</div>
                <div className="stat-value" style={{ fontSize: 20 }}>{m.value}{m.unit}</div>
                <div className="stat-trend" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: m.trend === 'up' ? '#10D97A' : '#FF4757', fontWeight: 700, fontSize: 11 }}>
                    {m.change > 0 ? '+' : ''}{m.change}%
                  </span>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>{m.description}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }}>
          {/* Weekly retention chart */}
          <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="card-header"><span className="card-title">Retenção Semanal</span></div>
            <div className="card-content">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={weeklyRetentionData}>
                  <defs>
                    <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B6EFF" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3B6EFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,110,255,0.07)" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'rgba(140,170,220,0.50)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgba(140,170,220,0.50)' }} axisLine={false} tickLine={false} domain={[50, 80]} />
                  <Tooltip contentStyle={{ background: 'rgba(4,12,40,0.95)', border: '0.5px solid rgba(59,110,255,0.25)', borderRadius: 10, fontSize: 12 }} />
                  <Area type="monotone" dataKey="retention" name="Retenção %" stroke="#3B6EFF" strokeWidth={2.5} fill="url(#retGrad)" dot={{ fill: '#3B6EFF', r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Traffic sources */}
          <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="card-header"><span className="card-title">Origem do Tráfego</span></div>
            <div className="card-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <PieChart width={140} height={140}>
                <Pie data={trafficSources} cx={65} cy={65} innerRadius={40} outerRadius={62} dataKey="percentage" paddingAngle={3}>
                  {trafficSources.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {trafficSources.map((s) => (
                  <div key={s.source} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{s.source}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 60, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${s.percentage}%`, background: s.color, borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', minWidth: 30, textAlign: 'right' }}>{s.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Top contents */}
        <motion.div className="card" style={{ marginBottom: 20 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <div className="card-header"><span className="card-title">Conteúdos com Maior Retenção</span></div>
          <div className="card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {topContents.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < topContents.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,110,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 700, color: '#3B6EFF' }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{c.type} • {c.platform}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', color: '#20F5D8', fontSize: 12, fontWeight: 700 }}><Bookmark size={11} />{c.saves.toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>salvos</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', color: '#8B5CF6', fontSize: 12, fontWeight: 700 }}><Share2 size={11} />{c.shares.toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>compartilhados</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#10D97A' }}>{c.retentionRate}%</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>retenção</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Suggestions */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.015em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={18} style={{ color: '#FFD84D' }} />
            Sugestões para Melhorar Retenção
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {retentionSuggestions.map((s, i) => (
              <motion.div
                key={s.id}
                className="glass-card"
                style={{ padding: 18 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.05 }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.4 }}>{s.title}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: `${impactColors[s.impact]}14`, color: impactColors[s.impact], border: `0.5px solid ${impactColors[s.impact]}28` }}>
                        {impactLabels[s.impact]}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', color: 'var(--text-tertiary)', border: '0.5px solid var(--border)' }}>
                        {s.category}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, marginLeft: 8 }}>
                    <Clock size={10} style={{ color: 'var(--text-tertiary)' }} />
                    <span style={{ fontSize: 10, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{s.timeToImplement}</span>
                  </div>
                </div>
                <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>{s.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
