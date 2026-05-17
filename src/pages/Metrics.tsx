import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import { Eye, ThumbsUp, MessageSquare, Share2, TrendingUp, Users, BarChart3, ChevronRight } from 'lucide-react';

const PLATFORM_DEMO = [
  { name: 'Telegram', color: '#0088cc', views: 1240, likes: 89, comments: 34, shares: 56 },
  { name: 'Discord',  color: '#5865f2', views: 890,  likes: 67, comments: 28, shares: 12 },
  { name: 'Instagram',color: '#e1306c', views: 0,    likes: 0,  comments: 0,  shares: 0 },
  { name: 'TikTok',   color: '#ff0050', views: 0,    likes: 0,  comments: 0,  shares: 0 },
  { name: 'X',        color: '#1da1f2', views: 0,    likes: 0,  comments: 0,  shares: 0 },
];

const TOP_POSTS = [
  { text: 'Lançamos uma nova funcionalidade incrível no Post Alpha!', platform: 'Telegram', views: 840, likes: 62, date: '16/05/2026' },
  { text: 'Dicas para crescer nas redes sociais em 2026...', platform: 'Discord', views: 620, likes: 45, date: '15/05/2026' },
  { text: 'O futuro do marketing de conteúdo é a automação...', platform: 'Telegram', views: 400, likes: 27, date: '14/05/2026' },
];

export function Metrics() {
  const totalViews    = PLATFORM_DEMO.reduce((s, p) => s + p.views, 0);
  const totalLikes    = PLATFORM_DEMO.reduce((s, p) => s + p.likes, 0);
  const totalComments = PLATFORM_DEMO.reduce((s, p) => s + p.comments, 0);
  const totalShares   = PLATFORM_DEMO.reduce((s, p) => s + p.shares, 0);

  const summaryCards = [
    { label: 'Visualizações', value: totalViews.toLocaleString('pt-BR'), icon: Eye,           color: '#3B6EFF', bg: 'rgba(59,110,255,0.10)' },
    { label: 'Curtidas',      value: totalLikes.toLocaleString('pt-BR'), icon: ThumbsUp,      color: '#20F5D8', bg: 'rgba(32,245,216,0.09)' },
    { label: 'Comentários',   value: totalComments.toLocaleString('pt-BR'), icon: MessageSquare, color: '#FFD84D', bg: 'rgba(255,216,77,0.09)' },
    { label: 'Compartilhar',  value: totalShares.toLocaleString('pt-BR'), icon: Share2,       color: '#8B5CF6', bg: 'rgba(139,92,246,0.09)' },
    { label: 'Engajamento',   value: '—', icon: TrendingUp,  color: '#10D97A', bg: 'rgba(16,217,122,0.09)' },
    { label: 'Seguidores',    value: '—', icon: Users,       color: '#FF4757', bg: 'rgba(255,71,87,0.09)' },
  ];

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <motion.div style={{ marginBottom: 24 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 5 }}>
            <span style={{ background: 'linear-gradient(90deg, #7EB8FF, #20F5D8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Métricas
            </span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Acompanhe o desempenho das suas publicações</p>
        </motion.div>

        {/* Demo notice */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14, marginBottom: 20, background: 'rgba(59,110,255,0.06)', border: '0.5px solid rgba(59,110,255,0.18)' }}
        >
          <BarChart3 size={15} style={{ color: '#7EB8FF', flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Dados demo</span> — Conecte suas plataformas em{' '}
            <a href="/settings" style={{ color: '#7EB8FF', fontWeight: 500 }}>Configurações</a> para ver métricas reais.
          </p>
        </motion.div>

        {/* Summary cards */}
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
          {/* Platform breakdown */}
          <motion.div className="glass-card" style={{ padding: 20 }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, letterSpacing: '-0.01em' }}>Por Plataforma</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {PLATFORM_DEMO.map((p) => {
                const maxViews = Math.max(...PLATFORM_DEMO.map((x) => x.views), 1);
                const pct = p.views > 0 ? (p.views / maxViews) * 100 : 0;
                return (
                  <div key={p.name}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' }}>{p.name}</span>
                      <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--text-tertiary)' }}>
                        <span>{p.views.toLocaleString('pt-BR')} views</span>
                        <span>{p.likes} likes</span>
                      </div>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: p.color, borderRadius: 3, transition: 'width 0.6s ease' }} />
                    </div>
                    {p.views === 0 && (
                      <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Configure a API para ver dados reais</p>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Top posts */}
          <motion.div className="glass-card" style={{ padding: 20 }} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, letterSpacing: '-0.01em' }}>Top Publicações</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TOP_POSTS.map((post, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', alignItems: 'flex-start' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(59,110,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, fontWeight: 800, color: '#3B6EFF' }}>
                    #{i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.text}</p>
                    <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--text-tertiary)' }}>
                      <span>{post.platform}</span>
                      <span>·</span>
                      <span>{post.views} views</span>
                      <span>·</span>
                      <span>{post.likes} likes</span>
                    </div>
                  </div>
                  <ChevronRight size={12} style={{ color: 'var(--text-tertiary)', flexShrink: 0, marginTop: 4 }} />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
