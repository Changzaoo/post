import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, Target, Zap, Send,
  Megaphone, ArrowRight,
  Sparkles, CheckSquare, ChevronRight,
  CheckCircle, XCircle, Clock, Activity,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import type { PublishedPost } from '../types';

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#e1306c', tiktok: '#ff0050', x: '#1da1f2',
  telegram: '#0088cc', discord: '#5865f2', youtube: '#ff0000',
  linkedin: '#0077b5', facebook: '#1877f2',
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram', tiktok: 'TikTok', x: 'X',
  telegram: 'Telegram', discord: 'Discord', youtube: 'YouTube',
  linkedin: 'LinkedIn', facebook: 'Facebook',
};

const quickActions = [
  { label: 'Ver Funil',    icon: TrendingUp,  to: '/funil',       color: '#3B6EFF', bg: 'rgba(59,110,255,0.10)',  border: 'rgba(59,110,255,0.20)' },
  { label: 'Retenção',    icon: Users,       to: '/retencao',    color: '#20F5D8', bg: 'rgba(32,245,216,0.08)',  border: 'rgba(32,245,216,0.18)' },
  { label: 'Estratégias', icon: Target,      to: '/estrategias', color: '#FFD84D', bg: 'rgba(255,216,77,0.08)',  border: 'rgba(255,216,77,0.18)' },
  { label: 'Sugestões IA',icon: Sparkles,    to: '/ia',          color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.18)' },
  { label: 'Campanhas',   icon: Megaphone,   to: '/campanhas',   color: '#10D97A', bg: 'rgba(16,217,122,0.08)', border: 'rgba(16,217,122,0.18)' },
  { label: 'Checklist',   icon: CheckSquare, to: '/checklist',   color: '#FF9F0A', bg: 'rgba(255,159,10,0.08)', border: 'rgba(255,159,10,0.18)' },
];

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

