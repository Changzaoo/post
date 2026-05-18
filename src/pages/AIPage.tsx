import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Sparkles, RefreshCw, TrendingUp, AlertTriangle, Zap, Target, Users, BarChart3, Clock, ChevronRight } from 'lucide-react';
import type { PublishedPost } from '../types';

interface AISuggestion {
  id: string;
  type: 'warning' | 'opportunity' | 'action' | 'insight';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  path: string;
  icon: React.ElementType;
}

const staticSuggestions: AISuggestion[] = [
  {
    id: '1', type: 'action', priority: 'high',
    title: 'Adapte o conteúdo para cada plataforma',
    description: 'Usar o botão "Adaptar para plataformas" no Compositor aumenta significativamente o alcance, pois cada rede tem um formato ideal de texto, hashtags e comprimento.',
    action: 'Ir ao Compositor', path: '/composer', icon: Zap,
  },
  {
    id: '2', type: 'opportunity', priority: 'high',
    title: 'Publique vídeos curtos para maior alcance',
    description: 'Posts com vídeo (reels, shorts) geram até 3× mais engajamento que posts de texto. Experimente adicionar vídeos curtos de 15–30 segundos.',
    action: 'Ver Reels', path: '/reels', icon: TrendingUp,
  },
  {
    id: '3', type: 'insight', priority: 'medium',
    title: 'Mantenha uma frequência consistente',
    description: 'Publicar regularmente (3–5 vezes por semana) é o principal fator de crescimento de audiência. Confira sua frequência na página de Retenção.',
    action: 'Ver Retenção', path: '/retencao', icon: BarChart3,
  },
  {
    id: '4', type: 'action', priority: 'medium',
    title: 'Organize suas publicações em campanhas',
    description: 'Agrupar posts em campanhas temáticas ajuda a medir o impacto de cada estratégia e facilita a análise de resultados por período ou objetivo.',
    action: 'Ver Campanhas', path: '/campanhas', icon: Target,
  },
  {
    id: '5', type: 'warning', priority: 'high',
    title: 'Conecte suas plataformas para publicação real',
    description: 'Sem as integrações configuradas, seus posts ficam no modo "demo". Acesse Configurações para conectar Instagram, TikTok, Telegram e outros.',
    action: 'Ir a Configurações', path: '/settings', icon: AlertTriangle,
  },
  {
    id: '6', type: 'opportunity', priority: 'medium',
    title: 'Use hashtags estratégicas',
    description: 'Hashtags relevantes e de nicho aumentam o alcance orgânico. Use entre 5 e 15 hashtags no Instagram e TikTok, e menos de 3 no LinkedIn e X.',
    action: 'Criar post', path: '/composer', icon: Users,
  },
  {
    id: '7', type: 'insight', priority: 'low',
    title: 'Revise o Checklist de Conversão',
    description: 'O checklist contém os itens essenciais para maximizar conversões do seu funil. Complete os itens de alto impacto primeiro.',
    action: 'Ver Checklist', path: '/checklist', icon: BarChart3,
  },
  {
    id: '8', type: 'action', priority: 'medium',
    title: 'Explore as Estratégias recomendadas',
    description: 'A seção Estratégias contém frameworks comprovados de funil, conteúdo e retenção. Escolha um template e aplique ao seu negócio.',
    action: 'Ver Estratégias', path: '/estrategias', icon: Target,
  },
];

const typeConfig = {
  warning:     { label: 'Alerta',       color: '#FF4757', bg: 'rgba(255,71,87,0.08)',    border: 'rgba(255,71,87,0.18)',    icon: AlertTriangle },
  opportunity: { label: 'Oportunidade', color: '#10D97A', bg: 'rgba(16,217,122,0.07)',   border: 'rgba(16,217,122,0.18)',   icon: TrendingUp },
  action:      { label: 'Ação',         color: '#3B6EFF', bg: 'rgba(59,110,255,0.08)',   border: 'rgba(59,110,255,0.18)',   icon: Zap },
  insight:     { label: 'Insight',      color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)',   border: 'rgba(139,92,246,0.18)',   icon: Sparkles },
};

const priorityConfig = {
  critical: { label: 'Crítico', color: '#FF4757' },
  high:     { label: 'Alto',    color: '#FFD84D' },
  medium:   { label: 'Médio',   color: '#20F5D8' },
  low:      { label: 'Baixo',   color: '#94A3B8' },
};

