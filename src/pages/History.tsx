import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { CalendarRange, FileText, PenSquare, Search, SlidersHorizontal } from 'lucide-react';
import { Layout } from '../components/Layout';
import { PublishStatusBadge } from '../components/StatusBadge';
import { DataPanel } from '../components/ui/DataPanel';
import { EmptyState } from '../components/ui/EmptyState';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput, GlassSelect } from '../components/ui/GlassInput';
import { MetricCard } from '../components/ui/MetricCard';
import { PageHeader } from '../components/ui/PageHeader';
import { ResponsiveTable, type ResponsiveColumn } from '../components/ui/ResponsiveTable';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { formatDate } from '../lib/utils';
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

function getPostStatus(post: PublishedPost) {
  const statuses = Object.values(post.results ?? {}).map((result) => result.status);
  if (statuses.some((status) => status === 'published')) return 'published';
  if (statuses.some((status) => status === 'error')) return 'error';
  if (statuses.some((status) => status === 'mocked')) return 'mocked';
  return 'pending';
}

export function History() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PublishedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

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
        console.error('History load error:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const allPlatforms = useMemo(() => Array.from(new Set(posts.flatMap((post) => post.selectedPlatforms))), [posts]);

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const textOk = !search.trim() || post.baseText.toLowerCase().includes(search.toLowerCase());
      const platformOk = platformFilter === 'all' || post.selectedPlatforms.includes(platformFilter as Platform);
      const statusOk = statusFilter === 'all' || getPostStatus(post) === statusFilter;
      const created = post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt);
      const fromOk = !dateFrom || created >= new Date(`${dateFrom}T00:00:00`);
      const toOk = !dateTo || created <= new Date(`${dateTo}T23:59:59`);
      return textOk && platformOk && statusOk && fromOk && toOk;
    });
  }, [dateFrom, dateTo, platformFilter, posts, search, statusFilter]);

  const metrics = [
    { label: 'Registros', value: posts.length, icon: <FileText size={20} />, color: 'var(--accent)' },
    { label: 'Publicados', value: posts.filter((post) => getPostStatus(post) === 'published').length, icon: <PenSquare size={20} />, color: 'var(--success)' },
    { label: 'Pendentes', value: posts.filter((post) => getPostStatus(post) === 'pending').length, icon: <CalendarRange size={20} />, color: 'var(--warning)' },
  ];

  const columns: ResponsiveColumn<PublishedPost>[] = [
    {
      key: 'content',
      header: 'Conteudo',
      render: (post) => (
        <div className="history-content-cell">
          <strong>{post.baseText || '(sem texto)'}</strong>
          <span>{formatDate(post.createdAt)}</span>
        </div>
      ),
    },
    {
      key: 'platforms',
      header: 'Plataformas',
      render: (post) => (
        <div className="history-platforms">
          {post.selectedPlatforms.map((platform: Platform) => (
            <span
              key={platform}
              style={{
                color: PLATFORM_COLORS[platform] ?? 'var(--text-secondary)',
                background: `${PLATFORM_COLORS[platform] ?? '#94a3b8'}18`,
              }}
            >
              {platform}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Data',
      render: (post) => formatDate(post.createdAt),
    },
    {
      key: 'status',
      header: 'Status',
      render: (post) => (
        <div className="history-status-list">
          {Object.entries(post.results ?? {})
            .filter(([platform]) => post.selectedPlatforms.includes(platform as Platform))
            .map(([platform, result]) => (
              <PublishStatusBadge key={platform} status={result.status} size="sm" />
            ))}
          {Object.keys(post.results ?? {}).length === 0 && <span className="status-chip" data-status="pending">Pendente</span>}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="pf-page">
        <PageHeader
          eyebrow={<><CalendarRange size={14} /> Logs e publicacoes</>}
          title="Historico"
          description="Acompanhe publicacoes, tentativas de envio, status por plataforma e filtros de auditoria em um painel responsivo."
          actions={
            <Link to="/composer" style={{ textDecoration: 'none' }}>
              <GlassButton variant="primary"><PenSquare size={16} /> Nova publicacao</GlassButton>
            </Link>
          }
        />

        <div className="metric-grid">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={loading ? '-' : metric.value}
              icon={metric.icon}
              accent={metric.color}
            />
          ))}
        </div>

        <DataPanel
          title="Historico de atividade"
          description={`${filtered.length} resultado(s) encontrados`}
          tools={
            <>
              <GlassInput
                aria-label="Buscar publicacoes"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar publicacoes..."
                style={{ minWidth: 240 }}
              />
              <GlassSelect aria-label="Filtrar status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">Todos os status</option>
                <option value="published">Publicado</option>
                <option value="mocked">Demo</option>
                <option value="error">Erro</option>
                <option value="pending">Pendente</option>
              </GlassSelect>
            </>
          }
        >
          <div className="history-filter-grid">
            <div className="history-search-chip">
              <Search size={15} />
              <span>Filtros</span>
            </div>
            <GlassSelect aria-label="Filtrar plataforma" value={platformFilter} onChange={(event) => setPlatformFilter(event.target.value)}>
              <option value="all">Todas as plataformas</option>
              {allPlatforms.map((platform) => (
                <option key={platform} value={platform}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</option>
              ))}
            </GlassSelect>
            <GlassInput aria-label="Data inicial" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
            <GlassInput aria-label="Data final" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
            <GlassButton
              variant="ghost"
              onClick={() => {
                setSearch('');
                setPlatformFilter('all');
                setStatusFilter('all');
                setDateFrom('');
                setDateTo('');
              }}
            >
              <SlidersHorizontal size={15} /> Limpar
            </GlassButton>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="animate-spin" />
              <span>Carregando historico...</span>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<FileText size={30} />}
              title="Nenhuma publicacao encontrada"
              description={search || platformFilter !== 'all' || statusFilter !== 'all' || dateFrom || dateTo ? 'Ajuste os filtros para ampliar a busca.' : 'Crie sua primeira publicacao para preencher o historico.'}
              action={
                <Link to="/composer" style={{ textDecoration: 'none' }}>
                  <GlassButton variant="primary"><PenSquare size={16} /> Nova publicacao</GlassButton>
                </Link>
              }
            />
          ) : (
            <ResponsiveTable
              rows={filtered}
              columns={columns}
              getRowKey={(post, index) => post.id ?? String(index)}
              renderCard={(post) => (
                <div className="history-mobile-card">
                  <div className="history-content-cell">
                    <strong>{post.baseText || '(sem texto)'}</strong>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  <div className="history-platforms">
                    {post.selectedPlatforms.map((platform: Platform) => (
                      <span
                        key={platform}
                        style={{
                          color: PLATFORM_COLORS[platform] ?? 'var(--text-secondary)',
                          background: `${PLATFORM_COLORS[platform] ?? '#94a3b8'}18`,
                        }}
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                  <div className="history-status-list">
                    {Object.entries(post.results ?? {})
                      .filter(([platform]) => post.selectedPlatforms.includes(platform as Platform))
                      .map(([platform, result]) => (
                        <PublishStatusBadge key={platform} status={result.status} size="sm" />
                      ))}
                  </div>
                </div>
              )}
            />
          )}
        </DataPanel>
      </div>
    </Layout>
  );
}
