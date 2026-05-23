import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3, CheckCircle, Image, Plus, Send, TrendingUp, Zap } from 'lucide-react';
import type { ElementType } from 'react';
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

interface FunnelStage {
  id: string;
  name: string;
  description: string;
  count: number;
  color: string;
  icon: ElementType;
  posts: PublishedPost[];
  actionLabel: string;
  actionPath: string;
}

function compactText(text: string) {
  return text.length > 82 ? `${text.slice(0, 82)}...` : text;
}

export function FunnelPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PublishedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'kanban' | 'chart'>('kanban');

  useEffect(() => {
    if (!user) return;

    getDocs(query(collection(db, 'publishedPosts'), where('userId', '==', user.uid)))
      .then((snap) => {
        setPosts(snap.docs.map((item) => {
          const data = item.data();
          return { ...data, id: item.id, createdAt: data.createdAt?.toDate?.() ?? new Date() } as PublishedPost;
        }));
      })
      .finally(() => setLoading(false));
  }, [user]);

  const stages = useMemo<FunnelStage[]>(() => {
    const totalPosts = posts;
    const adapted = posts.filter((post) => post.adaptedContent !== null);
    const media = posts.filter((post) => post.mediaUrl !== null);
    const published = posts.filter((post) => Object.values(post.results ?? {}).some((result) => result.status === 'published'));

    return [
      {
        id: 'created',
        name: 'Captura',
        description: 'Conteudos iniciados no compositor',
        count: totalPosts.length,
        color: '#5aa7ff',
        icon: Send,
        posts: totalPosts,
        actionLabel: 'Criar post',
        actionPath: '/composer',
      },
      {
        id: 'adapted',
        name: 'Qualificacao IA',
        description: 'Conteudos adaptados para plataformas',
        count: adapted.length,
        color: '#4ff7dd',
        icon: Zap,
        posts: adapted,
        actionLabel: 'Adaptar conteudo',
        actionPath: '/composer',
      },
      {
        id: 'media',
        name: 'Oferta visual',
        description: 'Publicacoes com imagem ou video',
        count: media.length,
        color: '#a78bfa',
        icon: Image,
        posts: media,
        actionLabel: 'Adicionar midia',
        actionPath: '/composer',
      },
      {
        id: 'published',
        name: 'Conversao',
        description: 'Publicadas com sucesso em uma plataforma',
        count: published.length,
        color: '#34d399',
        icon: CheckCircle,
        posts: published,
        actionLabel: 'Ver historico',
        actionPath: '/history',
      },
    ];
  }, [posts]);

  const total = posts.length;
  const publishedOk = stages.find((stage) => stage.id === 'published')?.count ?? 0;
  const withAdaptation = stages.find((stage) => stage.id === 'adapted')?.count ?? 0;
  const conversionRate = total > 0 ? Math.round((publishedOk / total) * 100) : 0;
  const adaptationRate = total > 0 ? Math.round((withAdaptation / total) * 100) : 0;

  const chartData = stages.map((stage) => ({
    stage: stage.name,
    value: stage.count,
    fill: stage.color,
  }));

  return (
    <Layout>
      <div className="pf-page pf-page-wide funnel-page">
        <PageHeader
          eyebrow={<><TrendingUp size={14} /> Pipeline de crescimento</>}
          title="Funil de Vendas"
          description="Visualize cada etapa como um kanban premium, com volume, valor estimado e acoes rapidas para destravar o proximo passo."
          actions={
            <>
              <div className="segmented-control" aria-label="Alternar visualizacao do funil">
                <button className={view === 'kanban' ? 'active' : ''} onClick={() => setView('kanban')} type="button">Kanban</button>
                <button className={view === 'chart' ? 'active' : ''} onClick={() => setView('chart')} type="button">Grafico</button>
              </div>
              <Link to="/composer" style={{ textDecoration: 'none' }}>
                <GlassButton variant="primary"><Plus size={16} /> Nova oportunidade</GlassButton>
              </Link>
            </>
          }
        />

        <div className="metric-grid">
          <MetricCard label="Total no funil" value={loading ? '-' : total} icon={<Send size={20} />} accent="#5aa7ff" />
          <MetricCard label="Taxa de conversao" value={loading ? '-' : `${conversionRate}%`} icon={<CheckCircle size={20} />} accent="#34d399" state="positive" trend="Publicadas com sucesso" />
          <MetricCard label="Adaptacao IA" value={loading ? '-' : `${adaptationRate}%`} icon={<Zap size={20} />} accent="#4ff7dd" />
          <MetricCard label="Valor estimado" value={loading ? '-' : `R$ ${(publishedOk * 120).toLocaleString('pt-BR')}`} icon={<BarChart3 size={20} />} accent="#a78bfa" />
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="animate-spin" />
            <span>Carregando funil...</span>
          </div>
        ) : total === 0 ? (
          <EmptyState
            icon={<TrendingUp size={30} />}
            title="Nenhuma oportunidade no funil"
            description="Crie seu primeiro post no compositor para preencher as etapas e acompanhar a evolucao do pipeline."
            action={
              <Link to="/composer" style={{ textDecoration: 'none' }}>
                <GlassButton variant="primary"><Plus size={16} /> Criar primeiro post</GlassButton>
              </Link>
            }
          />
        ) : view === 'chart' ? (
          <DataPanel title="Conversao por etapa" description="Volume de conteudos em cada fase do pipeline.">
            <div className="funnel-chart">
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 12, right: 18 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: 'rgba(214,224,244,0.62)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="stage" tick={{ fontSize: 12, fill: 'rgba(214,224,244,0.78)' }} axisLine={false} tickLine={false} width={120} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(7,10,24,0.92)',
                      border: '1px solid rgba(255,255,255,0.14)',
                      borderRadius: 16,
                      color: 'var(--text-primary)',
                    }}
                    formatter={(value) => [`${value} itens`, 'Total']}
                  />
                  <Bar dataKey="value" radius={[0, 14, 14, 0]} name="Itens">
                    {chartData.map((entry) => <Cell key={entry.stage} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DataPanel>
        ) : (
          <div className="funnel-board" aria-label="Etapas do funil">
            {stages.map((stage) => {
              const Icon = stage.icon;
              const estimatedValue = stage.count * 120;
              return (
                <GlassCard key={stage.id} className="funnel-column" padded={false}>
                  <div className="funnel-column__header" style={{ borderColor: `${stage.color}33` }}>
                    <div className="funnel-column__icon" style={{ color: stage.color, background: `${stage.color}1f` }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h2>{stage.name}</h2>
                      <p>{stage.description}</p>
                    </div>
                  </div>

                  <div className="funnel-column__meta">
                    <span><strong>{stage.count}</strong> leads</span>
                    <span><strong>R$ {estimatedValue.toLocaleString('pt-BR')}</strong> estimado</span>
                  </div>

                  <div className="funnel-card-list">
                    {stage.posts.slice(0, 5).map((post) => (
                      <article className="funnel-lead-card" key={`${stage.id}-${post.id}`}>
                        <strong>{compactText(post.baseText || '(sem texto)')}</strong>
                        <span>{post.selectedPlatforms.length} plataforma{post.selectedPlatforms.length === 1 ? '' : 's'}</span>
                      </article>
                    ))}
                    {stage.posts.length === 0 && (
                      <div className="funnel-empty-column">Sem itens nesta etapa</div>
                    )}
                  </div>

                  <Link to={stage.actionPath} style={{ textDecoration: 'none' }}>
                    <GlassButton variant="secondary" size="sm" className="funnel-action">
                      {stage.actionLabel}
                    </GlassButton>
                  </Link>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
