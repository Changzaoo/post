import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PublishStatusBadge } from '../components/StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { formatDate } from '../lib/utils';
import type { PublishedPost, Platform } from '../types';
import { FileText, PenSquare, Search, Grid, List } from 'lucide-react';

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#e1306c', tiktok: '#ff0050', x: '#1da1f2',
  telegram: '#0088cc', discord: '#5865f2', youtube: '#ff0000',
  linkedin: '#0077b5', facebook: '#1877f2',
};

type ViewMode = 'list' | 'grid';

export function History() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PublishedPost[]>([]);
  const [filtered, setFiltered] = useState<PublishedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

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
        const items = snap.docs.map((d) => ({
          id: d.id, ...d.data(),
          createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
        })) as PublishedPost[];
        setPosts(items);
        setFiltered(items);
      } catch (err) { console.error('History load error:', err); }
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  useEffect(() => {
    let result = posts;
    if (search.trim()) result = result.filter((p) => p.baseText.toLowerCase().includes(search.toLowerCase()));
    if (platformFilter !== 'all') result = result.filter((p) => p.selectedPlatforms.includes(platformFilter as Platform));
    setFiltered(result);
  }, [search, platformFilter, posts]);

  const allPlatforms = Array.from(new Set(posts.flatMap((p) => p.selectedPlatforms)));

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 h-9 px-3 rounded-xl border border-white/10 bg-white/5 flex-1 min-w-48 hover:border-white/18 transition-colors">
            <Search className="h-4 w-4 text-slate-500 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar publicações..."
              className="bg-transparent text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none flex-1"
            />
          </div>

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 hover:border-white/18 transition-colors"
          >
            <option value="all" className="bg-[#0d0d1a]">Todas as plataformas</option>
            {allPlatforms.map((p) => (
              <option key={p} value={p} className="bg-[#0d0d1a]">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>

          <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-0.5">
            <button
              onClick={() => setViewMode('list')}
              style={viewMode === 'list' ? { background: 'linear-gradient(135deg, #3B6EFF, #1A5CFF)', color: '#fff' } : {}}
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                viewMode === 'list' ? '' : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={viewMode === 'grid' ? { background: 'linear-gradient(135deg, #3B6EFF, #1A5CFF)', color: '#fff' } : {}}
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                viewMode === 'grid' ? '' : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
            </button>
          </div>

          <span className="text-sm text-slate-400">{filtered.length} resultado(s)</span>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Nenhuma publicação encontrada</p>
            <p className="text-sm text-slate-400 mt-1 mb-6">
              {search || platformFilter !== 'all' ? 'Tente ajustar os filtros' : 'Crie sua primeira publicação'}
            </p>
            <Link to="/composer">
              <Button variant="primary" size="sm" className="gap-2">
                <PenSquare className="h-4 w-4" /> Nova publicação
              </Button>
            </Link>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-2">
            {filtered.map((post) => (
              <Card key={post.id} hover>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {post.mediaUrl ? (
                      <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                        <img src={post.mediaUrl} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-white/5 border border-white/7 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-slate-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate mb-1">{post.baseText}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-slate-500">{formatDate(post.createdAt)}</span>
                        <span className="text-slate-600">·</span>
                        <div className="flex gap-1 flex-wrap">
                          {post.selectedPlatforms.map((p: Platform) => (
                            <span key={p} className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                              style={{ color: PLATFORM_COLORS[p] ?? '#94a3b8', backgroundColor: (PLATFORM_COLORS[p] ?? '#94a3b8') + '18' }}>
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      {Object.entries(post.results ?? {})
                        .filter(([p]) => post.selectedPlatforms.includes(p as Platform))
                        .map(([platform, result]) => (
                          <PublishStatusBadge key={platform} status={result.status} size="sm" />
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((post) => (
              <Card key={post.id} hover>
                <div className="h-36 rounded-t-2xl overflow-hidden bg-white/5 border-b border-white/7 flex items-center justify-center">
                  {post.mediaUrl ? (
                    <img src={post.mediaUrl} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <FileText className="h-8 w-8 text-slate-200" />
                  )}
                </div>
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-slate-200 line-clamp-2 mb-3">{post.baseText}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 flex-wrap">
                      {post.selectedPlatforms.map((p: Platform) => (
                        <span key={p} className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                          style={{ color: PLATFORM_COLORS[p] ?? '#94a3b8', backgroundColor: (PLATFORM_COLORS[p] ?? '#94a3b8') + '18' }}>
                          {p}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-slate-400">{post.createdAt.toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {Object.entries(post.results ?? {})
                      .filter(([p]) => post.selectedPlatforms.includes(p as Platform))
                      .map(([platform, result]) => (
                        <PublishStatusBadge key={platform} status={result.status} size="sm" />
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