export function Dashboard() {
  const { user, userProfile } = useAuth();
  const [posts, setPosts] = useState<PublishedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const q = query(
          collection(db, 'publishedPosts'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(100)
        );
        const snap = await getDocs(q);
        const items = snap.docs.map(d => ({
          id: d.id, ...d.data(),
          createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
        })) as PublishedPost[];
        setPosts(items);
      } catch (err) { console.error('Dashboard load error:', err); }
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  // Real computed stats
  const totalPosts = posts.length;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const postsThisWeek = posts.filter(p => p.createdAt >= oneWeekAgo).length;

  const platformCounts: Record<string, number> = {};
  posts.forEach(p => p.selectedPlatforms.forEach(pl => {
    platformCounts[pl] = (platformCounts[pl] || 0) + 1;
  }));
  const uniquePlatforms = Object.keys(platformCounts).length;

  let publishedOk = 0, publishedMocked = 0, publishedError = 0;
  posts.forEach(p => Object.values(p.results || {}).forEach((r: any) => {
    if (r.status === 'published') publishedOk++;
    else if (r.status === 'mocked') publishedMocked++;
    else publishedError++;
  }));
  const totalAttempts = publishedOk + publishedMocked + publishedError;
  const successRate = totalAttempts > 0 ? Math.round((publishedOk / totalAttempts) * 100) : 0;

  const weeklyData = getWeeklyData(posts);
  const platformPieData = Object.entries(platformCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([name, value]) => ({ name, value, color: PLATFORM_COLORS[name] || '#888' }));

  const displayName = userProfile?.displayName ?? userProfile?.username ?? 'Criador';

  const statCards = [
    { label: 'Posts Criados',     value: totalPosts.toString(),                          icon: Send,          iconColor: '#3B6EFF', iconBg: 'rgba(59,110,255,0.12)', description: 'total no histórico',     path: '/history' },
    { label: 'Plataformas',       value: uniquePlatforms.toString(),                     icon: Activity,      iconColor: '#20F5D8', iconBg: 'rgba(32,245,216,0.10)', description: 'utilizadas',             path: '/metrics' },
    { label: 'Esta Semana',       value: postsThisWeek.toString(),                       icon: Zap,           iconColor: '#10D97A', iconBg: 'rgba(16,217,122,0.10)', description: 'posts nos últimos 7 dias', path: '/history' },
    { label: 'Taxa de Sucesso',   value: totalAttempts > 0 ? `${successRate}%` : '—',   icon: CheckCircle,   iconColor: '#FFD84D', iconBg: 'rgba(255,216,77,0.10)', description: 'publicações reais',      path: '/metrics' },
  ];

  return (
    <Layout>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Header */}
        <motion.div style={{ marginBottom: 28 }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 6 }}>
                <span style={{ color: 'var(--text-primary)' }}>Olá, </span>
                <span style={{ background: 'linear-gradient(90deg, #7EB8FF 0%, #20F5D8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {displayName.split(' ')[0]}
                </span>
              </h1>
              <p style={{ fontSize: 13.5, color: 'var(--text-tertiary)', letterSpacing: '-0.005em' }}>
                Transforme conteúdo em funil, audiência em relacionamento e atenção em conversão.
              </p>
            </div>
            <Link to="/composer" style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary btn-md" style={{ gap: 7 }}><Zap size={15} /> Nova Publicação</button>
            </Link>
          </div>
        </motion.div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
          {statCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.35 }}>
              <Link to={card.path} style={{ textDecoration: 'none' }}>
                <div className="stat-card" style={{ cursor: 'pointer' }}>
                  <div className="stat-icon" style={{ background: card.iconBg }}>
                    <card.icon size={20} style={{ color: card.iconColor }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="stat-label">{card.label}</div>
                    <div className="stat-value">{loading ? '—' : card.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{card.description}</div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          {/* Weekly activity */}
          <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="card-header" style={{ marginBottom: 4 }}>
              <span className="card-title">Atividade de Publicação</span>
              <Link to="/history" style={{ textDecoration: 'none', fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                Histórico <ArrowRight size={12} />
              </Link>
            </div>
            <div className="card-content">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B6EFF" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3B6EFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,110,255,0.07)" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'rgba(140,170,220,0.50)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgba(140,170,220,0.50)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: 'rgba(4,12,40,0.95)', border: '0.5px solid rgba(59,110,255,0.25)', borderRadius: 10, fontSize: 12 }} labelStyle={{ color: 'rgba(247,251,255,0.80)', fontWeight: 600 }} itemStyle={{ color: 'rgba(140,170,220,0.70)' }} />
                  <Area type="monotone" dataKey="posts" name="Posts" stroke="#3B6EFF" strokeWidth={2} fill="url(#gradBlue)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Platform + results */}
          <motion.div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 12 }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="card">
              <div className="card-header" style={{ marginBottom: 0 }}>
                <span className="card-title">Plataformas</span>
                <Link to="/metrics" style={{ textDecoration: 'none', fontSize: 12, color: 'var(--text-tertiary)' }}>Ver →</Link>
              </div>
              <div className="card-content" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
                {platformPieData.length > 0 ? (
                  <>
                    <PieChart width={70} height={70}>
                      <Pie data={platformPieData} cx={30} cy={30} innerRadius={20} outerRadius={32} dataKey="value" paddingAngle={2}>
                        {platformPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {platformPieData.map(s => (
                        <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                            <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{PLATFORM_LABELS[s.name] ?? s.name}</span>
                          </div>
                          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p style={{ fontSize: 12, color: 'var(--text-tertiary)', padding: '10px 0' }}>Publique seu primeiro post para ver dados.</p>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header" style={{ marginBottom: 0 }}>
                <span className="card-title">Resultados</span>
              </div>
              <div className="card-content" style={{ padding: '10px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Publicados', value: publishedOk, color: '#10D97A', icon: CheckCircle },
                  { label: 'Simulados',  value: publishedMocked, color: '#8B5CF6', icon: Clock },
                  { label: 'Erros',      value: publishedError, color: '#FF4757', icon: XCircle },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <r.icon size={12} style={{ color: r.color }} />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.label}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: r.value > 0 ? r.color : 'var(--text-tertiary)' }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent posts + Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <div className="card-header">
              <span className="card-title">Publicações Recentes</span>
              <Link to="/history" style={{ textDecoration: 'none' }}>
                <button className="btn btn-secondary btn-sm" style={{ gap: 5 }}>Histórico <ChevronRight size={13} /></button>
              </Link>
            </div>
            <div className="card-content">
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                  <div style={{ width: 24, height: 24, border: '2px solid rgba(59,110,255,0.20)', borderTopColor: '#3B6EFF', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
                </div>
              ) : posts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 10 }}>Nenhuma publicação ainda.</p>
                  <Link to="/composer" style={{ textDecoration: 'none' }}>
                    <button className="btn btn-primary btn-sm" style={{ gap: 5 }}><Zap size={12} /> Criar primeiro post</button>
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {posts.slice(0, 5).map(post => {
                    const hasSuccess = Object.values(post.results || {}).some((r: any) => r.status === 'published');
                    const isMocked  = !hasSuccess && Object.values(post.results || {}).some((r: any) => r.status === 'mocked');
                    return (
                      <div key={post.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: hasSuccess ? 'rgba(16,217,122,0.12)' : isMocked ? 'rgba(139,92,246,0.12)' : 'rgba(255,71,87,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {hasSuccess ? <CheckCircle size={14} style={{ color: '#10D97A' }} /> : isMocked ? <Clock size={14} style={{ color: '#A78BFA' }} /> : <XCircle size={14} style={{ color: '#FF6B7A' }} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {post.baseText || '(sem texto)'}
                          </p>
                          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                            {post.selectedPlatforms.length} plataforma{post.selectedPlatforms.length > 1 ? 's' : ''} · {post.createdAt.toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
            <div className="card-header"><span className="card-title">Acesso Rápido</span></div>
            <div className="card-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {quickActions.map(a => (
                <Link key={a.to} to={a.to} style={{ textDecoration: 'none' }}>
                  <div
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '12px 8px', borderRadius: 12, border: `0.5px solid ${a.border}`, background: a.bg, cursor: 'pointer', textAlign: 'center', transition: 'all 200ms' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: `${a.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <a.icon size={16} style={{ color: a.color }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.2 }}>{a.label}</span>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ padding: '0 18px 18px' }}>
              <Link to="/ia" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '12px 14px', borderRadius: 12, background: 'linear-gradient(90deg, rgba(139,92,246,0.08), rgba(32,245,216,0.05))', border: '0.5px solid rgba(139,92,246,0.20)', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sparkles size={15} style={{ color: '#A78BFA' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Sugestões Inteligentes</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Análise baseada nos seus dados</div>
                  </div>
                  <ArrowRight size={13} style={{ color: 'var(--text-tertiary)', marginLeft: 'auto' }} />
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
