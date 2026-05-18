import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Send, Zap, Image, CheckCircle, ArrowDown, TrendingUp } from 'lucide-react';
import type { PublishedPost } from '../types';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';

interface FunnelStage {
  id: string;
  name: string;
  description: string;
  count: number;
  color: string;
  icon: React.ElementType;
}

export function FunnelPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PublishedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'cards' | 'chart'>('cards');

  useEffect(() => {
    if (!user) return;
    getDocs(
      query(collection(db, 'publishedPosts'), where('userId', '==', user.uid))
    ).then(snap => {
      setPosts(snap.docs.map(d => {
        const data = d.data();
        return { ...data, id: d.id, createdAt: data.createdAt?.toDate?.() ?? new Date() } as PublishedPost;
      }));
    }).finally(() => setLoading(false));
  }, [user]);

  const total = posts.length;
  const withAdaptation = posts.filter(p => p.adaptedContent !== null).length;
  const withMedia = posts.filter(p => p.mediaUrl !== null).length;
  const publishedOk = posts.filter(p =>
    Object.values(p.results ?? {}).some(r => r.status === 'published')
  ).length;

  const stages: FunnelStage[] = [
    { id: 'created',   name: 'Posts Criados',         description: 'Total de publicações iniciadas no Compositor', count: total,          color: '#3B6EFF', icon: Send },
    { id: 'adapted',   name: 'Adaptados com IA',      description: 'Posts com conteúdo adaptado para cada plataforma', count: withAdaptation, color: '#20F5D8', icon: Zap },
    { id: 'media',     name: 'Com Mídia Anexada',      description: 'Posts enviados com imagem ou vídeo', count: withMedia,       color: '#8B5CF6', icon: Image },
    { id: 'published', name: 'Publicados com Sucesso', description: 'Posts confirmados como publicados em ao menos uma plataforma', count: publishedOk,     color: '#10D97A', icon: CheckCircle },
  ];

  const chartData = stages.map(s => ({ stage: s.name.split(' ')[0], value: s.count, fill: s.color }));

  const conversionRate = total > 0 ? Math.round((publishedOk / total) * 100) : 0;
  const adaptationRate = total > 0 ? Math.round((withAdaptation / total) * 100) : 0;

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2.5px solid rgba(59,110,255,0.15)', borderTopColor: '#3B6EFF', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Carregando funil...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <motion.div style={{ marginBottom: 24 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 5 }}>
                <span style={{ background: 'linear-gradient(90deg, #7EB8FF, #20F5D8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Funil de Publicação</span>
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Acompanhe cada etapa do seu fluxo de publicação</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['cards', 'chart'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{ padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 150ms', ...(view === v ? { background: 'linear-gradient(135deg, #3B6EFF, #1A5CFF)', color: '#fff' } : { background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '0.5px solid rgba(255,255,255,0.10)' }) }}
                >
                  {v === 'cards' ? 'Etapas' : 'Gráfico'}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total de Posts', value: total, color: '#3B6EFF', bg: 'rgba(59,110,255,0.10)' },
            { label: 'Taxa de Publicação', value: `${conversionRate}%`, color: '#10D97A', bg: 'rgba(16,217,122,0.09)' },
            { label: 'Taxa de Adaptação IA', value: `${adaptationRate}%`, color: '#20F5D8', bg: 'rgba(32,245,216,0.09)' },
          ].map((m, i) => (
            <motion.div key={m.label} className="glass-card" style={{ padding: 18, textAlign: 'center' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: m.color, letterSpacing: '-0.03em', marginBottom: 4 }}>{m.value}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</div>
            </motion.div>
          ))}
        </div>

        {total === 0 ? (
          <motion.div className="glass-card" style={{ padding: 48, textAlign: 'center' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <TrendingUp size={40} style={{ color: 'var(--text-tertiary)', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Nenhum post no funil ainda</p>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
              Crie seu primeiro post no <a href="/composer" style={{ color: '#7EB8FF' }}>Compositor</a> para ver o funil de publicação.
            </p>
          </motion.div>
        ) : view === 'chart' ? (
          <motion.div className="glass-card" style={{ padding: 20 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Funil de Conversão</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,110,255,0.07)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'rgba(140,170,220,0.50)' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="stage" tick={{ fontSize: 12, fill: 'rgba(180,200,240,0.70)' }} axisLine={false} tickLine={false} width={70} />
                <Tooltip
                  contentStyle={{ background: 'rgba(4,12,40,0.95)', border: '0.5px solid rgba(59,110,255,0.25)', borderRadius: 10, fontSize: 12 }}
                  labelStyle={{ color: 'rgba(247,251,255,0.80)', fontWeight: 600 }}
                  itemStyle={{ color: 'rgba(140,170,220,0.70)' }}
                  formatter={(v) => [`${v} posts`, '']}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Posts">
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stages.map((stage, i) => {
              const Icon = stage.icon;
              const pct = total > 0 ? Math.round((stage.count / total) * 100) : 0;
              const nextCount = stages[i + 1]?.count ?? null;
              const dropRate = nextCount !== null && stage.count > 0
                ? Math.round(((stage.count - nextCount) / stage.count) * 100)
                : null;

              return (
                <motion.div key={stage.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                  <div style={{ padding: '18px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: `0.5px solid ${stage.color}22` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: `${stage.color}14`, border: `0.5px solid ${stage.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={20} style={{ color: stage.color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{stage.name}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: `${stage.color}14`, color: stage.color, border: `0.5px solid ${stage.color}28` }}>
                            {stage.count} post{stage.count !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>{stage.description}</p>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: stage.color, borderRadius: 3, transition: 'width 0.6s ease' }} />
                          </div>
                          <span style={{ fontSize: 11, color: stage.color, fontWeight: 600, flexShrink: 0 }}>{pct}% do total</span>
                          {dropRate !== null && (
                            <span style={{ fontSize: 11, color: '#FF4757', fontWeight: 600, flexShrink: 0 }}>−{dropRate}% não avança</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {i < stages.length - 1 && (
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
