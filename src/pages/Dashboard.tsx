import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { seedDemoData } from '../lib/seed';
import { funnelMetrics, funnelChartData } from '../data/funnelData';
import { weeklyRetentionData, trafficSources } from '../data/retentionData';
import { campaigns } from '../data/campaignData';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, Target, Zap, DollarSign,
  Megaphone, BarChart3, Eye, ArrowRight, ArrowUpRight,
  ArrowDownRight, Sparkles, CheckSquare, ChevronRight,
  Activity,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import type { PublishedPost } from '../types';

const visitorData = [
  { month: 'Jan', visitors: 4200, leads: 980 },
  { month: 'Fev', visitors: 5800, leads: 1420 },
  { month: 'Mar', visitors: 7200, leads: 1890 },
  { month: 'Abr', visitors: 9100, leads: 2340 },
  { month: 'Mai', visitors: 12400, leads: 3472 },
];

const statCards = [
  {
    label: 'Visitantes Totais',
    value: funnelMetrics.totalVisitors.toLocaleString('pt-BR'),
    change: +24.5,
    icon: Eye,
    iconColor: '#3B6EFF',
    iconBg: 'rgba(59,110,255,0.12)',
    description: 'nas últimas 4 semanas',
    path: '/funil',
  },
  {
    label: 'Leads Capturados',
    value: funnelMetrics.totalLeads.toLocaleString('pt-BR'),
    change: +18.2,
    icon: Users,
    iconColor: '#20F5D8',
    iconBg: 'rgba(32,245,216,0.10)',
    description: 'taxa de captura 28%',
    path: '/funil',
  },
  {
    label: 'Taxa de Conversão',
    value: `${funnelMetrics.conversionRate}%`,
    change: +0.3,
    icon: Target,
    iconColor: '#10D97A',
    iconBg: 'rgba(16,217,122,0.10)',
    description: 'lead → compra',
    path: '/funil',
  },
  {
    label: 'Receita Estimada',
    value: `R$ ${(funnelMetrics.estimatedRevenue / 1000).toFixed(0)}k`,
    change: +31.8,
    icon: DollarSign,
    iconColor: '#FFD84D',
    iconBg: 'rgba(255,216,77,0.10)',
    description: 'ticket médio R$ 497',
    path: '/campanhas',
  },
  {
    label: 'Campanhas Ativas',
    value: campaigns.filter(c => c.status === 'active').length.toString(),
    change: +2,
    icon: Megaphone,
    iconColor: '#8B5CF6',
    iconBg: 'rgba(139,92,246,0.10)',
    description: 'de 8 campanhas totais',
    path: '/campanhas',
  },
  {
    label: 'Retenção Média',
    value: '68%',
    change: +4.2,
    icon: Activity,
    iconColor: '#FF9F0A',
    iconBg: 'rgba(255,159,10,0.10)',
    description: 'do público retorna',
    path: '/retencao',
  },
];

