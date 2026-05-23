import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { PenSquare, Play, Video } from 'lucide-react';
import { Layout } from '../components/Layout';
import { DataPanel } from '../components/ui/DataPanel';
import { EmptyState } from '../components/ui/EmptyState';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassSelect } from '../components/ui/GlassInput';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import type { Platform, PublishedPost } from '../types';

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: '#ff0050',
  instagram: '#e1306c',
  youtube: '#ff0000',
  discord: '#5865f2',
  x: '#1da1f2',
  telegram: '#0088cc',
  linkedin: '#0077b5',
  facebook: '#1877f2',
};

const PLATFORM_LABELS: Record<string, string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube',
  discord: 'Discord',
  x: 'X',
  telegram: 'Telegram',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
};

export function Reels() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PublishedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  useEffect(() => {
    if (!user) return;

    getDocs(
      query(
        collection(db, 'publishedPosts'),
        where('userId', '==', user.uid),
        where('mediaType', '==', 'video'),
        orderBy('createdAt', 'desc')
      )
    ).then((snap) => {
      setPosts(snap.docs.map((item) => {
        const data = item.data();
        return { ...data, id: item.id, createdAt: data.createdAt?.toDate?.() ?? new Date() } as PublishedPost;
      }));
    }).finally(() => setLoading(false));
  }, [user]);

  const allPlatforms = useMemo(() => Array.from(new Set(posts.flatMap((post) => post.selectedPlatforms ?? []))), [posts]);
  const filtered = platformFilter === 'all'
    ? posts
    : posts.filter((post) => (post.selectedPlatforms ?? []).includes(platformFilter as Platform));

  return (
    <Layout>
      <div className="pf-page reels-page">
        <PageHeader
          eyebrow={<><Video size={14} /> Video short-form</>}
          title="Reels"
          description="Biblioteca de videos publicados e prontos para analise por plataforma."
          actions={
            <Link to="/composer" style={{ textDecoration: 'none' }}>
              <GlassButton variant="primary"><PenSquare size={16} /> Novo video</GlassButton>
            </Link>
          }
        />

        <DataPanel
          title="Videos"
          description={`${filtered.length} video(s) no filtro atual`}
          tools={
            <GlassSelect aria-label="Filtrar plataforma" value={platformFilter} onChange={(event) => setPlatformFilter(event.target.value)}>
              <option value="all">Todas as plataformas</option>
              {allPlatforms.map((platform) => (
                <option key={platform} value={platform}>{PLATFORM_LABELS[platform] ?? platform}</option>
              ))}
            </GlassSelect>
          }
        >
          {loading ? (
            <div className="loading-state">
              <div className="animate-spin" />
              <span>Carregando reels...</span>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Video size={32} />}
              title={posts.length === 0 ? 'Nenhum video publicado ainda' : 'Nenhum video para este filtro'}
              description={posts.length === 0 ? 'Publique um post com midia de video no compositor para ve-lo aqui.' : 'Tente outro filtro de plataforma.'}
              action={posts.length === 0 ? (
                <Link to="/composer" style={{ textDecoration: 'none' }}>
                  <GlassButton variant="primary"><PenSquare size={16} /> Criar video</GlassButton>
                </Link>
              ) : undefined}
            />
          ) : (
            <div className="reels-grid">
              {filtered.map((post, index) => {
                const firstPlatform = (post.selectedPlatforms ?? [])[0] ?? 'unknown';
                const color = PLATFORM_COLORS[firstPlatform] ?? '#a78bfa';
                const ok = Object.values(post.results ?? {}).filter((result) => result.status === 'published').length;
                const total = Object.values(post.results ?? {}).length;
                const dateStr = post.createdAt instanceof Date ? post.createdAt.toLocaleDateString('pt-BR') : '-';

                return (
                  <article className="reel-card glass-card" key={post.id ?? index}>
                    <div className="reel-card__media" style={{ background: `${color}14` }}>
                      {post.mediaUrl ? (
                        <video src={post.mediaUrl} muted preload="metadata" />
                      ) : (
                        <div className="reel-card__placeholder" style={{ color }}>
                          <Play size={24} />
                          <span>Sem preview</span>
                        </div>
                      )}
                      <div className="reel-card__chips">
                        {(post.selectedPlatforms ?? []).slice(0, 3).map((platform) => (
                          <span key={platform} style={{ color: PLATFORM_COLORS[platform] ?? color, background: `${PLATFORM_COLORS[platform] ?? color}20` }}>
                            {(PLATFORM_LABELS[platform] ?? platform).toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="reel-card__body">
                      <strong>{post.baseText ?? '(sem texto)'}</strong>
                      <div>
                        <span>{dateStr}</span>
                        <span className="status-chip" data-status={ok > 0 ? 'success' : 'pending'}>{ok}/{total} plataformas</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </DataPanel>
      </div>
    </Layout>
  );
}
