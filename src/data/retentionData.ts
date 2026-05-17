export interface RetentionMetric {
  label: string;
  value: string | number;
  unit?: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  description: string;
  color: string;
}

export interface TopContent {
  title: string;
  type: string;
  saves: number;
  shares: number;
  returns: number;
  retentionRate: number;
  platform: string;
}

export interface RetentionSuggestion {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  timeToImplement: string;
}

export interface WeeklyRetention {
  week: string;
  retention: number;
  newFollowers: number;
  lost: number;
}

export interface TrafficSource {
  source: string;
  percentage: number;
  color: string;
}

export const retentionMetrics: RetentionMetric[] = [
  {
    label: 'Retenção Média',
    value: 68,
    unit: '%',
    change: +4.2,
    trend: 'up',
    description: 'dos visitantes voltam',
    color: '#3B6EFF',
  },
  {
    label: 'Tempo Médio de Atenção',
    value: '2m 34s',
    change: +18,
    trend: 'up',
    description: 'por sessão de conteúdo',
    color: '#20F5D8',
  },
  {
    label: 'Taxa de Abandono',
    value: 32,
    unit: '%',
    change: -6.1,
    trend: 'up',
    description: 'saem sem interagir',
    color: '#FFD84D',
  },
  {
    label: 'Conteúdos Salvos',
    value: 1248,
    change: +22,
    trend: 'up',
    description: 'nas últimas 2 semanas',
    color: '#8B5CF6',
  },
  {
    label: 'Compartilhamentos',
    value: 892,
    change: +15,
    trend: 'up',
    description: 'orgânicos no período',
    color: '#10D97A',
  },
  {
    label: 'Taxa de Retorno',
    value: 41,
    unit: '%',
    change: +8,
    trend: 'up',
    description: 'voltam após 7 dias',
    color: '#FF9F0A',
  },
];

export const topContents: TopContent[] = [
  {
    title: '5 erros que impedem seu conteúdo de converter',
    type: 'Reels',
    saves: 2840,
    shares: 1290,
    returns: 68,
    retentionRate: 78,
    platform: 'Instagram',
  },
  {
    title: 'Como criar uma oferta irresistível',
    type: 'TikTok',
    saves: 1920,
    shares: 840,
    returns: 52,
    retentionRate: 71,
    platform: 'TikTok',
  },
  {
    title: 'Guia Funil de Vendas para Criadores',
    type: 'E-book',
    saves: 1440,
    shares: 380,
    returns: 89,
    retentionRate: 84,
    platform: 'Email',
  },
  {
    title: 'Aula Gratuita: Retenção de Público 2026',
    type: 'Vídeo',
    saves: 980,
    shares: 440,
    returns: 71,
    retentionRate: 62,
    platform: 'YouTube',
  },
  {
    title: 'Sequência de Boas-Vindas por Email',
    type: 'E-mail',
    saves: 0,
    shares: 180,
    returns: 94,
    retentionRate: 91,
    platform: 'Email',
  },
];

export const retentionSuggestions: RetentionSuggestion[] = [
  {
    id: '1',
    title: 'Melhorar o gancho dos primeiros 3 segundos',
    description: 'Seus conteúdos perdem 42% do público nos primeiros 3 segundos. Use uma pergunta provocadora ou revelação imediata para prender atenção logo no início.',
    impact: 'high',
    category: 'Conteúdo',
    timeToImplement: '1-2 dias',
  },
  {
    id: '2',
    title: 'Criar sequência de conteúdo em série',
    description: 'Conteúdos em série geram 3x mais retorno. Crie uma sequência de "Parte 1, 2 e 3" para forçar o público a voltar e acompanhar.',
    impact: 'high',
    category: 'Estratégia',
    timeToImplement: '3-5 dias',
  },
  {
    id: '3',
    title: 'Adicionar CTA no meio do conteúdo',
    description: 'O CTA no meio do conteúdo (não só no final) aumenta em 28% o engajamento. Peça ao público para salvar ou comentar enquanto ainda estão engajados.',
    impact: 'medium',
    category: 'Conversão',
    timeToImplement: 'Imediato',
  },
  {
    id: '4',
    title: 'Usar storytelling nos primeiros 10 segundos',
    description: 'Conteúdos que abrem com uma história pessoal têm 67% mais retenção. Comece com "Um dia eu perdi...", "Meu maior erro foi...", "O que ninguém me contou...".',
    impact: 'high',
    category: 'Conteúdo',
    timeToImplement: '1 dia',
  },
  {
    id: '5',
    title: 'Reaproveitar posts com maior retenção',
    description: 'Seu post sobre "5 erros" teve 78% de retenção. Transforme esse mesmo conteúdo em carrossel, thread, email e e-book para maximizar o alcance.',
    impact: 'medium',
    category: 'Estratégia',
    timeToImplement: '2-3 dias',
  },
  {
    id: '6',
    title: 'Criar conteúdos de continuação',
    description: 'Finalize seus conteúdos com "No próximo vídeo vou mostrar..." ou "Parte 2 sai na sexta" para criar expectativa e garantir retorno.',
    impact: 'medium',
    category: 'Engajamento',
    timeToImplement: 'Imediato',
  },
  {
    id: '7',
    title: 'Enviar mensagem de reativação para inativos',
    description: '234 leads estão inativos há 14+ dias. Envie uma mensagem personalizada com nova promessa de valor ou conteúdo exclusivo para reativar o engajamento.',
    impact: 'high',
    category: 'Reativação',
    timeToImplement: '1 dia',
  },
  {
    id: '8',
    title: 'Criar promessa visual clara no thumbnail',
    description: 'Thumbnails com texto de benefício claro têm 45% mais cliques. Adicione uma promessa específica na imagem de capa de cada conteúdo.',
    impact: 'medium',
    category: 'Distribuição',
    timeToImplement: 'Imediato',
  },
];

export const weeklyRetentionData: WeeklyRetention[] = [
  { week: 'Sem 1', retention: 58, newFollowers: 420, lost: 38 },
  { week: 'Sem 2', retention: 61, newFollowers: 380, lost: 42 },
  { week: 'Sem 3', retention: 64, newFollowers: 510, lost: 35 },
  { week: 'Sem 4', retention: 62, newFollowers: 490, lost: 44 },
  { week: 'Sem 5', retention: 67, newFollowers: 620, lost: 29 },
  { week: 'Sem 6', retention: 65, newFollowers: 580, lost: 33 },
  { week: 'Sem 7', retention: 70, newFollowers: 740, lost: 24 },
  { week: 'Sem 8', retention: 68, newFollowers: 680, lost: 28 },
];

export const trafficSources: TrafficSource[] = [
  { source: 'Instagram', percentage: 38, color: '#E1306C' },
  { source: 'TikTok', percentage: 26, color: '#FF0050' },
  { source: 'YouTube', percentage: 18, color: '#FF0000' },
  { source: 'Email', percentage: 12, color: '#3B6EFF' },
  { source: 'Outros', percentage: 6, color: '#94A3B8' },
];
