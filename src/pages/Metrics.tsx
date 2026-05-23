import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, CheckCircle, Clock, PenSquare, Send, XCircle, Activity } from 'lucide-react';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { Layout } from '../components/Layout';
import { DataPanel } from '../components/ui/DataPanel';
import { EmptyState } from '../components/ui/EmptyState';
import { GlassButton } from '../components/ui/GlassButton';
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

export function Metrics() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PublishedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    getDocs(
      query(collection(db, 'publishedPosts'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'))
    ).then((snap) => {
      setPosts(snap.docs.map((item) => {
        const data = item.data();
        return { ...data, id: item.id, createdAt: data.createdAt?.toDate?.() ?? new Date() } as PublishedPost;
      }));
    }).finally(() => setLoading(false));
  }, [user]);

  const data = useMemo(() => {
    const allResults = posts.flatMap((post) => Object.values(post.results ?? {}));
    const publishedOk = allResults.filter((result) => result.status === 'published').length;
    const publishedMocked = allResults.filter((result) => result.status === 'mocked').length;
    const publishedError = allResults.filter((result) => result.status === 'error').length;
    const totalAttempts = allResults.length;
    const successRate = totalAttempts > 0 ? Math.round((publishedOk / totalAttempts) * 100) : 0;

    const platformCounts: Record<string, number> = {};
    posts.forEach((post) => (post.selectedPlatforms ?? []).forEach((platform) => {
      platformCounts[platform] = (platformCounts[platform] ?? 0) + 1;
    }));

    const platformEntries = Object.entries(platformCounts).sort((a, b) => b[1] - a[1]);
    const maxCount = platformEntries[0]?.[1] ?? 1;

    return { publishedOk, publishedMocked, publishedError, successRate, platformEntries, maxCount };
  }, [posts]);

  const summaryCards = [
    { label: 'Total de posts', value: posts.length, icon: <Send size={20} />, color: '#5aa7ff' },
    { label: 'Publicados', value: data.publishedOk, icon: <CheckCircle size={20} />, color: '#34d399' },
    { label: 'Taxa de sucesso', value: `${data.successRate}%`, icon: <Activity size={20} />, color: '#4ff7dd' },
    { label: 'Demo/Pendentes', value: data.publishedMocked, icon: <Clock size={20} />, color: '#facc15' },
    { label: 'Com erro', value: data.publishedError, icon: <XCircle size={20} />, color: '#fb7185' },
    { label: 'Plataformas', value: data.platformEntries.length, icon: <BarChart3 size={20} />, color: '#a78bfa' },
  ];

  return (
    <Layout>
      <div className="pf-page metrics-page">
        <PageHeader
          eyebrow={<><BarChart3 size={14} /> Analytics</>}
          title="Metricas"
          description="Desempenho das publicacoes, status de entrega e distribuicao por plataforma."
          actions={
            <Link to="/composer" style={{ textDecoration: 'none' }}>
              <GlassButton variant="primary"><PenSquare size={16} /> Criar post</GlassButton>
            </Link>
          }
        />

        {loading ? (
          <div className="loading-state">
            <div className="animate-spin" />
            <span>Carregando metricas...</span>
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={<BarChart3 size={30} />}
            title="Nenhuma publicacao ainda"
            description="Crie seu primeiro post no compositor para alimentar as metricas do PostFlow."
            action={
              <Link to="/composer" style={{ textDecoration: 'none' }}>
                <GlassButton variant="primary"><PenSquare size={16} /> Criar primeiro post</GlassButton>
              </Link>
            }
          />
        ) : (
          <>
            <div className="metric-grid">
              {summaryCards.map((card) => (
                <MetricCard key={card.label} label={card.label} value={card.value} icon={card.icon} accent={card.color} />
              ))}
            </div>

            <div className="metrics-grid">
              <DataPanel title="Posts por plataforma" description="Comparacao relativa entre canais utilizados.">
                <div className="platform-bar-list">
                  {data.platformEntries.map(([platform, count]) => {
                    const color = PLATFORM_COLORS[platform] ?? '#a78bfa';
                    const pct = (count / data.maxCount) * 100;
                    return (
                      <div className="platform-bar-item" key={platform}>
                        <div>
                          <strong>{PLATFORM_LABELS[platform] ?? platform}</strong>
                          <span>{count} post{count === 1 ? '' : 's'}</span>
                        </div>
                        <div className="platform-bar-track">
                          <i style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DataPanel>

              <DataPanel title="Publicacoes recentes" description="Ultimos posts usados no calculo.">
                <div className="dashboard-recent-list">
                  {posts.slice(0, 6).map((post, index) => {
                    const ok = Object.values(post.results ?? {}).filter((result) => result.status === 'published').length;
                    const total = Object.values(post.results ?? {}).length;
                    return (
                      <article className="dashboard-recent-item" key={post.id ?? index}>
                        <span className="status-chip" data-status={ok > 0 ? 'success' : 'warning'}>{ok > 0 ? 'Publicado' : 'Pendente'}</span>
                        <div>
                          <strong>{post.baseText ?? '(sem texto)'}</strong>
                          <small>{ok}/{total} plataformas - {post.createdAt.toLocaleDateString('pt-BR')}</small>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </DataPanel>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
