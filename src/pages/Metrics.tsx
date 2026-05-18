import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BarChart3, Send, CheckCircle, XCircle, Clock, Activity } from 'lucide-react';
import type { PublishedPost } from '../types';

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#e1306c', tiktok: '#ff0050', x: '#1da1f2',
  telegram: '#0088cc', discord: '#5865f2', youtube: '#ff0000',
  linkedin: '#0077b5', facebook: '#1877f2',
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram', tiktok: 'TikTok', x: 'X (Twitter)',
  telegram: 'Telegram', discord: 'Discord', youtube: 'YouTube',
  linkedin: 'LinkedIn', facebook: 'Facebook',
};

export function Metrics() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PublishedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getDocs(
      query(
        collection(db, 'publishedPosts'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
      )
    ).then(snap => {
      setPosts(snap.docs.map(d => {
        const data = d.data();
        return { ...data, id: d.id, createdAt: data.createdAt?.toDate?.() ?? new Date() } as PublishedPost;
      }));
    }).finally(() => setLoading(false));
  }, [user]);

  const totalPosts = posts.length;

  const allResults = posts.flatMap(p => Object.values(p.results ?? {}));
  const publishedOk = allResults.filter(r => r.status === 'published').length;
  const publishedMocked = allResults.filter(r => r.status === 'mocked').length;
  const publishedError = allResults.filter(r => r.status === 'error').length;
  const totalAttempts = allResults.length;
  const successRate = totalAttempts > 0 ? Math.round((publishedOk / totalAttempts) * 100) : 0;

  const platformCounts: Record<string, number> = {};
  posts.forEach(p => {
    (p.selectedPlatforms ?? []).forEach(pl => {
      platformCounts[pl] = (platformCounts[pl] ?? 0) + 1;
    });
  });
  const platformEntries = Object.entries(platformCounts).sort((a, b) => b[1] - a[1]);
  const maxCount = platformEntries[0]?.[1] ?? 1;

  const summaryCards = [
    { label: 'Total de Posts', value: totalPosts, icon: Send, color: '#3B6EFF', bg: 'rgba(59,110,255,0.10)' },
    { label: 'Publicados', value: publishedOk, icon: CheckCircle, color: '#10D97A', bg: 'rgba(16,217,122,0.09)' },
    { label: 'Taxa de Sucesso', value: `${successRate}%`, icon: Activity, color: '#20F5D8', bg: 'rgba(32,245,216,0.09)' },
    { label: 'Pendentes/Demo', value: publishedMocked, icon: Clock, color: '#FFD84D', bg: 'rgba(255,216,77,0.09)' },
    { label: 'Com Erro', value: publishedError, icon: XCircle, color: '#FF4757', bg: 'rgba(255,71,87,0.09)' },
    { label: 'Plataformas', value: platformEntries.length, icon: BarChart3, color: '#8B5CF6', bg: 'rgba(139,92,246,0.09)' },
  ];

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2.5px solid rgba(59,110,255,0.15)', borderTopColor: '#3B6EFF', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Carregando métricas...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <motion.div style={{ marginBottom: 24 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 5 }}>
            <span style={{ background: 'linear-gradient(90deg, #7EB8FF, #20F5D8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Métricas
            </span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Desempenho real das suas publicações</p>
        </motion.div>

        {totalPosts === 0 ? (
          <motion.div
            className="glass-card"
            style={{ padding: 48, textAlign: 'center' }}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          >
            <BarChart3 size={40} style={{ color: 'var(--text-tertiary)', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Nenhuma publicação ainda</p>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Crie seu primeiro post no <a href="/composer" style={{ color: '#7EB8FF' }}>Compositor</a> para ver métricas aqui.</p>
          </motion.div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12, marginBottom: 24 }}>
              {summaryCards.map((c, i) => (
                <motion.div key={c.label} className="glass-card" style={{ padding: 16, textAlign: 'center' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <c.icon size={16} style={{ color: c.color }} />
                  </div>
                  <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{c.value}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 }}>{c.label}</p>
                </motion.div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <motion.div className="glass-card" style={{ padding: 20 }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, letterSpacing: '-0.01em' }}>Posts por Plataforma</h3>
                {platformEntries.length === 0 ? (
                  <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)' }}>Nenhuma plataforma utilizada ainda.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {platformEntries.map(([pl, count]) => {
                      const color = PLATFORM_COLORS[pl] ?? '#8B5CF6';
                      const pct = (count / maxCount) * 100;
                      return (
                        <div key={pl}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' }}>{PLATFORM_LABELS[pl] ?? pl}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{count} post{count !== 1 ? 's' : ''}</span>
                          </div>
                          <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              <motion.div className="glass-card" style={{ padding: 20 }} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, letterSpacing: '-0.01em' }}>Publicações Recentes</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {posts.slice(0, 5).map((post, i) => {
                    const ok = Object.values(post.results ?? {}).filter(r => r.status === 'published').length;
                    const total = Object.values(post.results ?? {}).length;
                    return (
                      <div key={post.id ?? i} style={{ display: 'flex', gap: 12, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', alignItems: 'flex-start' }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(59,110,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, fontWeight: 800, color: '#3B6EFF' }}>
                          #{i + 1}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {post.baseText?.slice(0, 60) ?? '(sem texto)'}
                          </p>
                          <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--text-tertiary)' }}>
                            <span>{(post.selectedPlatforms ?? []).join(', ')}</span>
                            <span>·</span>
                            <span style={{ color: ok > 0 ? '#10D97A' : '#FF4757' }}>{ok}/{total} publicados</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
