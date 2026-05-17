export type CampaignStatus = 'planned' | 'active' | 'paused' | 'optimizing' | 'finished';
export type CampaignChannel = 'Instagram' | 'TikTok' | 'Email' | 'WhatsApp' | 'YouTube' | 'Telegram' | 'Discord' | 'LinkedIn';
export type FunnelStageRef = 'Visitante' | 'Lead' | 'Engajado' | 'Interessado' | 'Oferta' | 'Checkout' | 'Compra' | 'Pós-Venda';

export interface Campaign {
  id: string;
  name: string;
  objective: string;
  audience: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  funnelStage: FunnelStageRef;
  mainCTA: string;
  mainMetric: string;
  startDate: string;
  endDate: string;
  budget?: number;
  results?: {
    reach?: number;
    clicks?: number;
    conversions?: number;
    revenue?: number;
  };
}

export const campaigns: Campaign[] = [
  {
    id: '1',
    name: 'Lançamento Curso de Copywriting',
    objective: 'Vender 50 vagas do curso em 7 dias',
    audience: 'Empreendedores digitais 25-40 anos',
    channel: 'Instagram',
    status: 'active',
    funnelStage: 'Oferta',
    mainCTA: 'Garanta sua vaga',
    mainMetric: 'Vendas',
    startDate: '2026-05-10',
    endDate: '2026-05-17',
    results: { reach: 48200, clicks: 2100, conversions: 38, revenue: 18886 },
  },
  {
    id: '2',
    name: 'Captação de Leads — E-book Gratuito',
    objective: 'Captar 500 leads qualificados',
    audience: 'Criadores de conteúdo iniciantes',
    channel: 'TikTok',
    status: 'active',
    funnelStage: 'Lead',
    mainCTA: 'Baixar grátis',
    mainMetric: 'Leads captados',
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    results: { reach: 124000, clicks: 8400, conversions: 621 },
  },
  {
    id: '3',
    name: 'Reativação de Leads Frios',
    objective: 'Reengajar lista inativa com nova oferta',
    audience: 'Leads sem abertura há 30+ dias',
    channel: 'Email',
    status: 'optimizing',
    funnelStage: 'Engajado',
    mainCTA: 'Quero ver a novidade',
    mainMetric: 'Taxa de abertura',
    startDate: '2026-05-08',
    endDate: '2026-05-22',
    results: { reach: 3200, clicks: 480, conversions: 112 },
  },
  {
    id: '4',
    name: 'Nutrição de Leads — Sequência 7 dias',
    objective: 'Educar e preparar para oferta',
    audience: 'Novos leads da última semana',
    channel: 'Email',
    status: 'active',
    funnelStage: 'Interessado',
    mainCTA: 'Assistir aula gratuita',
    mainMetric: 'CTR',
    startDate: '2026-05-12',
    endDate: '2026-05-19',
    results: { reach: 890, clicks: 312, conversions: 89 },
  },
  {
    id: '5',
    name: 'Lançamento Comunidade Paga',
    objective: 'Vender 100 assinaturas mensais',
    audience: 'Clientes existentes + leads quentes',
    channel: 'WhatsApp',
    status: 'planned',
    funnelStage: 'Oferta',
    mainCTA: 'Entrar na comunidade',
    mainMetric: 'Assinaturas',
    startDate: '2026-05-20',
    endDate: '2026-05-27',
  },
  {
    id: '6',
    name: 'Conteúdo Orgânico — Funil de Atenção',
    objective: 'Aumentar alcance e novos seguidores',
    audience: 'Público amplo 18-45 anos',
    channel: 'YouTube',
    status: 'active',
    funnelStage: 'Visitante',
    mainCTA: 'Inscrever no canal',
    mainMetric: 'Alcance orgânico',
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    results: { reach: 89000, clicks: 4200 },
  },
  {
    id: '7',
    name: 'Campanha de Pós-Venda — Upsell',
    objective: 'Vender upgrade para plano anual',
    audience: 'Clientes do plano mensal',
    channel: 'Email',
    status: 'paused',
    funnelStage: 'Pós-Venda',
    mainCTA: 'Fazer upgrade agora',
    mainMetric: 'Receita adicional',
    startDate: '2026-04-28',
    endDate: '2026-05-15',
    results: { reach: 412, clicks: 88, conversions: 14, revenue: 6958 },
  },
  {
    id: '8',
    name: 'Webinar — Automação com IA',
    objective: 'Posicionar autoridade e captar leads',
    audience: 'Empreendedores digitais avançados',
    channel: 'LinkedIn',
    status: 'finished',
    funnelStage: 'Lead',
    mainCTA: 'Reservar vaga grátis',
    mainMetric: 'Inscrições',
    startDate: '2026-05-05',
    endDate: '2026-05-06',
    results: { reach: 12400, clicks: 1840, conversions: 384 },
  },
];

export const statusConfig: Record<CampaignStatus, { label: string; color: string; bg: string; border: string }> = {
  planned:    { label: 'Planejada',   color: '#94A3B8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.20)' },
  active:     { label: 'Ativa',       color: '#10D97A', bg: 'rgba(16,217,122,0.10)', border: 'rgba(16,217,122,0.22)' },
  paused:     { label: 'Pausada',     color: '#FFD84D', bg: 'rgba(255,216,77,0.10)', border: 'rgba(255,216,77,0.22)' },
  optimizing: { label: 'Otimizando', color: '#20F5D8', bg: 'rgba(32,245,216,0.10)', border: 'rgba(32,245,216,0.22)' },
  finished:   { label: 'Finalizada',  color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)', border: 'rgba(139,92,246,0.22)' },
};
