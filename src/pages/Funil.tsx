import { useState, useEffect, useMemo } from 'react';
import { Layout } from '../components/Layout';
import {
  Zap, Clock, Target, Star, Users, MousePointerClick,
  ShoppingCart, Eye, ArrowDown, Activity, Flame,
  CheckCircle2, XCircle, AlertCircle,
} from 'lucide-react';

/* ─── Tipos ─────────────────────────────────────────────── */
type Platform = 'instagram' | 'tiktok' | 'youtube' | 'x' | 'telegram' | 'discord' | 'linkedin' | 'facebook';

interface ContentSignal {
  key: string;
  label: string;
  detected: boolean;
  weight: number;
  tip: string;
}

interface FunnelStage {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
  glow: string;
  base: number;
  variance: number;
  dropoffLabel: string;
}

/* ─── Constantes ─────────────────────────────────────────── */
const PLATFORMS: Platform[] = ['instagram', 'tiktok', 'youtube', 'x', 'telegram', 'discord', 'linkedin', 'facebook'];

const PLATFORM_LOGOS: Record<Platform, string> = {
  tiktok:    'https://cdn.simpleicons.org/tiktok/ffffff',
  instagram: 'https://cdn.simpleicons.org/instagram/ffffff',
  x:         'https://cdn.simpleicons.org/x/ffffff',
  telegram:  'https://cdn.simpleicons.org/telegram/ffffff',
  discord:   'https://cdn.simpleicons.org/discord/ffffff',
  youtube:   'https://cdn.simpleicons.org/youtube/ffffff',
  linkedin:  'https://cdn.simpleicons.org/linkedin/ffffff',
  facebook:  'https://cdn.simpleicons.org/facebook/ffffff',
};

const PLATFORM_INFO: Record<Platform, {
  name: string; color: string; contentType: string;
  maxHashtags: number; optimalLength: string; bestFormats: string[];
  audienceNote: string;
}> = {
  instagram: { name: 'Instagram', color: '#E4405F', contentType: 'Visual / Carrossel', maxHashtags: 8,  optimalLength: '150–220 palavras', bestFormats: ['Carrossel', 'Reels', 'Stories'], audienceNote: 'Audiência reage melhor a conteúdo aspiracional e educativo' },
  tiktok:    { name: 'TikTok',    color: '#FF0050', contentType: 'Vídeo curto',         maxHashtags: 5,  optimalLength: '50–100 palavras',  bestFormats: ['Vídeo 15–60s', 'Duetos', 'Trends'], audienceNote: 'Hook nos 3 primeiros segundos é essencial para retenção' },
  youtube:   { name: 'YouTube',   color: '#FF0000', contentType: 'Vídeo longo',         maxHashtags: 3,  optimalLength: 'Título até 60 chars', bestFormats: ['Tutorial', 'Review', 'Vlog'], audienceNote: 'Thumbnails e título têm 70% do impacto no clique' },
  x:         { name: 'X',         color: '#1da1f2', contentType: 'Texto + Mídia',       maxHashtags: 3,  optimalLength: '71–100 caracteres', bestFormats: ['Thread', 'Poll', 'Imagem'], audienceNote: 'Tweets com imagem recebem 150% mais retweets' },
  telegram:  { name: 'Telegram',  color: '#26A5E4', contentType: 'Texto longo',         maxHashtags: 0,  optimalLength: '500–1500 chars',   bestFormats: ['Artigo', 'Newsletter', 'Arquivo'], audienceNote: 'Canal gera 3–5× mais alcance orgânico que grupo' },
  discord:   { name: 'Discord',   color: '#5865F2', contentType: 'Comunidade',          maxHashtags: 0,  optimalLength: '100–300 chars',    bestFormats: ['Anúncio', 'Q&A', 'Evento'], audienceNote: 'Mensagens com @here têm 90% de taxa de leitura' },
  linkedin:  { name: 'LinkedIn',  color: '#0A66C2', contentType: 'Profissional',        maxHashtags: 5,  optimalLength: '1300–2000 chars',  bestFormats: ['Artigo', 'Carrossel', 'Vaga'], audienceNote: 'Storytelling pessoal gera 3× mais engajamento' },
  facebook:  { name: 'Facebook',  color: '#1877F2', contentType: 'Misto',              maxHashtags: 3,  optimalLength: '40–80 palavras',   bestFormats: ['Vídeo', 'Imagem', 'Link'], audienceNote: 'Vídeos nativos têm 135% mais alcance que links externos' },
};

