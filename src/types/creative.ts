export type CreativeStatus =
  | 'Ideia'
  | 'Em produção'
  | 'Em teste'
  | 'Vencedor'
  | 'Perdedor'
  | 'Pausado'
  | 'Arquivado';

export type CreativeTone =
  | 'Profissional'
  | 'Agressivo'
  | 'Emocional'
  | 'Luxo'
  | 'Minimalista'
  | 'Educativo'
  | 'Viral'
  | 'Direto'
  | 'Misterioso';

export type CreativePlatform =
  | 'TikTok'
  | 'Instagram Reels'
  | 'Stories'
  | 'Facebook Ads'
  | 'Google Ads'
  | 'YouTube Shorts'
  | 'Landing Page'
  | 'Carrossel';

export type CreativeType =
  | 'Imagem estática'
  | 'Vídeo curto'
  | 'Carrossel'
  | 'Texto de anúncio'
  | 'Headline'
  | 'Script de vídeo'
  | 'Storytelling'
  | 'Oferta direta'
  | 'Comparativo'
  | 'Prova social'
  | 'Antes e depois'
  | 'Problema e solução';

export type CampaignObjective =
  | 'Vender'
  | 'Capturar leads'
  | 'Gerar autoridade'
  | 'Gerar curiosidade'
  | 'Educar'
  | 'Retargeting'
  | 'Aquecer público frio'
  | 'Reativar público antigo';

export interface CreativeMetrics {
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
  cpa: number;
  roi: number;
  retention: number;
}

export interface CreativeAnalysis {
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  nextTests: string[];
}

export interface Creative {
  id: string;
  userId?: string;
  campaignId?: string;
  campaignName: string;
  product: string;
  audience: string;
  pain: string;
  desire: string;
  objections: string;
  promise: string;
  platform: CreativePlatform | string;
  type: CreativeType | string;
  tone: CreativeTone | string;
  objective: CampaignObjective | string;
  title: string;
  description: string;
  headline: string;
  copy: string;
  mainText: string;
  caption: string;
  script: string;
  visualPrompt: string;
  suggestedVisual: string;
  cta: string;
  indicatedAudience: string;
  emotion: string;
  aggressivenessLevel: number;
  estimatedConversionProbability: number;
  status: CreativeStatus;
  createdAt: string;
  updatedAt: string;
  metrics: CreativeMetrics;
  analysis: CreativeAnalysis;
}

export interface CreativeFormData {
  campaignName: string;
  product: string;
  audience: string;
  pain: string;
  desire: string;
  objections: string;
  promise: string;
  tone: CreativeTone;
  platform: CreativePlatform;
  type: CreativeType;
  objective: CampaignObjective;
}

export interface CreativeCampaign {
  id: string;
  userId?: string;
  name: string;
  product: string;
  audience: string;
  objective: string;
  createdAt: string;
  creatives: Creative[];
}

export interface ShortVideoScript {
  id: string;
  title: string;
  hook: string;
  development: string;
  patternBreak: string;
  proof: string;
  offer: string;
  finalCta: string;
  narration: string;
  onScreenText: string;
  sceneSuggestion: string;
  imageSuggestion: string;
  musicSuggestion: string;
  cutSuggestion: string;
  estimatedDuration: string;
}

export interface VisualPrompt {
  id: string;
  title: string;
  format: string;
  visualStyle: string;
  setting: string;
  mainSubject: string;
  lighting: string;
  colors: string;
  composition: string;
  emotion: string;
  cameraAngle: string;
  quality: string;
  forbiddenElements: string;
  aspectRatio: string;
  prompt: string;
}

export interface CopyVariation {
  id: string;
  model: string;
  headline: string;
  mainText: string;
  cta: string;
  shortVersion: string;
  longVersion: string;
  aggressiveVersion: string;
  emotionalVersion: string;
  professionalVersion: string;
}

export interface CreativeGenerationResult {
  ideas: Creative[];
  headlines: string[];
  shortCalls: string[];
  copies: CopyVariation[];
  scripts: ShortVideoScript[];
  carouselIdeas: string[];
  ctas: string[];
  salesAngles: string[];
  emotionalVariations: string[];
  directVariations: string[];
  educationalVariations: string[];
  visualPrompts: VisualPrompt[];
}

export interface CreativeComparison {
  winner: Creative | null;
  probableReason: string;
  strongestElement: string;
  weakestElement: string;
  nextRecommendedTest: string;
  notes: string[];
}
