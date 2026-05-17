import { useState } from 'react';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import { Video, Eye, ThumbsUp, TrendingUp, PenSquare, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: '#ff0050', instagram: '#e1306c', youtube: '#ff0000', discord: '#5865f2',
};

const DEMO_REELS = [
  { id: '1', title: 'Como usar o Post Alpha', platform: 'tiktok', status: 'mocked', duration: '0:30' },
  { id: '2', title: 'Lançamento — Post Alpha v2', platform: 'instagram', status: 'mocked', duration: '0:15' },
  { id: '3', title: 'Tutorial: publique em 8 plataformas', platform: 'youtube', status: 'mocked', duration: '3:20' },
];

export function Reels() {
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  const filtered = platformFilter === 'all'
    ? DEMO_REELS
    : DEMO_REELS.filter((r) => r.platform === platformFilter);

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <motion.div style={{ marginBottom: 24 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 5 }}>
            <span style={{ background: 'linear-gradient(90deg, #FF4757, #FF9F0A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Reels
            </span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Gerencie seus vídeos curtos em todas as plataformas</p>
        </motion.div>

        {/* Notice */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14, marginBottom: 20, background: 'rgba(59,110,255,0.06)', border: '0.5px solid rgba(59,110,255,0.18)' }}
        >
          <Video size={15} style={{ color: '#7EB8FF', flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Dados demo</span> — Conecte TikTok, Instagram ou YouTube em{' '}
            <a href="/settings" style={{ color: '#7EB8FF', fontWeight: 500 }}>Configurações</a> para ver seus reels reais.
          </p>
        </motion.div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            style={{ height: 36, padding: '0 12px', borderRadius: 10, border: '0.5px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontSize: 13, outline: 'none', cursor: 'pointer' }}
          >
            <option value="all" style={{ background: '#020818' }}>Todas as plataformas</option>
            <option value="tiktok" style={{ background: '#020818' }}>TikTok</option>
            <option value="instagram" style={{ background: '#020818' }}>Instagram</option>
            <option value="youtube" style={{ background: '#020818' }}>YouTube</option>
          </select>
          <div style={{ flex: 1 }} />
          <Link to="/composer" style={{ textDecoration: 'none' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #3B6EFF, #1A5CFF)', color: '#fff', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,110,255,0.35)' }}>
              <PenSquare size={13} /> Novo vídeo
            </button>
          </Link>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Video size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Nenhum reel encontrado</p>
            <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)' }}>Tente outro filtro ou crie um novo vídeo</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {filtered.map((reel, i) => (
              <motion.div
                key={reel.id}
                className="glass-card"
                style={{ overflow: 'hidden', cursor: 'pointer' }}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    position: 'relative', height: 180,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${PLATFORM_COLORS[reel.platform] ?? '#8b5cf6'}12`,
                    borderBottom: '0.5px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${PLATFORM_COLORS[reel.platform] ?? '#8b5cf6'}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Play size={24} style={{ color: PLATFORM_COLORS[reel.platform] ?? '#8b5cf6', marginLeft: 3 }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{reel.duration}</span>
                  </div>
                  <div style={{ position: 'absolute', top: 10, left: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, color: PLATFORM_COLORS[reel.platform] ?? '#8b5cf6', background: `${PLATFORM_COLORS[reel.platform] ?? '#8b5cf6'}20`, border: `0.5px solid ${PLATFORM_COLORS[reel.platform] ?? '#8b5cf6'}40` }}>
                      {reel.platform.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ position: 'absolute', top: 10, right: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: 'rgba(255,216,77,0.12)', color: '#FFD84D', border: '0.5px solid rgba(255,216,77,0.25)' }}>
                      Demo
                    </span>
                  </div>
                </div>

                <div style={{ padding: 16 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reel.title}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center' }}>
                    {[{ icon: Eye, label: 'Views' }, { icon: ThumbsUp, label: 'Likes' }, { icon: TrendingUp, label: 'Taxa' }].map(({ icon: Icon, label }) => (
                      <div key={label}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: 'var(--text-tertiary)', marginBottom: 3 }}>
                          <Icon size={11} />
                          <span style={{ fontSize: 10 }}>{label}</span>
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>—</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