const quickActions = [
  { label: 'Ver Funil',        icon: TrendingUp,  to: '/funil',       color: '#3B6EFF', bg: 'rgba(59,110,255,0.10)', border: 'rgba(59,110,255,0.20)' },
  { label: 'Retenção',         icon: Users,       to: '/retencao',    color: '#20F5D8', bg: 'rgba(32,245,216,0.08)', border: 'rgba(32,245,216,0.18)' },
  { label: 'Estratégias',      icon: Target,      to: '/estrategias', color: '#FFD84D', bg: 'rgba(255,216,77,0.08)', border: 'rgba(255,216,77,0.18)' },
  { label: 'Sugestões IA',     icon: Sparkles,    to: '/ia',          color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.18)' },
  { label: 'Campanhas',        icon: Megaphone,   to: '/campanhas',   color: '#10D97A', bg: 'rgba(16,217,122,0.08)', border: 'rgba(16,217,122,0.18)' },
  { label: 'Checklist',        icon: CheckSquare, to: '/checklist',   color: '#FF9F0A', bg: 'rgba(255,159,10,0.08)', border: 'rgba(255,159,10,0.18)' },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'rgba(4,12,40,0.95)', border: '0.5px solid rgba(59,110,255,0.25)', borderRadius: 10, padding: '10px 14px', backdropFilter: 'blur(20px)' }}>
        <p style={{ fontSize: 11, color: 'rgba(140,170,220,0.60)', marginBottom: 6, fontWeight: 600 }}>{label}</p>
        {payload.map((p) => (
          <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
            <span style={{ fontSize: 12, color: 'rgba(247,251,255,0.80)', fontWeight: 600 }}>{p.value.toLocaleString('pt-BR')}</span>
            <span style={{ fontSize: 11, color: 'rgba(140,170,220,0.50)' }}>{p.name}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  const { user, userProfile } = useAuth();
  const [posts, setPosts] = useState<PublishedPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        await seedDemoData(user.uid);
        const q = query(
          collection(db, 'publishedPosts'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const snap = await getDocs(q);
        const items = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
        })) as PublishedPost[];
        setPosts(items);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoadingPosts(false);
      }
    };
    load();
  }, [user]);

  const displayName = userProfile?.displayName ?? userProfile?.username ?? 'Criador';

  return (
    <Layout>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          style={{ marginBottom: 28 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 6 }}>
                <span style={{ color: 'var(--text-primary)' }}>Olá, </span>
                <span style={{
                  background: 'linear-gradient(90deg, #7EB8FF 0%, #20F5D8 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>{displayName.split(' ')[0]}</span>
              </h1>
              <p style={{ fontSize: 13.5, color: 'var(--text-tertiary)', letterSpacing: '-0.005em' }}>
                Transforme conteúdo em funil, audiência em relacionamento e atenção em conversão.
              </p>
            </div>
            <Link to="/composer" style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary btn-md" style={{ gap: 7 }}>
                <Zap size={15} />
                Nova Publicação
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
            >
              <Link to={card.path} style={{ textDecoration: 'none' }}>
                <div className="stat-card" style={{ cursor: 'pointer' }}>
                  <div className="stat-icon" style={{ background: card.iconBg }}>
                    <card.icon size={20} style={{ color: card.iconColor }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="stat-label">{card.label}</div>
                    <div className="stat-value">{card.value}</div>
                    <div className="stat-trend" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {card.change > 0
                        ? <ArrowUpRight size={11} style={{ color: '#10D97A' }} />
                        : <ArrowDownRight size={11} style={{ color: '#FF4757' }} />}
                      <span style={{ color: card.change > 0 ? '#10D97A' : '#FF4757', fontWeight: 600, fontSize: 11 }}>
                        {card.change > 0 ? '+' : ''}{card.change}%
                      </span>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>{card.description}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          {/* Visitors + Leads chart */}
          <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.35 }}>
            <div className="card-header" style={{ marginBottom: 4 }}>
              <span className="card-title">Evolução do Funil</span>
              <Link to="/funil" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>
                Ver funil <ArrowRight size={12} />
              </Link>
            </div>
            <div className="card-content">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={visitorData}>
                  <defs>
                    <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B6EFF" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3B6EFF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#20F5D8" stopOpacity={0.20} />
                      <stop offset="95%" stopColor="#20F5D8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,110,255,0.07)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'rgba(140,170,220,0.50)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgba(140,170,220,0.50)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="visitors" name="Visitantes" stroke="#3B6EFF" strokeWidth={2} fill="url(#gradBlue)" dot={false} />
                  <Area type="monotone" dataKey="leads" name="Leads" stroke="#20F5D8" strokeWidth={2} fill="url(#gradCyan)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Retention + Traffic */}
          <motion.div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 12 }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.35 }}>
            {/* Retention weekly */}
            <div className="card">
              <div className="card-header" style={{ marginBottom: 0 }}>
                <span className="card-title">Retenção Semanal</span>
                <Link to="/retencao" style={{ textDecoration: 'none', fontSize: 12, color: 'var(--text-tertiary)' }}>Ver →</Link>
              </div>
              <div className="card-content" style={{ padding: '10px 18px' }}>
                <ResponsiveContainer width="100%" height={80}>
                  <BarChart data={weeklyRetentionData.slice(-6)}>
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'rgba(140,170,220,0.45)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="retention" name="Retenção %" fill="#3B6EFF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Traffic sources */}
            <div className="card">
              <div className="card-header" style={{ marginBottom: 0 }}>
                <span className="card-title">Origem do Tráfego</span>
              </div>
              <div className="card-content" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <PieChart width={70} height={70}>
                  <Pie data={trafficSources} cx={30} cy={30} innerRadius={20} outerRadius={32} dataKey="percentage" paddingAngle={2}>
                    {trafficSources.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {trafficSources.slice(0, 4).map((s) => (
                    <div key={s.source} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{s.source}</span>
                      </div>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-primary)' }}>{s.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          {/* Funnel overview */}
          <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.35 }}>
            <div className="card-header">
              <span className="card-title">Visão do Funil</span>
              <Link to="/funil" style={{ textDecoration: 'none' }}>
                <button className="btn btn-secondary btn-sm" style={{ gap: 5 }}>
                  Ver funil completo <ChevronRight size={13} />
                </button>
              </Link>
            </div>
            <div className="card-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {funnelChartData.map((stage, i) => {
                  const maxVal = funnelChartData[0].value;
                  const pct = (stage.value / maxVal) * 100;
                  return (
                    <div key={stage.stage}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{stage.stage}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{stage.value.toLocaleString('pt-BR')}</span>
                      </div>
                      <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                        <motion.div
                          style={{ height: '100%', borderRadius: 4, background: stage.fill }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.7 + i * 0.05, duration: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Quick actions */}
          <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.35 }}>
            <div className="card-header">
              <span className="card-title">Acesso Rápido</span>
            </div>
            <div className="card-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {quickActions.map((a) => (
                <Link key={a.to} to={a.to} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    padding: '12px 8px', borderRadius: 12,
                    border: `0.5px solid ${a.border}`,
                    background: a.bg,
                    cursor: 'pointer', textAlign: 'center',
                    transition: 'all 200ms',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 16px ${a.color}20`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: `${a.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <a.icon size={16} style={{ color: a.color }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.2 }}>{a.label}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* AI Suggestion teaser */}
            <div style={{ padding: '0 18px 18px' }}>
              <Link to="/ia" style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '12px 14px', borderRadius: 12,
                  background: 'linear-gradient(90deg, rgba(139,92,246,0.08) 0%, rgba(32,245,216,0.05) 100%)',
                  border: '0.5px solid rgba(139,92,246,0.20)',
                  display: 'flex', alignItems: 'center', gap: 10,
                  cursor: 'pointer', transition: 'all 200ms',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(90deg, rgba(139,92,246,0.14) 0%, rgba(32,245,216,0.08) 100%)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(90deg, rgba(139,92,246,0.08) 0%, rgba(32,245,216,0.05) 100%)'; }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sparkles size={15} style={{ color: '#A78BFA' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Sugestão IA disponível</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>3 insights prontos para você</div>
                  </div>
                  <ArrowRight size={13} style={{ color: 'var(--text-tertiary)', marginLeft: 'auto' }} />
                </div>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Posts count */}
        {!loadingPosts && posts.length > 0 && (
          <motion.div
            style={{ marginTop: 16 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Link to="/history" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px', borderRadius: 14,
                background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)',
                cursor: 'pointer', transition: 'all 200ms',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(59,110,255,0.05)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(59,110,255,0.15)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,110,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BarChart3 size={17} style={{ color: '#3B6EFF' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{posts.length} publicações no histórico</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>Veja desempenho de todas as publicações</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>
                  Ver histórico <ChevronRight size={14} />
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