const STAGES: FunnelStage[] = [
  { key: 'impressoes', label: 'Impressões',  icon: Eye,              color: '#6366f1', glow: 'rgba(99,102,241,0.25)',  base: 14800, variance: 130, dropoffLabel: '' },
  { key: 'alcance',    label: 'Alcance',     icon: Users,            color: '#8b5cf6', glow: 'rgba(139,92,246,0.22)', base: 8420,  variance: 90,  dropoffLabel: '43%' },
  { key: 'engaj',      label: 'Engajamento', icon: Activity,         color: '#a78bfa', glow: 'rgba(167,139,250,0.2)', base: 1960,  variance: 35,  dropoffLabel: '77%' },
  { key: 'cliques',    label: 'Cliques',     icon: MousePointerClick,color: '#34d399', glow: 'rgba(52,211,153,0.2)',  base: 680,   variance: 14,  dropoffLabel: '65%' },
  { key: 'conv',       label: 'Conversões',  icon: ShoppingCart,     color: '#10b981', glow: 'rgba(16,185,129,0.25)', base: 193,   variance: 5,   dropoffLabel: '72%' },
];

/* ─── Heatmap ─────────────────────────────────────────────── */
type PeakDef = { day: number; hour: number; strength: number };

const PEAKS: Record<Platform, PeakDef[]> = {
  instagram: [
    { day: 1, hour: 8,  strength: 0.88 }, { day: 1, hour: 12, strength: 0.82 },
    { day: 2, hour: 19, strength: 1.00 }, { day: 3, hour: 9,  strength: 0.86 },
    { day: 4, hour: 18, strength: 0.92 }, { day: 5, hour: 11, strength: 0.87 },
    { day: 6, hour: 10, strength: 0.80 },
  ],
  tiktok: [
    { day: 0, hour: 20, strength: 0.93 }, { day: 1, hour: 7,  strength: 0.86 },
    { day: 2, hour: 21, strength: 1.00 }, { day: 3, hour: 19, strength: 0.90 },
    { day: 5, hour: 22, strength: 0.88 }, { day: 6, hour: 20, strength: 0.91 },
  ],
  youtube: [
    { day: 0, hour: 15, strength: 0.95 }, { day: 0, hour: 20, strength: 0.86 },
    { day: 5, hour: 12, strength: 0.88 }, { day: 6, hour: 14, strength: 1.00 },
    { day: 3, hour: 17, strength: 0.82 },
  ],
  x: [
    { day: 1, hour: 9,  strength: 1.00 }, { day: 2, hour: 10, strength: 0.93 },
    { day: 3, hour: 8,  strength: 0.88 }, { day: 4, hour: 12, strength: 0.86 },
    { day: 5, hour: 9,  strength: 0.82 },
  ],
  telegram: [
    { day: 1, hour: 10, strength: 0.88 }, { day: 2, hour: 18, strength: 0.93 },
    { day: 3, hour: 12, strength: 0.86 }, { day: 4, hour: 19, strength: 1.00 },
    { day: 5, hour: 11, strength: 0.82 },
  ],
  discord: [
    { day: 0, hour: 19, strength: 0.88 }, { day: 5, hour: 20, strength: 1.00 },
    { day: 6, hour: 18, strength: 0.93 }, { day: 1, hour: 21, strength: 0.84 },
  ],
  linkedin: [
    { day: 1, hour: 8,  strength: 0.88 }, { day: 2, hour: 9,  strength: 1.00 },
    { day: 3, hour: 7,  strength: 0.90 }, { day: 4, hour: 10, strength: 0.86 },
    { day: 5, hour: 8,  strength: 0.80 },
  ],
  facebook: [
    { day: 1, hour: 9,  strength: 0.83 }, { day: 2, hour: 12, strength: 0.88 },
    { day: 3, hour: 18, strength: 0.86 }, { day: 4, hour: 19, strength: 0.93 },
    { day: 0, hour: 13, strength: 1.00 },
  ],
};

