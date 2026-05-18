import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FileText, Send, CheckCircle, Clock, XCircle, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PublishedPost, Platform } from '../types';

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

type StatusFilter = 'all' | 'published' | 'mocked' | 'error';
type MediaFilter = 'all' | 'image' | 'video' | 'text';

function getPostStatus(post: PublishedPost): 'published' | 'mocked' | 'error' | 'pending' {
  const statuses = Object.values(post.results ?? {}).map(r => r.status);
  if (statuses.some(s => s === 'published')) return 'published';
  if (statuses.some(s => s === 'error')) return 'error';
  if (statuses.some(s => s === 'mocked')) return 'mocked';
  return 'pending';
}

const statusDisplay = {
  published: { label: 'Publicado', color: '#10D97A', bg: 'rgba(16,217,122,0.10)', icon: CheckCircle },
  mocked:    { label: 'Demo',      color: '#FFD84D', bg: 'rgba(255,216,77,0.09)',  icon: Clock },
  error:     { label: 'Erro',      color: '#FF4757', bg: 'rgba(255,71,87,0.09)',   icon: XCircle },
  pending:   { label: 'Pendente',  color: '#94A3B8', bg: 'rgba(148,163,184,0.08)', icon: Clock },
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
    getDocs(
      query(collection(db, 'publishedPosts'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'))
    ).then(snap => {
      setPosts(snap.docs.map(d => {
        const data = d.data();
        return { ...data, id: d.id, createdAt: data.createdAt?.toDate?.() ?? new Date() } as PublishedPost;
      }));
    }).finally(() => setLoading(false));
  }, [user]);

  const allPlatforms = Array.from(new Set(posts.flatMap(p => p.selectedPlatforms ?? [])));

  const filtered = posts.filter(p => {
    const platformOk = platformFilter === 'all' || (p.selectedPlatforms ?? []).includes(platformFilter);
    const postStatus = getPostStatus(p);
    const statusOk = statusFilter === 'all' || postStatus === statusFilter;
    const mediaOk = mediaFilter === 'all' || (mediaFilter === 'text' ? !p.mediaType : p.mediaType === mediaFilter);
    return platformOk && statusOk && mediaOk;
  });

  const totalPublished = posts.filter(p => getPostStatus(p) === 'published').length;
  const withMedia = posts.filter(p => p.mediaType !== null).length;
  const withAI = posts.filter(p => p.adaptedContent !== null).length;

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2.5px solid rgba(59,110,255,0.15)', borderTopColor: '#3B6EFF', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Carregando conteúdos...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div style={{ marginBottom: 24 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 5 }}>
                <span style={{ background: 'linear-gradient(90deg, #20F5D8, #3B6EFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Conteúdos</span>
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Todas as suas publicações em um só lugar</p>
            </div>
            <Link to="/composer" style={{ textDecoration: 'none' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(135deg, #3B6EFF, #1A5CFF)', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,110,255,0.35)' }}>
                <Send size={14} /> Novo Post
              </button>
            </Link>
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
          {[
            { label: 'Total', value: posts.length, color: '#3B6EFF', bg: 'rgba(59,110,255,0.09)', icon: FileText },
            { label: 'Publicados', value: totalPublished, color: '#10D97A', bg: 'rgba(16,217,122,0.08)', icon: CheckCircle },
            { label: 'Com Mídia', value: withMedia, color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', icon: FileText },
            { label: 'Adaptados IA', value: withAI, color: '#20F5D8', bg: 'rgba(32,245,216,0.08)', icon: Send },
          ].map((s, i) => (
            <motion.div key={s.label} className="glass-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <s.icon size={17} style={{ color: s.color }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <Filter size={13} style={{ color: 'var(--text-tertiary)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, marginRight: 4 }}>PLATAFORMA</span>
            {(['all', ...allPlatforms] as Array<'all' | Platform>).map(pl => (
              <button
                key={pl}
                onClick={() => setPlatformFilter(pl)}
                style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 150ms', ...(platformFilter === pl ? { background: 'linear-gradient(135deg, #3B6EFF, #1A5CFF)', color: '#fff' } : { background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '0.5px solid rgba(255,255,255,0.10)' }) }}
              >
                {pl === 'all' ? 'Todas' : PLATFORM_LABELS[pl] ?? pl}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, marginRight: 4, marginLeft: 17 }}>STATUS</span>
            {([['all', 'Todos'], ['published', 'Publicados'], ['mocked', 'Demo'], ['error', 'Com Erro']] as const).map(([v, l]) => (
              <button
                key={v}
                onClick={() => setStatusFilter(v as StatusFilter)}
                style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 150ms', ...(statusFilter === v ? { background: 'linear-gradient(135deg, #3B6EFF, #1A5CFF)', color: '#fff' } : { background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '0.5px solid rgba(255,255,255,0.10)' }) }}
              >
                {l}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, marginRight: 4, marginLeft: 17 }}>MÍDIA</span>
            {([['all', 'Todos'], ['text', 'Só texto'], ['image', 'Imagem'], ['video', 'Vídeo']] as const).map(([v, l]) => (
              <button
                key={v}
                onClick={() => setMediaFilter(v as MediaFilter)}
                style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 150ms', ...(mediaFilter === v ? { background: 'linear-gradient(135deg, #3B6EFF, #1A5CFF)', color: '#fff' } : { background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '0.5px solid rgba(255,255,255,0.10)' }) }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {posts.length === 0 ? (
          <motion.div className="glass-card" style={{ padding: 60, textAlign: 'center' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <FileText size={40} style={{ color: 'var(--text-tertiary)', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Nenhum conteúdo ainda</p>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 16 }}>Crie seu primeiro post no Compositor para vê-lo aqui.</p>
            <Link to="/composer" style={{ textDecoration: 'none' }}>
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #3B6EFF, #1A5CFF)', color: '#fff', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer' }}>
                <Send size={13} /> Criar post
              </button>
            </Link>
          </motion.div>
        ) : (
          <motion.div className="glass-card" style={{ overflow: 'hidden' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                    {['Conteúdo', 'Plataformas', 'Mídia', 'Adaptado', 'Data', 'Status'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((post, i) => {
                    const ps = getPostStatus(post);
                    const sd = statusDisplay[ps];
                    const StatusIcon = sd.icon;
                    return (
                      <motion.tr
                        key={post.id ?? i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)', transition: 'background 150ms' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(59,110,255,0.04)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = ''; }}
                      >
                        <td style={{ padding: '13px 16px', maxWidth: 260 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {post.baseText?.slice(0, 60) ?? '(sem texto)'}
                          </div>
                        </td>
                        <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {(post.selectedPlatforms ?? []).slice(0, 3).map(pl => (
                              <span key={pl} style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6, color: PLATFORM_COLORS[pl] ?? '#8b5cf6', background: `${PLATFORM_COLORS[pl] ?? '#8b5cf6'}18` }}>
                                {(PLATFORM_LABELS[pl] ?? pl).slice(0, 4).toUpperCase()}
                              </span>
                            ))}
                            {(post.selectedPlatforms ?? []).length > 3 && (
                              <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>+{(post.selectedPlatforms ?? []).length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '13px 16px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                          {post.mediaType ?? 'Texto'}
                        </td>
                        <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 8, ...(post.adaptedContent ? { color: '#20F5D8', background: 'rgba(32,245,216,0.10)' } : { color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.04)' }) }}>
                            {post.adaptedContent ? 'Sim' : 'Não'}
                          </span>
                        </td>
                        <td style={{ padding: '13px 16px', fontSize: 12, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                          {post.createdAt instanceof Date ? post.createdAt.toLocaleDateString('pt-BR') : '—'}
                        </td>
                        <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: sd.bg, color: sd.color }}>
                            <StatusIcon size={10} />
                            {sd.label}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Nenhum post encontrado para este filtro.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