export function AIPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PublishedPost[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'warning' | 'opportunity' | 'action' | 'insight'>('all');

  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, 'publishedPosts'), where('userId', '==', user.uid))).then(snap => {
      setPosts(snap.docs.map(d => ({ ...d.data(), id: d.id } as PublishedPost)));
    });
  }, [user]);

  const totalPosts = posts.length;
  const publishedOk = posts.filter(p => Object.values(p.results ?? {}).some(r => r.status === 'published')).length;
  const withAI = posts.filter(p => p.adaptedContent !== null).length;

  const suggestions = totalPosts === 0
    ? staticSuggestions
    : staticSuggestions.filter(s => {
        if (s.id === '5' && publishedOk > 0) return false;
        return true;
      });

  const active = suggestions.filter(s => !dismissed.has(s.id) && (filter === 'all' || s.type === filter));

  const handleRefresh = () => {
    setLoading(true);
    setDismissed(new Set());
    setTimeout(() => setLoading(false), 900);
  };

  return (
    <Layout>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <motion.div style={{ marginBottom: 24 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em' }}>
                  <span style={{ background: 'linear-gradient(90deg, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Sugestões Inteligentes</span>
                </h1>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: 'rgba(32,245,216,0.10)', color: '#20F5D8', border: '0.5px solid rgba(32,245,216,0.22)' }}>Beta</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Recomendações baseadas nos seus dados de publicação</p>
            </div>
            <button
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.10)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw size={14} style={{ animation: loading ? 'spin 0.9s linear infinite' : 'none' }} />
              {loading ? 'Atualizando...' : 'Atualizar sugestões'}
            </button>
          </div>
        </motion.div>

        <motion.div
          style={{ marginBottom: 22, padding: '16px 20px', borderRadius: 16, background: 'linear-gradient(90deg, rgba(139,92,246,0.10), rgba(59,110,255,0.08))', border: '0.5px solid rgba(139,92,246,0.20)', display: 'flex', alignItems: 'center', gap: 14 }}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sparkles size={22} style={{ color: '#A78BFA' }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              Análise baseada nos seus dados reais
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              {totalPosts} posts publicados · {publishedOk} confirmados · {withAI} adaptados com IA
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10D97A', animation: 'pulse-dot 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, color: '#10D97A', fontWeight: 600 }}>Ao vivo</span>
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 22 }}>
          {[
            { label: 'Sugestões', value: suggestions.length, color: '#8B5CF6', bg: 'rgba(139,92,246,0.09)' },
            { label: 'Alertas', value: suggestions.filter(s => s.type === 'warning').length, color: '#FF4757', bg: 'rgba(255,71,87,0.09)' },
            { label: 'Oportunidades', value: suggestions.filter(s => s.type === 'opportunity').length, color: '#10D97A', bg: 'rgba(16,217,122,0.08)' },
            { label: 'Ações', value: suggestions.filter(s => s.type === 'action').length, color: '#3B6EFF', bg: 'rgba(59,110,255,0.09)' },
          ].map((s, i) => (
            <motion.div key={s.label} style={{ padding: '14px 16px', borderRadius: 14, background: s.bg, border: `0.5px solid ${s.color}22`, textAlign: 'center' }}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06 }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color, letterSpacing: '-0.03em' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 3 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
          {([
            { value: 'all', label: 'Todas' },
            { value: 'warning', label: 'Alertas' },
            { value: 'opportunity', label: 'Oportunidades' },
            { value: 'action', label: 'Ações' },
            { value: 'insight', label: 'Insights' },
          ] as const).map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{ padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 150ms', ...(filter === f.value ? { background: 'linear-gradient(135deg, #3B6EFF, #1A5CFF)', color: '#fff' } : { background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '0.5px solid rgba(255,255,255,0.10)' }) }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {active.map((suggestion, i) => {
            const tc = typeConfig[suggestion.type];
            const pc = priorityConfig[suggestion.priority];
            return (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.05, duration: 0.28 }}
                style={{ padding: '18px 20px', borderRadius: 16, background: tc.bg, border: `0.5px solid ${tc.border}` }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: `${tc.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <suggestion.icon size={19} style={{ color: tc.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{suggestion.title}</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: `${tc.color}14`, color: tc.color, border: `0.5px solid ${tc.color}28` }}>{tc.label}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: `${pc.color}14`, color: pc.color, border: `0.5px solid ${pc.color}28` }}>{pc.label}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>{suggestion.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <a href={suggestion.path} style={{ textDecoration: 'none' }}>
                        <button style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: `${tc.color}18`, color: tc.color, border: `0.5px solid ${tc.color}28`, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          {suggestion.action} <ChevronRight size={12} />
                        </button>
                      </a>
                      <button
                        onClick={() => setDismissed(prev => new Set(prev).add(suggestion.id))}
                        style={{ padding: '6px 10px', borderRadius: 8, background: 'transparent', border: 'none', fontSize: 12, color: 'var(--text-tertiary)', cursor: 'pointer' }}
                      >
                        Dispensar
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {active.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <Sparkles size={40} style={{ color: 'var(--text-tertiary)', margin: '0 auto 14px' }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Nenhuma sugestão disponível</div>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Clique em "Atualizar sugestões" para recarregar</div>
          </div>
        )}

        <motion.div
          style={{ marginTop: 24, padding: '18px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 14 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        >
          <Clock size={20} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 2 }}>IA Preditiva em Breve</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Este módulo está preparado para integrar com Claude ou GPT-4 para sugestões preditivas e personalizadas baseadas nos seus dados históricos.</div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
