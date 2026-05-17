import { useState } from 'react';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, TrendingDown, TrendingUp, AlertTriangle, Zap, Target, Users, BarChart3, Clock, ChevronRight } from 'lucide-react';
import { funnelMetrics } from '../data/funnelData';
import { retentionMetrics } from '../data/retentionData';
import { campaigns } from '../data/campaignData';

interface AISuggestion {
  id: string;
  type: 'warning' | 'opportunity' | 'action' | 'insight';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  metric?: string;
  metricValue?: string;
  action: string;
  path: string;
  icon: React.ElementType;
}

const suggestions: AISuggestion[] = [
  {
    id: '1',
    type: 'warning',
    priority: 'critical',
    title: 'Taxa de conversão baixa na etapa de oferta',
    description: 'Apenas 52% dos leads que visualizaram a oferta avançaram para o checkout. Adicione prova social — depoimentos em vídeo e número de alunos — diretamente antes do CTA principal.',
    metric: 'Conversão Oferta → Checkout',
    metricValue: '52%',
    action: 'Otimizar página de oferta',
    path: '/funil',
    icon: AlertTriangle,
  },
  {
    id: '2',
    type: 'warning',
    priority: 'high',
    title: 'Público abandona nos primeiros 3 segundos',
    description: 'Seus dados mostram alta taxa de abandono inicial. Reforce o gancho nos primeiros 3 segundos — use uma afirmação provocadora ou revele a transformação imediatamente.',
    metric: 'Taxa de Abandono',
    metricValue: '32%',
    action: 'Melhorar gancho inicial',
    path: '/retencao',
    icon: TrendingDown,
  },
  {
    id: '3',
    type: 'opportunity',
    priority: 'high',
    title: 'Etapa de lead com bom desempenho, mas falta nutrição',
    description: 'Você está capturando 3.472 leads mas apenas 42% avançam. Crie uma sequência de 3 a 5 conteúdos educativos enviados em 7 dias para elevar a taxa de avanço para 60%+.',
    metric: 'Taxa de Avanço Lead',
    metricValue: '42%',
    action: 'Criar sequência de nutrição',
    path: '/conteudos',
    icon: TrendingUp,
  },
  {
    id: '4',
    type: 'insight',
    priority: 'medium',
    title: 'Campanhas com promessa visual clara performam melhor',
    description: 'Das suas 6 campanhas ativas, as que usam imagem com texto de benefício no thumbnail têm 3x mais cliques. Aplique esse padrão em todas as novas campanhas.',
    metric: 'CTR Médio',
    metricValue: '+3x',
    action: 'Atualizar campanhas',
    path: '/campanhas',
    icon: BarChart3,
  },
  {
    id: '5',
    type: 'action',
    priority: 'high',
    title: 'Crie uma oferta de entrada para leads frios',
    description: 'Você tem 234 leads inativos há 14+ dias. Uma oferta de baixo ticket (R$ 27-97) com alta entrega de valor seria ideal para reativar esses leads e qualificá-los para ofertas maiores.',
    metric: 'Leads Inativos',
    metricValue: '234',
    action: 'Criar oferta de entrada',
    path: '/estrategias',
    icon: Zap,
  },
  {
    id: '6',
    type: 'opportunity',
    priority: 'medium',
    title: 'Retenção semanal em crescimento — aproveite o momento',
    description: 'Sua retenção subiu de 58% para 70% nas últimas 8 semanas. Agora é o momento ideal para lançar uma comunidade paga ou upsell para quem mais engaja.',
    metric: 'Crescimento de Retenção',
    metricValue: '+12%',
    action: 'Ver estratégia de comunidade',
    path: '/estrategias',
    icon: Users,
  },
  {
    id: '7',
    type: 'action',
    priority: 'medium',
    title: 'TikTok é seu canal de maior alcance — aumente frequência',
    description: 'Seu conteúdo no TikTok gera 124k de alcance vs 48k no Instagram. Considere aumentar a frequência de posts no TikTok de 3 para 5 por semana.',
    metric: 'Alcance TikTok',
    metricValue: '124k',
    action: 'Planejar conteúdo TikTok',
    path: '/conteudos',
    icon: Target,
  },
  {
    id: '8',
    type: 'insight',
    priority: 'low',
    title: 'Ticket médio de R$ 497 está abaixo do potencial',
    description: 'Com sua taxa de retenção de 68% e base de leads qualificados, você tem audiência para ofertas de R$ 997+. Considere um produto premium para aumentar o LTV.',
    metric: 'Ticket Médio Atual',
    metricValue: 'R$ 497',
    action: 'Explorar estratégia de alto ticket',
    path: '/estrategias',
    icon: BarChart3,
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
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'warning' | 'opportunity' | 'action' | 'insight'>('all');

  const active = suggestions.filter(s => !dismissed.has(s.id) && (filter === 'all' || s.type === filter));

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <Layout>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Header */}
        <motion.div style={{ marginBottom: 24 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em' }}>
                  <span style={{ background: 'linear-gradient(90deg, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Sugestões Inteligentes</span>
                </h1>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: 'rgba(32,245,216,0.10)', color: '#20F5D8', border: '0.5px solid rgba(32,245,216,0.22)' }}>Beta</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Análise automatizada baseada nos seus dados de funil, retenção e campanhas</p>
            </div>
            <button
              className="btn btn-secondary btn-md"
              style={{ gap: 7 }}
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw size={14} style={{ animation: loading ? 'spin 0.9s linear infinite' : 'none' }} />
              {loading ? 'Analisando...' : 'Gerar novas sugestões'}
            </button>
          </div>
        </motion.div>

        {/* AI Context banner */}
        <motion.div
          style={{ marginBottom: 22, padding: '16px 20px', borderRadius: 16, background: 'linear-gradient(90deg, rgba(139,92,246,0.10), rgba(59,110,255,0.08))', border: '0.5px solid rgba(139,92,246,0.20)', display: 'flex', alignItems: 'center', gap: 14 }}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sparkles size={22} style={{ color: '#A78BFA' }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              Análise baseada em dados reais do seu painel
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              {funnelMetrics.totalVisitors.toLocaleString()} visitantes · {funnelMetrics.totalLeads.toLocaleString()} leads · {campaigns.filter(c => c.status === 'active').length} campanhas ativas · Retenção {retentionMetrics[0].value}%
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10D97A', animation: 'pulse-dot 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, color: '#10D97A', fontWeight: 600 }}>Conectado</span>
          </div>
        </motion.div>

        {/* Stats summary */}
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

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
          {([
            { value: 'all', label: 'Todas' },
            { value: 'warning', label: 'Alertas' },
            { value: 'opportunity', label: 'Oportunidades' },
            { value: 'action', label: 'Ações' },
            { value: 'insight', label: 'Insights' },
          ] as const).map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)} className={`btn btn-sm ${filter === f.value ? 'btn-primary' : 'btn-secondary'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Suggestion cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {active.map((suggestion, i) => {
            const tc = typeConfig[suggestion.type];
            const pc = priorityConfig[suggestion.priority];
            return (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, height: 0 }}
                transition={{ delay: i * 0.05, duration: 0.28 }}
                style={{ padding: '18px 20px', borderRadius: 16, background: tc.bg, border: `0.5px solid ${tc.border}`, position: 'relative' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  {/* Icon */}
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: `${tc.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <suggestion.icon size={19} style={{ color: tc.color }} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{suggestion.title}</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: `${tc.color}14`, color: tc.color, border: `0.5px solid ${tc.color}28` }}>{tc.label}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: `${pc.color}14`, color: pc.color, border: `0.5px solid ${pc.color}28` }}>{pc.label}</span>
                      </div>
                    </div>

                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>{suggestion.description}</p>

                    {suggestion.metric && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.07)', marginBottom: 14 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{suggestion.metric}:</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: tc.color }}>{suggestion.metricValue}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <a href={suggestion.path} style={{ textDecoration: 'none' }}>
                        <button className="btn btn-sm" style={{ background: `${tc.color}18`, color: tc.color, border: `0.5px solid ${tc.color}28`, gap: 5 }}>
                          {suggestion.action} <ChevronRight size={12} />
                        </button>
                      </a>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setDismissed(prev => new Set(prev).add(suggestion.id))}
                        style={{ color: 'var(--text-tertiary)' }}
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
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Clique em "Gerar novas sugestões" para analisar seus dados</div>
          </div>
        )}

        {/* Future AI banner */}
        <motion.div
          style={{ marginTop: 24, padding: '18px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 14 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        >
          <Clock size={20} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 2 }}>IA com Inteligência Real em Breve</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Este módulo está preparado para receber uma API de IA real (Claude, GPT-4) para sugestões personalizadas e preditivas baseadas nos seus dados históricos.</div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
