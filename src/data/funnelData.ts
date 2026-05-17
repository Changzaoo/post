export interface FunnelStage {
  id: string;
  name: string;
  description: string;
  people: number;
  advanceRate: number;
  dropRate: number;
  recommendedCTA: string;
  suggestedAction: string;
  idealContent: string;
  objective: string;
  color: string;
  icon: string;
}

export interface FunnelMetrics {
  totalVisitors: number;
  totalLeads: number;
  totalSales: number;
  conversionRate: number;
  averageTicket: number;
  estimatedRevenue: number;
}

export const funnelStages: FunnelStage[] = [
  {
    id: 'visitor',
    name: 'Visitante',
    description: 'Pessoas que chegaram ao seu conteúdo',
    people: 12400,
    advanceRate: 28,
    dropRate: 72,
    recommendedCTA: 'Headline forte + prova visual',
    suggestedAction: 'Criar conteúdo de impacto imediato',
    idealContent: 'Vídeo curto, promessa clara, benefício direto',
    objective: 'Capturar atenção e curiosidade',
    color: '#3B6EFF',
    icon: 'Eye',
  },
  {
    id: 'lead',
    name: 'Lead',
    description: 'Contatos capturados com interesse',
    people: 3472,
    advanceRate: 42,
    dropRate: 58,
    recommendedCTA: 'Baixar material gratuito',
    suggestedAction: 'Enviar sequência educativa de 5 emails',
    idealContent: 'E-book, aula gratuita, checklist, templates',
    objective: 'Gerar confiança e autoridade',
    color: '#20F5D8',
    icon: 'UserPlus',
  },
  {
    id: 'engaged',
    name: 'Engajado',
    description: 'Leads ativos consumindo conteúdo',
    people: 1458,
    advanceRate: 55,
    dropRate: 45,
    recommendedCTA: 'Participar de evento/aula ao vivo',
    suggestedAction: 'Criar comunidade e interação direta',
    idealContent: 'Stories interativos, enquetes, lives, bastidores',
    objective: 'Aprofundar relacionamento',
    color: '#8B5CF6',
    icon: 'Zap',
  },
  {
    id: 'interested',
    name: 'Interessado',
    description: 'Demonstrou interesse na oferta',
    people: 802,
    advanceRate: 38,
    dropRate: 62,
    recommendedCTA: 'Assistir aula de apresentação',
    suggestedAction: 'Apresentar proposta de valor clara',
    idealContent: 'Depoimentos, resultados reais, estudo de caso',
    objective: 'Eliminar objeções e gerar desejo',
    color: '#FFD84D',
    icon: 'Star',
  },
  {
    id: 'offer_viewed',
    name: 'Oferta Visualizada',
    description: 'Visitou a página de vendas',
    people: 305,
    advanceRate: 52,
    dropRate: 48,
    recommendedCTA: 'Garantia + bônus exclusivo',
    suggestedAction: 'Adicionar prova social e urgência ética',
    idealContent: 'Página de vendas, VSL, depoimentos em vídeo',
    objective: 'Converter interesse em decisão',
    color: '#FF9F0A',
    icon: 'ShoppingBag',
  },
  {
    id: 'checkout',
    name: 'Checkout Iniciado',
    description: 'Começou o processo de compra',
    people: 158,
    advanceRate: 71,
    dropRate: 29,
    recommendedCTA: 'Garantia estendida + suporte',
    suggestedAction: 'Email de carrinho abandonado automático',
    idealContent: 'FAQ de objeções, garantia destacada, suporte chat',
    objective: 'Reduzir abandono e insegurança',
    color: '#F97316',
    icon: 'CreditCard',
  },
  {
    id: 'purchase',
    name: 'Compra Realizada',
    description: 'Converteu em cliente',
    people: 112,
    advanceRate: 88,
    dropRate: 12,
    recommendedCTA: 'Boas-vindas + comunidade',
    suggestedAction: 'Onboarding personalizado em 3 passos',
    idealContent: 'Email de boas-vindas, tutorial, plano de ação',
    objective: 'Ativar e reter o cliente',
    color: '#10D97A',
    icon: 'CheckCircle',
  },
  {
    id: 'post_sale',
    name: 'Pós-Venda',
    description: 'Clientes em processo de retenção',
    people: 98,
    advanceRate: 65,
    dropRate: 35,
    recommendedCTA: 'Upsell / Próximo nível',
    suggestedAction: 'Programa de fidelidade e comunidade VIP',
    idealContent: 'Conteúdo exclusivo, milestones, depoimentos internos',
    objective: 'Maximizar LTV e gerar promotores',
    color: '#06B6D4',
    icon: 'Heart',
  },
  {
    id: 'reactivation',
    name: 'Reativação',
    description: 'Clientes inativos para reengajar',
    people: 234,
    advanceRate: 31,
    dropRate: 69,
    recommendedCTA: 'Oferta especial de retorno',
    suggestedAction: 'Campanha de reativação com novidade exclusiva',
    idealContent: 'Mensagem personalizada, nova promessa, desconto especial',
    objective: 'Reconquistar e reengajar',
    color: '#EC4899',
    icon: 'RefreshCw',
  },
];

export const funnelMetrics: FunnelMetrics = {
  totalVisitors: 12400,
  totalLeads: 3472,
  totalSales: 112,
  conversionRate: 0.90,
  averageTicket: 497,
  estimatedRevenue: 55664,
};

export const funnelChartData = [
  { stage: 'Visitante', value: 12400, fill: '#3B6EFF' },
  { stage: 'Lead', value: 3472, fill: '#20F5D8' },
  { stage: 'Engajado', value: 1458, fill: '#8B5CF6' },
  { stage: 'Interessado', value: 802, fill: '#FFD84D' },
  { stage: 'Oferta', value: 305, fill: '#FF9F0A' },
  { stage: 'Checkout', value: 158, fill: '#F97316' },
  { stage: 'Compra', value: 112, fill: '#10D97A' },
];
