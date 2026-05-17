import { useState } from 'react';
import { Layout } from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { strategies } from '../data/strategyData';
import type { Strategy } from '../data/strategyData';
import { X, Target, Clock, ChevronRight, CheckSquare, AlertTriangle, BarChart3, Users } from 'lucide-react';

const difficultyColor: Record<string, string> = {
  'Iniciante': '#10D97A',
  'Intermediário': '#FFD84D',
  'Avançado': '#FF4757',
};

function StrategyModal({ strategy, onClose }: { strategy: Strategy; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          style={{ position: 'absolute', inset: 0, background: 'rgba(2,8,24,0.80)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Modal */}
        <motion.div
          style={{
            position: 'relative', zIndex: 1,
            width: '100%', maxWidth: 680,
            maxHeight: '90vh', overflowY: 'auto',
            background: 'rgba(4,12,40,0.97)',
            backdropFilter: 'blur(40px)',
            border: '0.5px solid rgba(59,110,255,0.25)',
            borderRadius: 22,
            boxShadow: '0 40px 120px rgba(0,0,40,0.80), 0 0 0 0.5px rgba(59,110,255,0.10)',
          }}
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Top gradient line */}
          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(59,110,255,0.50), rgba(32,245,216,0.30), transparent)' }} />

          {/* Header */}
          <div style={{ padding: '24px 28px 20px', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 36, lineHeight: 1 }}>{strategy.icon}</span>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 6 }}>{strategy.title}</h2>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: `${difficultyColor[strategy.difficulty]}14`, color: difficultyColor[strategy.difficulty], border: `0.5px solid ${difficultyColor[strategy.difficulty]}28` }}>
                      {strategy.difficulty}
                    </span>
                    <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', color: 'var(--text-tertiary)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={9} />{strategy.timeToResult}
                    </span>
                    <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: 'rgba(59,110,255,0.10)', color: '#7EB8FF', border: '0.5px solid rgba(59,110,255,0.20)' }}>
                      {strategy.category}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', flexShrink: 0, transition: 'all 200ms' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,71,87,0.10)'; (e.currentTarget as HTMLButtonElement).style.color = '#FF6B7A'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}>
                <X size={15} />
              </button>
            </div>
          </div>

          <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Objective + Audience */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ padding: 16, borderRadius: 14, background: 'rgba(59,110,255,0.06)', border: '0.5px solid rgba(59,110,255,0.14)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Target size={10} />Objetivo
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{strategy.objective}</p>
              </div>
              <div style={{ padding: 16, borderRadius: 14, background: 'rgba(32,245,216,0.05)', border: '0.5px solid rgba(32,245,216,0.12)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Users size={10} />Público Ideal
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{strategy.idealAudience}</p>
              </div>
            </div>

            {/* Funnel steps */}
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.01em' }}>Etapas do Funil</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {strategy.steps.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ width: 24, height: 24, borderRadius: 8, background: 'rgba(59,110,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, fontWeight: 800, color: '#3B6EFF' }}>{i + 1}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#7EB8FF', marginBottom: 3 }}>{step.stage}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 3 }}>{step.action}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>{step.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div style={{ padding: '14px 16px', borderRadius: 14, background: 'linear-gradient(90deg, rgba(59,110,255,0.10), rgba(32,245,216,0.05))', border: '0.5px solid rgba(59,110,255,0.20)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>CTA Principal Sugerido</div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>"{strategy.idealCTA}"</p>
            </div>

            {/* Metrics + Mistakes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BarChart3 size={13} style={{ color: '#20F5D8' }} />Métricas
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {strategy.metrics.map((m, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                      <ChevronRight size={13} style={{ color: '#20F5D8', flexShrink: 0, marginTop: 2 }} />
                      {m}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={13} style={{ color: '#FFD84D' }} />Erros Comuns
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {strategy.commonMistakes.map((m, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                      <span style={{ color: '#FF4757', flexShrink: 0 }}>✗</span>
                      {m}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckSquare size={13} style={{ color: '#10D97A' }} />Checklist de Execução
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {strategy.checklist.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12.5, color: 'var(--text-secondary)', padding: '8px 12px', borderRadius: 10, background: 'rgba(16,217,122,0.05)', border: '0.5px solid rgba(16,217,122,0.12)' }}>
                    <CheckSquare size={13} style={{ color: '#10D97A', flexShrink: 0, marginTop: 2 }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function StrategiesPage() {
  const [selected, setSelected] = useState<Strategy | null>(null);
  const [filter, setFilter] = useState('Todos');

  const categories = ['Todos', ...Array.from(new Set(strategies.map(s => s.category)))];
  const filtered = filter === 'Todos' ? strategies : strategies.filter(s => s.category === filter);

  return (
    <Layout>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <motion.div style={{ marginBottom: 24 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 5 }}>
                <span style={{ background: 'linear-gradient(90deg, #FFD84D, #FF9F0A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Biblioteca de Estratégias</span>
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Estratégias prontas para crescimento, conversão e retenção</p>
            </div>
            {/* Category filters */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`btn btn-sm ${filter === cat ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Strategy cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {filtered.map((strategy, i) => (
            <motion.div
              key={strategy.id}
              className="glass-card"
              style={{ padding: 22, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              onClick={() => setSelected(strategy)}
            >
              {/* Background gradient accent */}
              <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderRadius: '50%', background: strategy.gradient, opacity: 0.06, filter: 'blur(20px)', pointerEvents: 'none' }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontSize: 32, lineHeight: 1 }}>{strategy.icon}</div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: `${difficultyColor[strategy.difficulty]}12`, color: difficultyColor[strategy.difficulty], border: `0.5px solid ${difficultyColor[strategy.difficulty]}25` }}>
                    {strategy.difficulty}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={9} />{strategy.timeToResult}
                  </span>
                </div>
              </div>

              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.015em', marginBottom: 6 }}>{strategy.title}</h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)', lineHeight: 1.5, marginBottom: 16 }}>{strategy.objective}</p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: 'rgba(59,110,255,0.08)', color: '#7EB8FF', border: '0.5px solid rgba(59,110,255,0.16)' }}>
                  {strategy.category}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: strategy.color.startsWith('#') ? strategy.color : '#3B6EFF', fontWeight: 600 }}>
                  Ver estratégia <ChevronRight size={13} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selected && <StrategyModal strategy={selected} onClose={() => setSelected(null)} />}
    </Layout>
  );
}
