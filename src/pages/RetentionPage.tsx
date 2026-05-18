import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TrendingUp, Calendar, Zap, Activity } from 'lucide-react';
import type { PublishedPost } from '../types';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

function getWeeklyData(posts: PublishedPost[]) {
  const now = new Date();
  return Array.from({ length: 8 }, (_, i) => {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (7 - i) * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const count = posts.filter(p => p.createdAt >= weekStart && p.createdAt < weekEnd).length;
    return { week: `S${i + 1}`, posts: count };
  });
}

function getLongestStreak(posts: PublishedPost[]): number {
  if (posts.length === 0) return 0;
  const days = new Set(posts.map(p => {
    const d = p.createdAt instanceof Date ? p.createdAt : new Date();
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }));
  const sorted = Array.from(days).sort();
  let longest = 1, current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) { current++; longest = Math.max(longest, current); }
    else current = 1;
  }
  return longest;
}

export function RetentionPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PublishedPost[]>([]);
  const [loading, setLoading] = useState(true);

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

  const weeklyData = getWeeklyData(posts);
  const totalPosts = posts.length;
  const avgPerWeek = weeklyData.length > 0
    ? (weeklyData.reduce((s, w) => s + w.posts, 0) / weeklyData.length).toFixed(1)
    : '0';
  const longestStreak = getLongestStreak(posts);
  const activeDays = new Set(posts.map(p => {
    const d = p.createdAt instanceof Date ? p.createdAt : new Date();
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  })).size;
  const publishedOk = posts.filter(p =>
    Object.values(p.results ?? {}).some(r => r.status === 'published')
  ).length;
  const successRate = totalPosts > 0 ? Math.round((publishedOk / totalPosts) * 100) : 0;

  const metricCards = [
    { label: 'Total de Posts', value: totalPosts, color: '#3B6EFF', bg: 'rgba(59,110,255,0.10)', icon: TrendingUp },
    { label: 'Média Semanal', value: avgPerWeek, color: '#20F5D8', bg: 'rgba(32,245,216,0.09)', icon: Activity },
    { label: 'Dias Ativos', value: activeDays, color: '#8B5CF6', bg: 'rgba(139,92,246,0.09)', icon: Calendar },
    { label: 'Sequência Máxima', value: `${longestStreak}d`, color: '#FFD84D', bg: 'rgba(255,216,77,0.09)', icon: Zap },
    { label: 'Taxa de Sucesso', value: `${successRate}%`, color: '#10D97A', bg: 'rgba(16,217,122,0.09)', icon: TrendingUp },
  ];

  const suggestions = [
    { title: 'Publique com consistência', description: 'Manter uma frequência regular de posts é o maior fator de retenção de audiência. Defina um calendário semanal.', impact: 'high' as const, category: 'Frequência' },
    { title: 'Use vídeos curtos', description: 'Posts com vídeo têm taxas de engajamento até 3× maiores. Experimente reels e shorts.', impact: 'high' as const, category: 'Formato' },
    { title: 'Adapte o conteúdo por plataforma', description: 'Conteúdo adaptado para cada plataforma gera mais alcance orgânico. Use a adaptação IA antes de publicar.', impact: 'medium' as const, category: 'Qualidade' },
    { title: 'Publique no horário de pico', description: 'Agende posts para o período de maior atividade do seu público (geralmente 18h–21h no fuso local).', impact: 'medium' as const, category: 'Timing' },
  ];

  const impactColor = { high: '#FF4757', medium: '#FFD84D', low: '#10D97A' };

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2.5px solid rgba(59,110,255,0.15)', borderTopColor: '#3B6EFF', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Carregando retenção...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <motion.div style={{ marginBottom: 24 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 5 }}>
            <span style={{ background: 'linear-gradient(90deg, #7EB8FF, #20F5D8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Retenção de Público</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Consistência de publicação e frequência ao longo do tempo</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
          {metricCards.map((m, i) => (
            <motion.div key={m.label} className="glass-card" style={{ padding: 16, textAlign: 'center' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <m.icon size={16} style={{ color: m.color }} />
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: m.color, letterSpacing: '-0.02em' }}>{m.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3, fontWeight: 600 }}>{m.label}</div>
            </motion.div>
          ))}
        </div>

        <motion.div className="glass-card" style={{ padding: 20, marginBottom: 20 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Posts por Semana (últimas 8 semanas)</h3>
          {totalPosts === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160 }}>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Publique posts para ver a frequência aqui.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B6EFF" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3B6EFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,110,255,0.07)" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'rgba(140,170,220,0.50)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'rgba(140,170,220,0.50)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(4,12,40,0.95)', border: '0.5px solid rgba(59,110,255,0.25)', borderRadius: 10, fontSize: 12 }}
                  formatter={(v) => [`${v} posts`, 'Posts']}
                />
                <Area type="monotone" dataKey="posts" name="Posts" stroke="#3B6EFF" strokeWidth={2.5} fill="url(#retGrad)" dot={{ fill: '#3B6EFF', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.015em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={17} style={{ color: '#FFD84D' }} />
            Dicas para Melhorar a Retenção
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {suggestions.map((s, i) => (
              <motion.div key={s.title} className="glass-card" style={{ padding: 18 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 + i * 0.05 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>{s.title}</div>
                  <div style={{ display: 'flex', gap: 5, flexShrink: 0, marginLeft: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: `${impactColor[s.impact]}14`, color: impactColor[s.impact], border: `0.5px solid ${impactColor[s.impact]}28` }}>
                      {s.impact === 'high' ? 'Alto' : s.impact === 'medium' ? 'Médio' : 'Baixo'}
                    </span>
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', color: 'var(--text-tertiary)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                      {s.category}
                    </span>
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
