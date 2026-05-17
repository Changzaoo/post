export type ContentType =
  | 'Reels' | 'TikTok' | 'Post' | 'Story' | 'Página de Venda'
  | 'E-mail' | 'Mensagem Automática' | 'Vídeo Longo' | 'Aula'
  | 'E-book' | 'Lead Magnet';

export type ContentPlatform = 'Instagram' | 'TikTok' | 'YouTube' | 'Email' | 'WhatsApp' | 'LinkedIn' | 'Site';
export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'optimizing';
export type ContentFunnelStage = 'Visitante' | 'Lead' | 'Engajado' | 'Interessado' | 'Oferta' | 'Pós-Venda';

export interface Content {
  id: string;
  title: string;
  type: ContentType;
  platform: ContentPlatform;
  funnelStage: ContentFunnelStage;
  objective: string;
  hook: string;
  cta: string;
  retentionRate: number;
  conversionRate: number;
  status: ContentStatus;
  createdAt: string;
  views?: number;
  engagement?: number;
}

export const contents: Content[] = [
  {
    id: '1',
    title: '5 erros que impedem seu conteúdo de converter',
    type: 'Reels',
    platform: 'Instagram',
    funnelStage: 'Visitante',
    objective: 'Gerar atenção e curiosidade',
    hook: 'Você faz conteúdo mas ninguém compra? O problema pode ser esse...',
    cta: 'Salva esse vídeo para não esquecer',
    retentionRate: 78,
    conversionRate: 12,
    status: 'published',
    createdAt: '2026-05-10',
    views: 48200,
    engagement: 6.8,
  },
  {
    id: '2',
    title: 'Como criar uma oferta irresistível em 3 passos',
    type: 'TikTok',
    platform: 'TikTok',
    funnelStage: 'Interessado',
    objective: 'Preparar para a oferta',
    hook: 'Sua oferta não vende porque está faltando isso...',
    cta: 'Comenta "QUERO" para receber o material completo',
    retentionRate: 71,
    conversionRate: 18,
    status: 'published',
    createdAt: '2026-05-08',
    views: 124000,
    engagement: 9.2,
  },
  {
    id: '3',
    title: 'Guia Completo: Funil de Vendas para Criadores',
    type: 'E-book',
    platform: 'Email',
    funnelStage: 'Lead',
    objective: 'Educar e gerar autoridade',
    hook: 'O guia que fará você entender onde está perdendo dinheiro',
    cta: 'Baixar grátis agora',
    retentionRate: 84,
    conversionRate: 31,
    status: 'published',
    createdAt: '2026-04-28',
    views: 1240,
    engagement: 42,
  },
  {
    id: '4',
    title: 'Aula Gratuita: Retenção de Público em 2026',
    type: 'Aula',
    platform: 'YouTube',
    funnelStage: 'Engajado',
    objective: 'Aprofundar relacionamento e gerar confiança',
    hook: 'Por que 90% dos criadores perdem o público no 3º conteúdo',
    cta: 'Inscreve no canal para não perder as aulas',
    retentionRate: 62,
    conversionRate: 22,
    status: 'published',
    createdAt: '2026-05-03',
    views: 8900,
    engagement: 7.4,
  },
  {
    id: '5',
    title: 'Página de Vendas — Curso Copywriting',
    type: 'Página de Venda',
    platform: 'Site',
    funnelStage: 'Oferta',
    objective: 'Converter interesse em compra',
    hook: 'Aprenda a escrever textos que vendem em 30 dias',
    cta: 'Garantir minha vaga agora',
    retentionRate: 88,
    conversionRate: 3.8,
    status: 'published',
    createdAt: '2026-05-09',
    views: 4200,
    engagement: 3.8,
  },
  {
    id: '6',
    title: 'Sequência de Boas-Vindas — 5 Emails',
    type: 'E-mail',
    platform: 'Email',
    funnelStage: 'Lead',
    objective: 'Nutrir novos leads com conteúdo educativo',
    hook: 'Bem-vindo! Aqui está o que acontece agora...',
    cta: 'Acessar o material prometido',
    retentionRate: 91,
    conversionRate: 28,
    status: 'published',
    createdAt: '2026-04-15',
    views: 3200,
    engagement: 38,
  },
  {
    id: '7',
    title: 'Story: Prova Social com Depoimentos',
    type: 'Story',
    platform: 'Instagram',
    funnelStage: 'Interessado',
    objective: 'Aumentar confiança com resultados reais',
    hook: 'Veja o que aconteceu com o João depois de 30 dias...',
    cta: 'Arrasta pra cima e veja como',
    retentionRate: 55,
    conversionRate: 9,
    status: 'scheduled',
    createdAt: '2026-05-15',
    views: 0,
    engagement: 0,
  },
  {
    id: '8',
    title: 'Checklist: 12 passos para otimizar seu funil',
    type: 'Lead Magnet',
    platform: 'Email',
    funnelStage: 'Lead',
    objective: 'Captar leads com alta intenção',
    hook: 'O checklist que revelará onde você está perdendo vendas',
    cta: 'Quero o checklist grátis',
    retentionRate: 76,
    conversionRate: 24,
    status: 'draft',
    createdAt: '2026-05-16',
  },
];

export const statusContentConfig: Record<ContentStatus, { label: string; color: string; bg: string }> = {
  draft:       { label: 'Rascunho',    color: '#94A3B8', bg: 'rgba(148,163,184,0.10)' },
  scheduled:   { label: 'Agendado',    color: '#FFD84D', bg: 'rgba(255,216,77,0.10)' },
  published:   { label: 'Publicado',   color: '#10D97A', bg: 'rgba(16,217,122,0.10)' },
  optimizing:  { label: 'Otimizando', color: '#20F5D8', bg: 'rgba(32,245,216,0.10)' },
};