function buildHeatmap(platform: Platform): number[][] {
  const seeded = (d: number, h: number) =>
    Math.abs(Math.sin(d * 31 + h * 7 + platform.length * 13)) * 0.12;
  const grid: number[][] = Array.from({ length: 7 }, (_, d) =>
    Array.from({ length: 24 }, (_, h) => {
      const base = h < 6 ? 0.04 : h < 8 ? 0.18 : h > 22 ? 0.14 : 0.30;
      return base + seeded(d, h);
    })
  );
  for (const pk of PEAKS[platform]) {
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        const dd = Math.min(Math.abs(d - pk.day), 7 - Math.abs(d - pk.day));
        const dh = Math.abs(h - pk.hour);
        grid[d][h] = Math.min(1, grid[d][h] + pk.strength * Math.exp(-(dd * dd * 2.5 + dh * dh * 0.6)));
      }
    }
  }
  return grid;
}

const HEATMAPS: Record<Platform, number[][]> = Object.fromEntries(
  PLATFORMS.map(p => [p, buildHeatmap(p)])
) as Record<Platform, number[][]>;

/* ─── Best slot ───────────────────────────────────────────── */
const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function getNextBestSlot(platform: Platform, now: Date): { label: string; msUntil: number } {
  const hm = HEATMAPS[platform];
  let best = { label: '', msUntil: 0, score: -1 };
  for (let ahead = 0; ahead < 7 * 24; ahead++) {
    const t = new Date(now.getTime() + ahead * 3_600_000);
    const d = t.getDay();
    const h = t.getHours();
    const score = hm[d][h];
    if (score > best.score) {
      best.score = score;
      best.msUntil = ahead * 3_600_000;
      const hStr = `${h.toString().padStart(2, '0')}:00`;
      best.label = ahead === 0 ? `Agora (${hStr})` : ahead < 24 ? `Hoje ${hStr}` : `${DAYS_PT[d]} ${hStr}`;
    }
  }
  return { label: best.label, msUntil: best.msUntil };
}

