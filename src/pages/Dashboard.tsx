import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import {
  Activity, ArrowRight, BarChart3, CheckCircle, CheckSquare, Clock,
  Megaphone, PenSquare, Send, Sparkles, Target, TrendingUp, Users,
  XCircle, Zap,
} from 'lucide-react';
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Layout } from '../components/Layout';
import { DataPanel } from '../components/ui/DataPanel';
import { EmptyState } from '../components/ui/EmptyState';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassCard } from '../components/ui/GlassCard';
import { MetricCard } from '../components/ui/MetricCard';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import type { PublishedPost } from '../types';

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#e1306c',
  tiktok: '#ff0050',
  x: '#1da1f2',
  telegram: '#0088cc',
  discord: '#5865f2',
  youtube: '#ff0000',
  linkedin: '#0077b5',
  facebook: '#1877f2',
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  x: 'X',
  telegram: 'Telegram',
  discord: 'Discord',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
};

const quickActions = [
  { label: 'Ver Funil', icon: TrendingUp, to: '/funil', color: '#5aa7ff' },
  { label: 'Retencao', icon: Users, to: '/retencao', color: '#4ff7dd' },
  { label: 'Estrategias', icon: Target, to: '/estrategias', color: '#facc15' },
  { label: 'Sugestoes IA', icon: Sparkles, to: '/ia', color: '#a78bfa' },
  { label: 'Campanhas', icon: Megaphone, to: '/campanhas', color: '#34d399' },
  { label: 'Checklist', icon: CheckSquare, to: '/checklist', color: '#fb923c' },
];

