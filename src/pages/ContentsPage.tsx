import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { CheckCircle, FileText, Filter, PenSquare, Send, XCircle, Clock } from 'lucide-react';
import { Layout } from '../components/Layout';
import { DataPanel } from '../components/ui/DataPanel';
import { EmptyState } from '../components/ui/EmptyState';
import { GlassButton } from '../components/ui/GlassButton';
import { MetricCard } from '../components/ui/MetricCard';
import { PageHeader } from '../components/ui/PageHeader';
import { ResponsiveTable, type ResponsiveColumn } from '../components/ui/ResponsiveTable';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import type { Platform, PublishedPost } from '../types';

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

type StatusFilter = 'all' | 'published' | 'mocked' | 'error';
type MediaFilter = 'all' | 'image' | 'video' | 'text';

function getPostStatus(post: PublishedPost): 'published' | 'mocked' | 'error' | 'pending' {
  const statuses = Object.values(post.results ?? {}).map((result) => result.status);
  if (statuses.some((status) => status === 'published')) return 'published';
  if (statuses.some((status) => status === 'error')) return 'error';
  if (statuses.some((status) => status === 'mocked')) return 'mocked';
  return 'pending';
}

const statusDisplay = {
  published: { label: 'Publicado', tone: 'success', icon: CheckCircle },
  mocked: { label: 'Demo', tone: 'warning', icon: Clock },
  error: { label: 'Erro', tone: 'danger', icon: XCircle },
  pending: { label: 'Pendente', tone: 'pending', icon: Clock },
};