/* ─── Analisador de conteúdo ──────────────────────────────── */
function analyzeContent(text: string) {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const hashCount = (text.match(/#\w+/g) ?? []).length;
  const hasEmoji    = /\p{Emoji_Presentation}/u.test(text);
  const hasQuestion = /[?]/.test(text);
  const hasCTA      = /clique|acesse|saiba mais|link|compre|descubra|veja|baixe|inscreva|siga|compartilhe|confira|aproveite/i.test(text);
  const hasHook     = text.length > 0 && wordCount >= 3 && wordCount <= 18;
  const hasNumbers  = /\d+/.test(text);
  const goodLength  = wordCount >= 15 && wordCount <= 80;
  const goodHash    = hashCount >= 3 && hashCount <= 8;

  const signals: ContentSignal[] = [
    { key: 'hook',     label: 'Hook inicial',   detected: hasHook,    weight: 0.22, tip: 'Comece com uma frase de impacto curta (≤18 palavras)' },
    { key: 'cta',      label: 'Call-to-action', detected: hasCTA,     weight: 0.20, tip: 'Inclua um verbo de ação: clique, descubra, acesse…' },
    { key: 'length',   label: 'Tamanho ideal',  detected: goodLength, weight: 0.15, tip: 'Mantenha entre 15 e 80 palavras para maior alcance' },
    { key: 'hashtags', label: 'Hashtags (3–8)', detected: goodHash,   weight: 0.14, tip: 'Use 3–8 hashtags relevantes para ampliar o alcance' },
    { key: 'emoji',    label: 'Emojis',         detected: hasEmoji,   weight: 0.10, tip: 'Emojis aumentam a taxa de clique em até 25%' },
    { key: 'question', label: 'Pergunta',       detected: hasQuestion,weight: 0.10, tip: 'Perguntas aumentam os comentários em até 3×' },
    { key: 'numbers',  label: 'Dados / Números',detected: hasNumbers, weight: 0.09, tip: 'Números específicos elevam credibilidade e CTR' },
  ];

  const score = Math.round(signals.reduce((a, s) => a + (s.detected ? s.weight : 0), 0) * 100);

  if (text.length === 0) return { signals, score: 0, predictions: null };

  return {
    signals,
    score,
    predictions: {
      imp:   (score * 48 + 850).toLocaleString('pt-BR'),
      reach: Math.round(score * 30 + 420).toLocaleString('pt-BR'),
      eng:   `${(2.4 + score * 0.045).toFixed(1)}%`,
      ctr:   `${(0.7 + score * 0.022).toFixed(1)}%`,
      conv:  `${(0.3 + score * 0.008).toFixed(1)}%`,
    },
  };
}

/* ─── Cores do heatmap ────────────────────────────────────── */
function heatColor(s: number): string {
  if (s > 0.8)  return '#10b981';
  if (s > 0.65) return '#34d399';
  if (s > 0.45) return '#f59e0b';
  if (s > 0.25) return '#6366f1';
  return '#1e293b';
}
function heatAlpha(s: number): number { return 0.12 + s * 0.88; }

function msToLabel(ms: number): string {
  if (ms <= 0) return 'Agora';
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/* ─── Componente principal ───────────────────────────────── */
export function Funil() {
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [content, setContent]   = useState('');
  const [values, setValues]     = useState(() => STAGES.map(s => s.base));
  const [now, setNow]           = useState(() => new Date());
  const [minute, setMinute]     = useState(() => new Date().getMinutes());

  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setNow(d);
      setMinute(d.getMinutes());
      setValues(prev => prev.map((v, i) => {
        const s = STAGES[i];
        return Math.max(s.base * 0.7, v + (Math.random() - 0.48) * s.variance);
      }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const analysis = useMemo(() => analyzeContent(content), [content]);

  // Recalculate best slots once per minute (countdown only changes per minute)
  const slots = useMemo(
    () => Object.fromEntries(PLATFORMS.map(p => [p, getNextBestSlot(p, now)])) as Record<Platform, { label: string; msUntil: number }>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [minute]
  );

  const hm      = HEATMAPS[platform];
  const info    = PLATFORM_INFO[platform];
  const curPct  = Math.round(hm[now.getDay()][now.getHours()] * 100);
  const maxVal  = values[0];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Funil de Relevância</h2>
            <p className="text-sm text-slate-500 mt-0.5">Quando e como publicar para máximo engajamento e conversão</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/8">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">Ao vivo · 1s</span>
          </div>
        </div>

        {/* Seletor de plataforma */}
        <div className="flex gap-2 flex-wrap">
          {PLATFORMS.map(p => {
            const inf  = PLATFORM_INFO[p];
            const live = Math.round(HEATMAPS[p][now.getDay()][now.getHours()] * 100);
            const act  = p === platform;
            return (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150 ${
                  act
                    ? 'border-white/20 bg-white/10 text-white'
                    : 'border-white/6 bg-white/3 text-slate-400 hover:border-white/12 hover:bg-white/5'
                }`}
              >
                <img
                  src={PLATFORM_LOGOS[p]}
                  alt={inf.name}
                  className="h-3.5 w-3.5 opacity-75"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                {inf.name}
                <span
                  className="font-bold"
                  style={{ color: live >= 70 ? '#10b981' : live >= 45 ? '#f59e0b' : '#475569' }}
                >
                  {live}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Bloco 1: Analisador + Horários */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Analisador de conteúdo */}
          <div className="lg:col-span-2 rounded-2xl border border-white/7 bg-white/3 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                Analisador de Conteúdo em Tempo Real
              </h3>
              <div
                className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                style={{
                  color:      analysis.score >= 70 ? '#10b981' : analysis.score >= 40 ? '#f59e0b' : '#ef4444',
                  background: analysis.score >= 70 ? 'rgba(16,185,129,0.12)' : analysis.score >= 40 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                }}
              >
                Score: {analysis.score}%
              </div>
            </div>

            <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${analysis.score}%`,
                  background: analysis.score >= 70
                    ? 'linear-gradient(90deg,#10b981,#34d399)'
                    : analysis.score >= 40
                    ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
                    : 'linear-gradient(90deg,#ef4444,#f87171)',
                }}
              />
            </div>

            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Cole ou escreva seu conteúdo aqui para análise em tempo real…"
              rows={4}
              className="w-full resize-none rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500/40 transition-all duration-150"
            />

            {/* Sinais detectados */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {analysis.signals.map(s => (
                <div
                  key={s.key}
                  title={s.tip}
                  className="flex items-start gap-2 p-2.5 rounded-xl border transition-all duration-200 cursor-default"
                  style={{
                    borderColor: s.detected ? 'rgba(16,185,129,0.28)' : 'rgba(255,255,255,0.06)',
                    background:  s.detected ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.02)',
                  }}
                >
                  {s.detected
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    : <XCircle      className="h-3.5 w-3.5 text-slate-600   mt-0.5 shrink-0" />
                  }
                  <span className={`text-xs font-medium leading-tight ${s.detected ? 'text-emerald-300' : 'text-slate-500'}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Previsões */}
            {analysis.predictions && (
              <div className="grid grid-cols-5 gap-2 pt-2 border-t border-white/5">
                {[
                  { l: 'Impressões', v: analysis.predictions.imp,   c: '#6366f1' },
                  { l: 'Alcance',    v: analysis.predictions.reach,  c: '#8b5cf6' },
                  { l: 'Engajamento',v: analysis.predictions.eng,    c: '#34d399' },
                  { l: 'CTR',        v: analysis.predictions.ctr,    c: '#10b981' },
                  { l: 'Conversão',  v: analysis.predictions.conv,   c: '#06b6d4' },
                ].map(m => (
                  <div key={m.l} className="text-center p-2 rounded-xl bg-white/3 border border-white/5">
                    <div className="text-sm font-bold tabular-nums" style={{ color: m.c }}>{m.v}</div>
                    <div className="text-xs text-slate-500 mt-0.5 leading-tight">{m.l}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Sugestões */}
            {content.length > 0 && analysis.signals.some(s => !s.detected) && (
              <div className="space-y-1.5 pt-1">
                <p className="text-xs font-medium text-slate-500">Sugestões de melhoria:</p>
                {analysis.signals.filter(s => !s.detected).slice(0, 3).map(s => (
                  <div key={s.key} className="flex items-start gap-2 text-xs text-slate-400">
                    <AlertCircle className="h-3 w-3 text-amber-400 mt-0.5 shrink-0" />
                    {s.tip}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Melhores horários */}
          <div className="rounded-2xl border border-white/7 bg-white/3 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-400" />
              Próximos Melhores Horários
            </h3>
            <div className="space-y-1.5">
              {PLATFORMS.map(p => {
                const slot = slots[p];
                const inf  = PLATFORM_INFO[p];
                const act  = p === platform;
                return (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all duration-150 ${
                      act
                        ? 'border-indigo-500/30 bg-indigo-500/7'
                        : 'border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/4'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={PLATFORM_LOGOS[p]}
                        alt={inf.name}
                        className="h-3.5 w-3.5 opacity-70"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <span className="text-xs text-slate-300 font-medium">{inf.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-200">{slot.label}</div>
                      <div className={`text-xs font-medium ${slot.msUntil === 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {slot.msUntil === 0 ? '● Agora' : msToLabel(slot.msUntil)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Heatmap de engajamento */}
        <div className="rounded-2xl border border-white/7 bg-white/3 p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-400" />
              Heatmap de Engajamento — {info.name}
              <span
                className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  color:      curPct >= 70 ? '#10b981' : curPct >= 45 ? '#f59e0b' : '#64748b',
                  background: curPct >= 70 ? 'rgba(16,185,129,0.12)' : curPct >= 45 ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.05)',
                }}
              >
                Agora: {curPct}%
              </span>
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {[
                { c: '#1e293b', l: 'Baixo'  },
                { c: '#6366f1', l: 'Médio'  },
                { c: '#f59e0b', l: 'Bom'    },
                { c: '#10b981', l: 'Ótimo'  },
              ].map(({ c, l }) => (
                <div key={l} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm" style={{ background: c }} />
                  {l}
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <div style={{ minWidth: 560 }}>
              {/* Eixo de horas */}
              <div className="flex gap-0.75 mb-1 ml-11">
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} style={{ width: 20, flexShrink: 0, fontSize: 8, textAlign: 'center', color: '#475569' }}>
                    {h % 4 === 0 ? `${h}h` : ''}
                  </div>
                ))}
              </div>
              {/* Linhas */}
              {DAY_LABELS.map((day, d) => (
                <div key={d} className="flex items-center gap-0.75 mb-0.75">
                  <div style={{ width: 38, flexShrink: 0, fontSize: 10, textAlign: 'right', paddingRight: 6, color: '#64748b' }}>
                    {day}
                  </div>
                  {hm[d].map((score, h) => {
                    const isNow = d === now.getDay() && h === now.getHours();
                    return (
                      <div
                        key={h}
                        title={`${day} ${h.toString().padStart(2, '0')}:00 — ${Math.round(score * 100)}% potencial`}
                        style={{
                          width: 20, height: 18, borderRadius: 3, flexShrink: 0,
                          background: heatColor(score),
                          opacity: heatAlpha(score),
                          outline: isNow ? '2px solid #818cf8' : 'none',
                          outlineOffset: 1,
                          cursor: 'default',
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bloco 2: Funil + Boas práticas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Funil de conversão */}
          <div className="lg:col-span-2 rounded-2xl border border-white/7 bg-white/3 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-400" />
                Funil de Conversão
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Tempo real
              </div>
            </div>

            <div className="space-y-1">
              {STAGES.map((stage, i) => {
                const val  = Math.round(values[i]);
                const pct  = maxVal > 0 ? (val / maxVal) * 100 : 0;
                const prev = i > 0 ? Math.round(values[i - 1]) : val;
                const cr   = i > 0 && prev > 0 ? `${((val / prev) * 100).toFixed(1)}%` : null;
                return (
                  <div key={stage.key}>
                    {i > 0 && (
                      <div className="flex items-center gap-2 py-1 ml-3">
                        <ArrowDown className="h-3 w-3 text-slate-700" />
                        <span className="text-xs text-slate-600">
                          Conversão: <span className="text-slate-400">{cr}</span>
                          {' '}· Dropoff: <span className="text-red-400/60">{stage.dropoffLabel}</span>
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: stage.glow }}
                      >
                        <stage.icon className="h-4 w-4" style={{ color: stage.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-slate-300">{stage.label}</span>
                          <span className="text-xs font-bold tabular-nums" style={{ color: stage.color }}>
                            {val.toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                              background: `linear-gradient(90deg,${stage.color}66,${stage.color})`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/5 grid grid-cols-3 gap-3">
              {[
                { l: 'CTR Geral',    v: `${((values[3] / values[0]) * 100).toFixed(2)}%`, c: '#34d399' },
                { l: 'Taxa de Conv.',v: `${((values[4] / values[0]) * 100).toFixed(2)}%`, c: '#10b981' },
                { l: 'Alcance/Imp.', v: `${((values[1] / values[0]) * 100).toFixed(1)}%`, c: '#6366f1' },
              ].map(m => (
                <div key={m.l} className="text-center p-2.5 rounded-xl bg-white/3 border border-white/5">
                  <div className="text-sm font-bold tabular-nums" style={{ color: m.c }}>{m.v}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{m.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Boas práticas */}
          <div className="rounded-2xl border border-white/7 bg-white/3 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400" />
              Boas Práticas — {info.name}
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Tipo de conteúdo', value: info.contentType },
                { label: 'Tamanho ideal',    value: info.optimalLength },
                { label: 'Hashtags',         value: info.maxHashtags > 0 ? `Até ${info.maxHashtags} hashtags` : 'Não recomendado' },
              ].map(row => (
                <div key={row.label} className="p-3 rounded-xl border border-white/5 bg-white/2">
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-0.5">{row.label}</div>
                  <div className="text-sm font-semibold text-slate-200">{row.value}</div>
                </div>
              ))}

              <div className="p-3 rounded-xl border border-white/5 bg-white/2">
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1.5">Formatos que performam</div>
                <div className="flex flex-wrap gap-1">
                  {info.bestFormats.map(f => (
                    <span
                      key={f}
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ color: info.color, background: info.color + '18' }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-white/5 bg-white/2">
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Próximo horário ótimo</div>
                <div className="text-sm font-bold text-slate-100">{slots[platform]?.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{msToLabel(slots[platform]?.msUntil ?? 0)}</div>
              </div>

              <div
                className="p-3 rounded-xl border text-xs text-slate-400 leading-relaxed"
                style={{ borderColor: info.color + '25', background: info.color + '08' }}
              >
                <span className="font-semibold block mb-0.5" style={{ color: info.color }}>Insight da plataforma</span>
                {info.audienceNote}
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