function getWeeklyData(posts: PublishedPost[]) {
  const now = new Date();
  return Array.from({ length: 8 }, (_, index) => {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (7 - index) * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const count = posts.filter((post) => post.createdAt >= weekStart && post.createdAt < weekEnd).length;
    return { week: `S${index + 1}`, posts: count };
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
        const items = snap.docs.map((item) => ({
          id: item.id,
          ...item.data(),
          createdAt: item.data().createdAt?.toDate?.() ?? new Date(),
        })) as PublishedPost[];
        setPosts(items);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const stats = useMemo(() => {
    const totalPosts = posts.length;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const postsThisWeek = posts.filter((post) => post.createdAt >= oneWeekAgo).length;

    const platformCounts: Record<string, number> = {};
    posts.forEach((post) => post.selectedPlatforms.forEach((platform) => {
      platformCounts[platform] = (platformCounts[platform] || 0) + 1;
    }));

    let publishedOk = 0;
    let publishedMocked = 0;
    let publishedError = 0;
    posts.forEach((post) => Object.values(post.results || {}).forEach((result) => {
      if (result.status === 'published') publishedOk++;
      else if (result.status === 'mocked') publishedMocked++;
      else publishedError++;
    }));

    const totalAttempts = publishedOk + publishedMocked + publishedError;
    const successRate = totalAttempts > 0 ? Math.round((publishedOk / totalAttempts) * 100) : 0;

    return {
      totalPosts,
      postsThisWeek,
      platformCounts,
      uniquePlatforms: Object.keys(platformCounts).length,
      publishedOk,
      publishedMocked,
      publishedError,
      successRate,
    };
  }, [posts]);

  const weeklyData = useMemo(() => getWeeklyData(posts), [posts]);
  const platformPieData = useMemo(() => Object.entries(stats.platformCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value, color: PLATFORM_COLORS[name] || '#94a3b8' })), [stats.platformCounts]);

  const displayName = userProfile?.displayName ?? userProfile?.username ?? 'Criador';

  const metricCards = [
    { label: 'Posts criados', value: stats.totalPosts, icon: <Send size={20} />, color: '#5aa7ff', trend: 'total no historico' },
    { label: 'Plataformas', value: stats.uniquePlatforms, icon: <Activity size={20} />, color: '#4ff7dd', trend: 'canais utilizados' },
    { label: 'Esta semana', value: stats.postsThisWeek, icon: <Zap size={20} />, color: '#34d399', trend: 'ultimos 7 dias' },
    { label: 'Taxa de sucesso', value: stats.successRate > 0 ? `${stats.successRate}%` : '-', icon: <CheckCircle size={20} />, color: '#facc15', trend: 'publicacoes reais' },
  ];

  return (
    <Layout>
      <div className="pf-page pf-page-wide dashboard-page">
        <PageHeader
          eyebrow={<><Sparkles size={14} /> SaaS para criadores</>}
          title={`Ola, ${displayName.split(' ')[0]}`}
          description="Transforme conteudo em funil, audiencia em relacionamento e atencao em conversao."
          actions={
            <Link to="/composer" style={{ textDecoration: 'none' }}>
              <GlassButton variant="primary"><PenSquare size={16} /> Nova publicacao</GlassButton>
            </Link>
          }
        />

        <div className="metric-grid">
          {metricCards.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={loading ? '-' : metric.value}
              icon={metric.icon}
              accent={metric.color}
              trend={metric.trend}
            />
          ))}
        </div>

        <div className="dashboard-grid">
          <DataPanel
            className="dashboard-chart-panel"
            title="Atividade de publicacao"
            description="Volume semanal das ultimas oito semanas."
            tools={
              <Link to="/history" style={{ textDecoration: 'none' }}>
                <GlassButton variant="ghost" size="sm">Historico <ArrowRight size={14} /></GlassButton>
              </Link>
            }
          >
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="dashboardBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5aa7ff" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#5aa7ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: 'rgba(214,224,244,0.60)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'rgba(214,224,244,0.60)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(7,10,24,0.92)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    borderRadius: 16,
                    color: 'var(--text-primary)',
                  }}
                />
                <Area type="monotone" dataKey="posts" name="Posts" stroke="#5aa7ff" strokeWidth={3} fill="url(#dashboardBlue)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </DataPanel>

          <div className="dashboard-side-stack">
            <GlassCard className="dashboard-mini-panel">
              <div className="dashboard-mini-heading">
                <BarChart3 size={17} />
                <strong>Plataformas</strong>
              </div>
              {platformPieData.length > 0 ? (
                <div className="dashboard-platform-row">
                  <PieChart width={92} height={92}>
                    <Pie data={platformPieData} cx={46} cy={46} innerRadius={28} outerRadius={42} dataKey="value" paddingAngle={3}>
                      {platformPieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                  <div className="dashboard-platform-list">
                    {platformPieData.map((platform) => (
                      <span key={platform.name}>
                        <i style={{ background: platform.color }} />
                        {PLATFORM_LABELS[platform.name] ?? platform.name}
                        <strong>{platform.value}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="dashboard-muted">Publique seu primeiro post para ver dados.</p>
              )}
            </GlassCard>

            <GlassCard className="dashboard-mini-panel">
              <div className="dashboard-mini-heading">
                <CheckCircle size={17} />
                <strong>Resultados</strong>
              </div>
              <div className="dashboard-result-list">
                {[
                  { label: 'Publicados', value: stats.publishedOk, color: 'var(--success)', icon: CheckCircle },
                  { label: 'Simulados', value: stats.publishedMocked, color: 'var(--warning)', icon: Clock },
                  { label: 'Erros', value: stats.publishedError, color: 'var(--danger)', icon: XCircle },
                ].map((result) => (
                  <span key={result.label}>
                    <result.icon size={14} style={{ color: result.color }} />
                    {result.label}
                    <strong style={{ color: result.value > 0 ? result.color : 'var(--text-muted)' }}>{result.value}</strong>
                  </span>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>

        <div className="dashboard-bottom-grid">
          <DataPanel
            title="Publicacoes recentes"
            description="Ultimos envios e seus estados."
            tools={
              <Link to="/history" style={{ textDecoration: 'none' }}>
                <GlassButton variant="secondary" size="sm">Ver tudo <ArrowRight size={14} /></GlassButton>
              </Link>
            }
          >
            {loading ? (
              <div className="loading-state">
                <div className="animate-spin" />
                <span>Carregando publicacoes...</span>
              </div>
            ) : posts.length === 0 ? (
              <EmptyState
                icon={<Send size={30} />}
                title="Nenhuma publicacao ainda"
                description="Comece pelo compositor para alimentar seu dashboard."
                action={
                  <Link to="/composer" style={{ textDecoration: 'none' }}>
                    <GlassButton variant="primary"><PenSquare size={16} /> Criar primeiro post</GlassButton>
                  </Link>
                }
              />
            ) : (
              <div className="dashboard-recent-list">
                {posts.slice(0, 5).map((post) => {
                  const hasSuccess = Object.values(post.results || {}).some((result) => result.status === 'published');
                  const isMocked = !hasSuccess && Object.values(post.results || {}).some((result) => result.status === 'mocked');
                  const state = hasSuccess ? 'success' : isMocked ? 'warning' : 'danger';
                  return (
                    <article className="dashboard-recent-item" key={post.id}>
                      <span className="status-chip" data-status={state}>{hasSuccess ? 'Publicado' : isMocked ? 'Demo' : 'Erro'}</span>
                      <div>
                        <strong>{post.baseText || '(sem texto)'}</strong>
                        <small>{post.selectedPlatforms.length} plataforma{post.selectedPlatforms.length === 1 ? '' : 's'} - {post.createdAt.toLocaleDateString('pt-BR')}</small>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </DataPanel>

          <DataPanel title="Acesso rapido" description="Atalhos para as rotinas mais usadas.">
            <div className="dashboard-action-grid">
              {quickActions.map((action) => (
                <Link key={action.to} to={action.to} style={{ textDecoration: 'none' }}>
                  <GlassCard className="dashboard-action-card" hover>
                    <action.icon size={20} style={{ color: action.color }} />
                    <span>{action.label}</span>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </DataPanel>
        </div>
      </div>
    </Layout>
  );
}