export function ContentsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PublishedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState<'all' | Platform>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all');

  useEffect(() => {
    if (!user) return;

    getDocs(query(collection(db, 'publishedPosts'), where('userId', '==', user.uid), orderBy('createdAt', 'desc')))
      .then((snap) => {
        setPosts(snap.docs.map((item) => {
          const data = item.data();
          return { ...data, id: item.id, createdAt: data.createdAt?.toDate?.() ?? new Date() } as PublishedPost;
        }));
      })
      .finally(() => setLoading(false));
  }, [user]);

  const allPlatforms = useMemo(() => Array.from(new Set(posts.flatMap((post) => post.selectedPlatforms ?? []))), [posts]);

  const filtered = useMemo(() => posts.filter((post) => {
    const platformOk = platformFilter === 'all' || (post.selectedPlatforms ?? []).includes(platformFilter);
    const postStatus = getPostStatus(post);
    const statusOk = statusFilter === 'all' || postStatus === statusFilter;
    const mediaOk = mediaFilter === 'all' || (mediaFilter === 'text' ? !post.mediaType : post.mediaType === mediaFilter);
    return platformOk && statusOk && mediaOk;
  }), [mediaFilter, platformFilter, posts, statusFilter]);

  const totalPublished = posts.filter((post) => getPostStatus(post) === 'published').length;
  const withMedia = posts.filter((post) => post.mediaType !== null).length;
  const withAI = posts.filter((post) => post.adaptedContent !== null).length;

  const columns: ResponsiveColumn<PublishedPost>[] = [
    {
      key: 'content',
      header: 'Conteudo',
      render: (post) => (
        <div className="history-content-cell">
          <strong>{post.baseText?.slice(0, 80) ?? '(sem texto)'}</strong>
          <span>{post.createdAt instanceof Date ? post.createdAt.toLocaleDateString('pt-BR') : '-'}</span>
        </div>
      ),
    },
    {
      key: 'platforms',
      header: 'Plataformas',
      render: (post) => (
        <div className="history-platforms">
          {(post.selectedPlatforms ?? []).slice(0, 4).map((platform) => (
            <span key={platform} style={{ color: PLATFORM_COLORS[platform] ?? '#a78bfa', background: `${PLATFORM_COLORS[platform] ?? '#a78bfa'}18` }}>
              {PLATFORM_LABELS[platform] ?? platform}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'media',
      header: 'Midia',
      render: (post) => post.mediaType ?? 'Texto',
    },
    {
      key: 'ai',
      header: 'Adaptado',
      render: (post) => <span className="status-chip" data-status={post.adaptedContent ? 'success' : 'pending'}>{post.adaptedContent ? 'Sim' : 'Nao'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (post) => {
        const status = statusDisplay[getPostStatus(post)];
        const StatusIcon = status.icon;
        return <span className="status-chip" data-status={status.tone}><StatusIcon size={12} />{status.label}</span>;
      },
    },
  ];

  const filterGroups = [
    {
      label: 'Plataforma',
      value: platformFilter,
      setValue: (value: string) => setPlatformFilter(value as 'all' | Platform),
      items: ['all', ...allPlatforms].map((platform) => ({ value: platform, label: platform === 'all' ? 'Todas' : PLATFORM_LABELS[platform] ?? platform })),
    },
    {
      label: 'Status',
      value: statusFilter,
      setValue: (value: string) => setStatusFilter(value as StatusFilter),
      items: [
        { value: 'all', label: 'Todos' },
        { value: 'published', label: 'Publicados' },
        { value: 'mocked', label: 'Demo' },
        { value: 'error', label: 'Erro' },
      ],
    },
    {
      label: 'Midia',
      value: mediaFilter,
      setValue: (value: string) => setMediaFilter(value as MediaFilter),
      items: [
        { value: 'all', label: 'Todos' },
        { value: 'text', label: 'Texto' },
        { value: 'image', label: 'Imagem' },
        { value: 'video', label: 'Video' },
      ],
    },
  ];

  return (
    <Layout>
      <div className="pf-page contents-page">
        <PageHeader
          eyebrow={<><FileText size={14} /> Biblioteca editorial</>}
          title="Conteudos"
          description="Todas as publicacoes em uma tabela responsiva que vira cards no celular."
          actions={
            <Link to="/composer" style={{ textDecoration: 'none' }}>
              <GlassButton variant="primary"><Send size={16} /> Novo post</GlassButton>
            </Link>
          }
        />

        {loading ? (
          <div className="loading-state">
            <div className="animate-spin" />
            <span>Carregando conteudos...</span>
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={<FileText size={30} />}
            title="Nenhum conteudo ainda"
            description="Crie seu primeiro post no compositor para ve-lo aqui."
            action={
              <Link to="/composer" style={{ textDecoration: 'none' }}>
                <GlassButton variant="primary"><PenSquare size={16} /> Criar post</GlassButton>
              </Link>
            }
          />
        ) : (
          <>
            <div className="metric-grid">
              <MetricCard label="Total" value={posts.length} icon={<FileText size={20} />} accent="#5aa7ff" />
              <MetricCard label="Publicados" value={totalPublished} icon={<CheckCircle size={20} />} accent="#34d399" />
              <MetricCard label="Com midia" value={withMedia} icon={<FileText size={20} />} accent="#a78bfa" />
              <MetricCard label="Adaptados IA" value={withAI} icon={<Send size={20} />} accent="#4ff7dd" />
            </div>

            <DataPanel title="Tabela de conteudos" description={`${filtered.length} resultado(s) no filtro atual`}>
              <div className="contents-filter-stack">
                <div className="history-search-chip"><Filter size={15} /><span>Filtros</span></div>
                {filterGroups.map((group) => (
                  <div className="contents-filter-group" key={group.label}>
                    <span>{group.label}</span>
                    <div className="segmented-control">
                      {group.items.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          className={group.value === item.value ? 'active' : ''}
                          onClick={() => group.setValue(item.value)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {filtered.length === 0 ? (
                <EmptyState
                  icon={<Filter size={30} />}
                  title="Nenhum post encontrado"
                  description="Ajuste filtros para ampliar os resultados."
                />
              ) : (
                <ResponsiveTable
                  rows={filtered}
                  columns={columns}
                  getRowKey={(post, index) => post.id ?? String(index)}
                  renderCard={(post) => {
                    const status = statusDisplay[getPostStatus(post)];
                    const StatusIcon = status.icon;
                    return (
                      <div className="history-mobile-card">
                        <div className="history-content-cell">
                          <strong>{post.baseText ?? '(sem texto)'}</strong>
                          <span>{post.createdAt instanceof Date ? post.createdAt.toLocaleDateString('pt-BR') : '-'}</span>
                        </div>
                        <div className="history-platforms">
                          {(post.selectedPlatforms ?? []).map((platform) => (
                            <span key={platform} style={{ color: PLATFORM_COLORS[platform] ?? '#a78bfa', background: `${PLATFORM_COLORS[platform] ?? '#a78bfa'}18` }}>
                              {PLATFORM_LABELS[platform] ?? platform}
                            </span>
                          ))}
                        </div>
                        <span className="status-chip" data-status={status.tone}><StatusIcon size={12} />{status.label}</span>
                      </div>
                    );
                  }}
                />
              )}
            </DataPanel>
          </>
        )}
      </div>
    </Layout>
  );
}
