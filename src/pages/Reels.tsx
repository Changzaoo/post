import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Video, Play, PenSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PublishedPost } from '../types';

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: '#ff0050', instagram: '#e1306c', youtube: '#ff0000',
  discord: '#5865f2', x: '#1da1f2', telegram: '#0088cc',
};

const PLATFORM_LABELS: Record<string, string> = {
  tiktok: 'TikTok', instagram: 'Instagram', youtube: 'YouTube',
  discord: 'Discord', x: 'X', telegram: 'Telegram',
  linkedin: 'LinkedIn', facebook: 'Facebook',
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
        orderBy('createdAt', 'desc'),
      )
    ).then(snap => {
      setPosts(snap.docs.map(d => {
        const data = d.data();
        return { ...data, id: d.id, createdAt: data.createdAt?.toDate?.() ?? new Date() } as PublishedPost;
      }));
    }).finally(() => setLoading(false));
  }, [user]);

  const allPlatforms = Array.from(new Set(posts.flatMap(p => p.selectedPlatforms ?? [])));

  const filtered = platformFilter === 'all'
    ? posts
    : posts.filter(p => (p.selectedPlatforms ?? []).includes(platformFilter as any));

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2.5px solid rgba(59,110,255,0.15)', borderTopColor: '#3B6EFF', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Carregando reels...</p>
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
            <span style={{ background: 'linear-gradient(90deg, #FF4757, #FF9F0A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Reels
            </span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Seus vídeos publicados em todas as plataformas</p>
        </motion.div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            style={{ height: 36, padding: '0 12px', borderRadius: 10, border: '0.5px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontSize: 13, outline: 'none', cursor: 'pointer' }}
          >
            <option value="all" style={{ background: '#020818' }}>Todas as plataformas</option>
            {allPlatforms.map(pl => (
              <option key={pl} value={pl} style={{ background: '#020818' }}>{PLATFORM_LABELS[pl] ?? pl}</option>
            ))}
          </select>
          <div style={{ flex: 1 }} />
          <Link to="/composer" style={{ textDecoration: 'none' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #3B6EFF, #1A5CFF)', color: '#fff', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,110,255,0.35)' }}>
              <PenSquare size={13} /> Novo vídeo
            </button>
          </Link>
        </div>

        {filtered.length === 0 ? (
          <motion.div
            className="glass-card"
            style={{ padding: 60, textAlign: 'center' }}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          >
            <Video size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              {posts.length === 0 ? 'Nenhum vídeo publicado ainda' : 'Nenhum vídeo para este filtro'}
            </p>
            <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginBottom: 16 }}>
              {posts.length === 0
                ? 'Publique um post com mídia de vídeo no Compositor para vê-lo aqui.'
                : 'Tente outro filtro de plataforma.'}
            </p>
            {posts.length === 0 && (
              <Link to="/composer" style={{ textDecoration: 'none' }}>
                <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #3B6EFF, #1A5CFF)', color: '#fff', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer' }}>
                  <PenSquare size={13} /> Criar vídeo
                </button>
              </Link>
            )}
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {filtered.map((post, i) => {
              const firstPlatform = (post.selectedPlatforms ?? [])[0] ?? 'unknown';
              const color = PLATFORM_COLORS[firstPlatform] ?? '#8b5cf6';
              const ok = Object.values(post.results ?? {}).filter(r => r.status === 'published').length;
              const total = Object.values(post.results ?? {}).length;
              const dateStr = post.createdAt instanceof Date
                ? post.createdAt.toLocaleDateString('pt-BR')
                : '—';
              return (
                <motion.div
                  key={post.id ?? i}
                  className="glass-card"
                  style={{ overflow: 'hidden' }}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                >
                  <div style={{ position: 'relative', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}12`, borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                    {post.mediaUrl ? (
                      <video
                        src={post.mediaUrl}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        muted
                        preload="metadata"
                      />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Play size={22} style={{ color, marginLeft: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Sem pré-visualização</span>
                      </div>
                    )}
                    <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(post.selectedPlatforms ?? []).slice(0, 2).map(pl => (
                        <span key={pl} style={{ fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 20, color: PLATFORM_COLORS[pl] ?? '#8b5cf6', background: `${PLATFORM_COLORS[pl] ?? '#8b5cf6'}20`, border: `0.5px solid ${PLATFORM_COLORS[pl] ?? '#8b5cf6'}40` }}>
                          {(PLATFORM_LABELS[pl] ?? pl).toUpperCase()}
                        </span>
                      ))}
                    </div>
                    <div style={{ position: 'absolute', top: 10, right: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: ok > 0 ? 'rgba(16,217,122,0.12)' : 'rgba(255,216,77,0.12)', color: ok > 0 ? '#10D97A' : '#FFD84D', border: ok > 0 ? '0.5px solid rgba(16,217,122,0.30)' : '0.5px solid rgba(255,216,77,0.25)' }}>
                        {ok > 0 ? 'Publicado' : 'Pendente'}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: 16 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {post.baseText?.slice(0, 50) ?? '(sem texto)'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-tertiary)' }}>
                      <span>{dateStr}</span>
                      <span style={{ color: ok > 0 ? '#10D97A' : 'var(--text-tertiary)' }}>{ok}/{total} plataformas</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
