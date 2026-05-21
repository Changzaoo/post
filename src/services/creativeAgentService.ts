import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type {
  CampaignObjective,
  CopyVariation,
  Creative,
  CreativeAnalysis,
  CreativeCampaign,
  CreativeComparison,
  CreativeFormData,
  CreativeGenerationResult,
  CreativeMetrics,
  CreativePlatform,
  CreativeStatus,
  CreativeTone,
  CreativeType,
  ShortVideoScript,
  VisualPrompt,
} from '../types/creative';

export const toneOptions: CreativeTone[] = [
  'Profissional',
  'Agressivo',
  'Emocional',
  'Luxo',
  'Minimalista',
  'Educativo',
  'Viral',
  'Direto',
  'Misterioso',
];

export const platformOptions: CreativePlatform[] = [
  'TikTok',
  'Instagram Reels',
  'Stories',
  'Facebook Ads',
  'Google Ads',
  'YouTube Shorts',
  'Landing Page',
  'Carrossel',
];

export const creativeTypeOptions: CreativeType[] = [
  'Imagem estática',
  'Vídeo curto',
  'Carrossel',
  'Texto de anúncio',
  'Headline',
  'Script de vídeo',
  'Storytelling',
  'Oferta direta',
  'Comparativo',
  'Prova social',
  'Antes e depois',
  'Problema e solução',
];

export const objectiveOptions: CampaignObjective[] = [
  'Vender',
  'Capturar leads',
  'Gerar autoridade',
  'Gerar curiosidade',
  'Educar',
  'Retargeting',
  'Aquecer público frio',
  'Reativar público antigo',
];

export const statusOptions: CreativeStatus[] = [
  'Ideia',
  'Em produção',
  'Em teste',
  'Vencedor',
  'Perdedor',
  'Pausado',
  'Arquivado',
];

export const defaultCreativeFormData: CreativeFormData = {
  campaignName: '',
  product: '',
  audience: '',
  pain: '',
  desire: '',
  objections: '',
  promise: '',
  tone: 'Direto',
  platform: 'Instagram Reels',
  type: 'Vídeo curto',
  objective: 'Vender',
};

const emptyMetrics: CreativeMetrics = {
  impressions: 0,
  clicks: 0,
  ctr: 0,
  cpc: 0,
  conversions: 0,
  cpa: 0,
  roi: 0,
  retention: 0,
};

const emptyAnalysis: CreativeAnalysis = {
  strengths: [],
  weaknesses: [],
  improvementSuggestions: [],
  nextTests: [],
};

const LOCAL_STORAGE_PREFIX = 'post-alpha:creative-agent';

type PersistenceSource = 'firestore' | 'localStorage';

export interface PersistenceResult<T> {
  data: T;
  source: PersistenceSource;
  error?: string;
}

function createId(prefix = 'creative') {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function sanitizeText(value: string, maxLength = 2200) {
  const withoutControlChars = Array.from(value)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return char === '\n' || char === '\r' || char === '\t' || (code >= 32 && code !== 127);
    })
    .join('');

  return withoutControlChars
    .replace(/[^\S\r\n]+/g, ' ')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

function safeNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function normalizeDate(value: unknown) {
  const maybeTimestamp = asRecord(value);
  const toDate = maybeTimestamp.toDate;
  if (typeof toDate === 'function') {
    return (toDate as () => Date)().toISOString();
  }
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

function normalizeMetrics(value: unknown): CreativeMetrics {
  const data = asRecord(value);
  return {
    impressions: safeNumber(data.impressions),
    clicks: safeNumber(data.clicks),
    ctr: safeNumber(data.ctr),
    cpc: safeNumber(data.cpc),
    conversions: safeNumber(data.conversions),
    cpa: safeNumber(data.cpa),
    roi: safeNumber(data.roi),
    retention: safeNumber(data.retention),
  };
}

function normalizeAnalysis(value: unknown): CreativeAnalysis {
  const data = asRecord(value);
  const asStringArray = (item: unknown) => (Array.isArray(item) ? item.filter((entry): entry is string => typeof entry === 'string') : []);
  return {
    strengths: asStringArray(data.strengths),
    weaknesses: asStringArray(data.weaknesses),
    improvementSuggestions: asStringArray(data.improvementSuggestions),
    nextTests: asStringArray(data.nextTests),
  };
}

function normalizeCreative(data: Record<string, unknown>, fallbackId: string): Creative {
  return {
    id: asString(data.id, fallbackId),
    userId: asString(data.userId, undefined),
    campaignId: asString(data.campaignId, undefined),
    campaignName: asString(data.campaignName, 'Campanha sem nome'),
    product: asString(data.product, ''),
    audience: asString(data.audience, ''),
    pain: asString(data.pain, ''),
    desire: asString(data.desire, ''),
    objections: asString(data.objections, ''),
    promise: asString(data.promise, ''),
    platform: asString(data.platform, 'Instagram Reels'),
    type: asString(data.type, 'Vídeo curto'),
    tone: asString(data.tone, 'Direto'),
    objective: asString(data.objective, 'Vender'),
    title: asString(data.title, 'Criativo sem título'),
    description: asString(data.description, ''),
    headline: asString(data.headline, ''),
    copy: asString(data.copy, ''),
    mainText: asString(data.mainText, asString(data.copy, '')),
    caption: asString(data.caption, ''),
    script: asString(data.script, ''),
    visualPrompt: asString(data.visualPrompt, ''),
    suggestedVisual: asString(data.suggestedVisual, ''),
    cta: asString(data.cta, ''),
    indicatedAudience: asString(data.indicatedAudience, asString(data.audience, '')),
    emotion: asString(data.emotion, 'Curiosidade'),
    aggressivenessLevel: safeNumber(data.aggressivenessLevel, 4),
    estimatedConversionProbability: safeNumber(data.estimatedConversionProbability, 62),
    status: statusOptions.includes(data.status as CreativeStatus) ? (data.status as CreativeStatus) : 'Ideia',
    createdAt: normalizeDate(data.createdAt),
    updatedAt: normalizeDate(data.updatedAt),
    metrics: normalizeMetrics(data.metrics),
    analysis: normalizeAnalysis(data.analysis),
  };
}

function normalizeCampaign(data: Record<string, unknown>, fallbackId: string): CreativeCampaign {
  return {
    id: asString(data.id, fallbackId),
    userId: asString(data.userId, undefined),
    name: asString(data.name, 'Campanha sem nome'),
    product: asString(data.product, ''),
    audience: asString(data.audience, ''),
    objective: asString(data.objective, ''),
    createdAt: normalizeDate(data.createdAt),
    creatives: [],
  };
}

function localKey(userId: string, entity: 'creatives' | 'campaigns') {
  return `${LOCAL_STORAGE_PREFIX}:${userId}:${entity}`;
}

function readLocal<T>(userId: string, entity: 'creatives' | 'campaigns'): T[] {
  try {
    const raw = localStorage.getItem(localKey(userId, entity));
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeLocal<T>(userId: string, entity: 'creatives' | 'campaigns', data: T[]) {
  localStorage.setItem(localKey(userId, entity), JSON.stringify(data));
}

function upsertLocalCreative(userId: string, creative: Creative) {
  const items = readLocal<Creative>(userId, 'creatives');
  const next = items.some((item) => item.id === creative.id)
    ? items.map((item) => (item.id === creative.id ? creative : item))
    : [creative, ...items];
  writeLocal(userId, 'creatives', next);
}

function deleteLocalCreative(userId: string, creativeId: string) {
  const items = readLocal<Creative>(userId, 'creatives').filter((item) => item.id !== creativeId);
  writeLocal(userId, 'creatives', items);
}

function getFormContext(form: CreativeFormData) {
  const product = sanitizeText(form.product) || 'seu produto';
  const audience = sanitizeText(form.audience) || 'pessoas que precisam resolver esse problema';
  const pain = sanitizeText(form.pain) || 'perder tempo e dinheiro com alternativas erradas';
  const desire = sanitizeText(form.desire) || 'ter um resultado claro, simples e confiável';
  const objections = sanitizeText(form.objections) || 'achar que é difícil, caro ou arriscado';
  const promise = sanitizeText(form.promise) || `chegar ao próximo nível com ${product}`;
  const campaignName = sanitizeText(form.campaignName) || `Campanha ${product}`;
  return {
    campaignName,
    product,
    audience,
    pain,
    desire,
    objections,
    promise,
    tone: form.tone,
    platform: form.platform,
    type: form.type,
    objective: form.objective,
  };
}

function emotionByIndex(index: number) {
  return ['Curiosidade', 'Segurança', 'Urgência', 'Desejo', 'Confiança', 'Alívio', 'Ambição', 'Pertencimento', 'Autoridade', 'Surpresa'][index % 10];
}

function probabilityByIndex(index: number) {
  return Math.min(92, 58 + index * 3 + (index % 2 === 0 ? 4 : 0));
}

export function generateHeadlines(form: CreativeFormData, count = 10) {
  const ctx = getFormContext(form);
  const templates = [
    `${ctx.audience}: pare de sofrer com ${ctx.pain}`,
    `O jeito mais simples de ${ctx.promise}`,
    `Se ${ctx.objections}, veja isso antes de desistir`,
    `Como transformar ${ctx.pain} em ${ctx.desire}`,
    `A promessa direta para quem quer ${ctx.desire}`,
    `${ctx.product}: o caminho mais claro para ${ctx.audience}`,
    `Você ainda aceita ${ctx.pain}?`,
    `O erro silencioso que impede ${ctx.audience} de avançar`,
    `Antes de comprar outra solução, teste este ângulo`,
    `O plano prático para vencer ${ctx.objections}`,
  ];
  return templates.slice(0, count);
}

export function generateCTAs(form: CreativeFormData, count = 5) {
  const ctx = getFormContext(form);
  return [
    `Quero começar com ${ctx.product}`,
    'Ver a solução agora',
    'Testar esse método hoje',
    'Receber a estratégia completa',
    'Criar minha próxima versão',
    'Falar com um especialista',
  ].slice(0, count);
}

export function generateShortCalls(form: CreativeFormData, count = 10) {
  const ctx = getFormContext(form);
  return [
    `Chega de ${ctx.pain}.`,
    `Seu próximo passo para ${ctx.desire}.`,
    `Resolva ${ctx.objections} com clareza.`,
    `${ctx.product} sem complicação.`,
    `O atalho honesto para ${ctx.desire}.`,
    `Para quem cansou de tentar no escuro.`,
    `Uma promessa: ${ctx.promise}.`,
    `Menos dúvida, mais ação.`,
    `Teste este ângulo hoje.`,
    `Pare, veja e compare.`,
  ].slice(0, count);
}

export function generateCopies(form: CreativeFormData, count = 5): CopyVariation[] {
  const ctx = getFormContext(form);
  const models = ['AIDA', 'PAS', 'PASTOR', 'BAB', 'Prova Social'];
  return models.slice(0, count).map((model, index) => {
    const headline = generateHeadlines(form, 10)[index];
    const cta = generateCTAs(form, 5)[index % 5];
    return {
      id: createId('copy'),
      model,
      headline,
      mainText: `${ctx.audience} não precisa continuar preso em ${ctx.pain}. Com ${ctx.product}, a mensagem central é simples: ${ctx.promise}. A copy deve quebrar a objeção "${ctx.objections}" e mostrar um próximo passo claro para ${ctx.desire}.`,
      cta,
      shortVersion: `${headline}. ${cta}.`,
      longVersion: `Se você sente que ${ctx.pain}, provavelmente já percebeu que soluções genéricas não bastam. ${ctx.product} foi posicionado para ${ctx.audience}, com foco em ${ctx.promise}. O objetivo é reduzir a dúvida, responder "${ctx.objections}" e conduzir para uma ação simples: ${cta}.`,
      aggressiveVersion: `Pare de aceitar ${ctx.pain}. ${ctx.product} entrega ${ctx.promise} para quem quer agir agora. ${cta}.`,
      emotionalVersion: `Imagine sair de ${ctx.pain} e finalmente sentir ${ctx.desire}. ${ctx.product} foi criado para esse momento. ${cta}.`,
      professionalVersion: `${ctx.product} ajuda ${ctx.audience} a superar ${ctx.pain} com uma proposta objetiva: ${ctx.promise}. ${cta}.`,
    };
  });
}

export function generateCopyModels(form: CreativeFormData): CopyVariation[] {
  const ctx = getFormContext(form);
  const models = [
    'AIDA',
    'PAS',
    'PASTOR',
    'BAB',
    'Antes e Depois',
    'Dor, Agitação e Solução',
    'Prova Social',
    'Oferta Direta',
    'Curiosidade',
    'Storytelling',
    'Comparação',
    'Urgência',
    'Escassez',
  ];

  return models.map((model, index) => {
    const headline = generateHeadlines(form, 10)[index % 10];
    const cta = generateCTAs(form, 5)[index % 5];
    return {
      id: createId('copy-model'),
      model,
      headline,
      mainText: `${model}: conecte ${ctx.pain} com ${ctx.promise}, responda "${ctx.objections}" e mostre por que ${ctx.product} é o próximo passo lógico para ${ctx.audience}.`,
      cta,
      shortVersion: `${headline}. ${cta}.`,
      longVersion: `Para ${ctx.audience}, o ponto de entrada é ${ctx.pain}. O texto deve ampliar o problema sem exagero, apresentar ${ctx.product} como solução e sustentar a promessa "${ctx.promise}" com clareza. Feche reduzindo a objeção principal: ${ctx.objections}.`,
      aggressiveVersion: `${ctx.audience}, pare de adiar ${ctx.desire}. ${ctx.product} resolve ${ctx.pain} com uma promessa simples: ${ctx.promise}.`,
      emotionalVersion: `A sensação de ${ctx.pain} pesa. A proposta de ${ctx.product} é transformar isso em ${ctx.desire}, com uma decisão mais segura e simples.`,
      professionalVersion: `A campanha posiciona ${ctx.product} para ${ctx.audience}, destacando ${ctx.promise}, objeções prioritárias e uma ação objetiva orientada a ${ctx.objective}.`,
    };
  });
}

export function generateShortVideoScripts(form: CreativeFormData, count = 5): ShortVideoScript[] {
  const ctx = getFormContext(form);
  const hooks = [
    `Você está perdendo dinheiro por medo de ${ctx.objections}?`,
    `Se ${ctx.pain} ainda trava você, veja isso.`,
    `Três segundos para entender por que ${ctx.product} importa.`,
    `O erro que quase todo mundo comete antes de ${ctx.desire}.`,
    `Não compre nada antes de comparar este caminho.`,
  ];

  return hooks.slice(0, count).map((hook, index) => ({
    id: createId('script'),
    title: `Roteiro ${index + 1}: ${emotionByIndex(index)}`,
    hook,
    development: `Mostre a rotina de ${ctx.audience} enfrentando ${ctx.pain} e explique por que isso acontece.`,
    patternBreak: 'Corte seco com mudança de cenário, zoom rápido ou pergunta na tela.',
    proof: `Demonstre como ${ctx.product} aproxima a pessoa de ${ctx.desire}.`,
    offer: `Apresente a solução como ${ctx.promise}.`,
    finalCta: generateCTAs(form, 5)[index % 5],
    narration: `${hook} O problema não é falta de vontade, é falta de um caminho claro. ${ctx.product} foi pensado para quem quer ${ctx.desire} sem ficar preso em ${ctx.objections}.`,
    onScreenText: `${ctx.pain} -> ${ctx.promise}`,
    sceneSuggestion: `Pessoa olhando métricas ou comparando antes/depois de ${ctx.product}.`,
    imageSuggestion: `Close em expressão de alívio, interface limpa ou resultado visual ligado a ${ctx.desire}.`,
    musicSuggestion: index % 2 === 0 ? 'Ritmo acelerado com cortes a cada 1,5s' : 'Trilha crescente com pausa antes da oferta',
    cutSuggestion: 'Gancho, demonstração, prova, oferta e CTA em cortes curtos.',
    estimatedDuration: index % 2 === 0 ? '18 a 24 segundos' : '25 a 32 segundos',
  }));
}

export function generateVisualPrompts(form: CreativeFormData, count = 5): VisualPrompt[] {
  const ctx = getFormContext(form);
  const styles = ['premium moderno', 'cinematográfico escuro', 'editorial limpo', 'tech minimalista', 'alto contraste comercial'];
  const colors = ['azul profundo, ciano e branco', 'preto, dourado e branco', 'grafite, verde e cinza claro', 'branco, azul e detalhes amarelos', 'roxo controlado, ciano e preto'];

  return styles.slice(0, count).map((style, index) => {
    const emotion = emotionByIndex(index);
    const prompt = `Imagem vertical 9:16 para anúncio de ${ctx.product}. Visual ${style}, cenário relacionado a ${ctx.audience}, objeto principal representando ${ctx.promise}, iluminação cinematográfica, cores ${colors[index]}, composição limpa com alto contraste, emoção de ${emotion}, câmera em ângulo ${index % 2 === 0 ? 'levemente baixo' : 'frontal'}, qualidade ultra detalhada, sem textos na imagem, sem logos falsos, sem marcas de terceiros.`;
    return {
      id: createId('visual'),
      title: `Prompt ${index + 1}: ${emotion}`,
      format: 'Imagem vertical para anúncio',
      visualStyle: style,
      setting: `Ambiente que represente ${ctx.audience} superando ${ctx.pain}`,
      mainSubject: ctx.product,
      lighting: 'Iluminação cinematográfica com recorte suave',
      colors: colors[index],
      composition: 'Composição limpa, foco central e espaço negativo para overlay externo',
      emotion,
      cameraAngle: index % 2 === 0 ? 'Ângulo levemente baixo' : 'Ângulo frontal',
      quality: 'Ultra detalhado, premium, nítido',
      forbiddenElements: 'Sem textos na imagem, sem logos falsos, sem marcas de terceiros',
      aspectRatio: '9:16',
      prompt,
    };
  });
}

export function generateCarouselIdeas(form: CreativeFormData, count = 5) {
  const ctx = getFormContext(form);
  return [
    `Slide 1: ${ctx.pain}. Slide 2: por que acontece. Slide 3: o custo oculto. Slide 4: ${ctx.promise}. Slide 5: CTA.`,
    `Antes: ${ctx.pain}. Depois: ${ctx.desire}. Meio: como ${ctx.product} cria a ponte.`,
    `5 objeções sobre ${ctx.product} e respostas objetivas para ${ctx.audience}.`,
    `Checklist visual para sair de ${ctx.pain} e avançar para ${ctx.desire}.`,
    `Comparativo entre solução genérica e ${ctx.product} com foco em ${ctx.promise}.`,
  ].slice(0, count);
}

export function generateSalesAngles(form: CreativeFormData, count = 5) {
  const ctx = getFormContext(form);
  return [
    `Redução de risco: responda "${ctx.objections}" antes da oferta.`,
    `Velocidade: mostre como ${ctx.product} encurta o caminho para ${ctx.desire}.`,
    `Autoridade: prove que ${ctx.promise} tem método e critério.`,
    `Contraste: compare ${ctx.pain} com a nova realidade desejada.`,
    `Simplicidade: transforme o benefício em um próximo passo pequeno.`,
  ].slice(0, count);
}

export function generateCreativeIdeas(form: CreativeFormData, count = 10): Creative[] {
  const ctx = getFormContext(form);
  const headlines = generateHeadlines(form, count);
  const ctas = generateCTAs(form, 5);
  const scripts = generateShortVideoScripts(form, 5);
  const prompts = generateVisualPrompts(form, 5);
  const now = new Date().toISOString();

  return headlines.map((headline, index) => {
    const emotion = emotionByIndex(index);
    const title = `${ctx.product} - ${emotion} ${index + 1}`;
    const copy = `${ctx.audience} quer ${ctx.desire}, mas ${ctx.pain} continua travando a decisão. Este criativo apresenta ${ctx.product} como uma forma clara de ${ctx.promise}, respondendo a objeção: ${ctx.objections}.`;
    const creative: Creative = {
      id: createId('creative'),
      campaignName: ctx.campaignName,
      product: ctx.product,
      audience: ctx.audience,
      pain: ctx.pain,
      desire: ctx.desire,
      objections: ctx.objections,
      promise: ctx.promise,
      platform: ctx.platform,
      type: ctx.type,
      tone: ctx.tone,
      objective: ctx.objective,
      title,
      description: `Ângulo ${emotion.toLowerCase()} para comunicar ${ctx.promise} e reduzir ${ctx.objections}.`,
      headline,
      copy,
      mainText: copy,
      caption: `${headline} ${ctas[index % ctas.length]}.`,
      script: scripts[index % scripts.length].narration,
      visualPrompt: prompts[index % prompts.length].prompt,
      suggestedVisual: prompts[index % prompts.length].mainSubject,
      cta: ctas[index % ctas.length],
      indicatedAudience: ctx.audience,
      emotion,
      aggressivenessLevel: Math.min(10, 3 + (index % 7)),
      estimatedConversionProbability: probabilityByIndex(index),
      status: 'Ideia',
      createdAt: now,
      updatedAt: now,
      metrics: {
        impressions: 1000 + index * 420,
        clicks: 18 + index * 5,
        ctr: Number((1.8 + index * 0.24).toFixed(2)),
        cpc: Number(Math.max(0.65, 3.1 - index * 0.18).toFixed(2)),
        conversions: 1 + index,
        cpa: Number(Math.max(8, 45 - index * 2.8).toFixed(2)),
        roi: Number((0.8 + index * 0.22).toFixed(2)),
        retention: Math.min(84, 32 + index * 5),
      },
      analysis: emptyAnalysis,
    };
    return {
      ...creative,
      analysis: analyzeCreativePerformance(creative),
    };
  }).slice(0, count);
}

export function generateCreativeBundle(form: CreativeFormData): CreativeGenerationResult {
  const ctx = getFormContext(form);
  return {
    ideas: generateCreativeIdeas(form, 10),
    headlines: generateHeadlines(form, 10),
    shortCalls: generateShortCalls(form, 10),
    copies: generateCopies(form, 5),
    scripts: generateShortVideoScripts(form, 5),
    carouselIdeas: generateCarouselIdeas(form, 5),
    ctas: generateCTAs(form, 5),
    salesAngles: generateSalesAngles(form, 5),
    emotionalVariations: [
      `Imagine finalmente sair de ${ctx.pain} e sentir ${ctx.desire}.`,
      `${ctx.product} para quem já cansou de tentar sozinho.`,
      `A decisão mais leve para quem busca ${ctx.promise}.`,
      `Transforme dúvida em confiança antes do próximo passo.`,
      `Mostre a vida depois que ${ctx.objections} deixa de travar a ação.`,
    ],
    directVariations: [
      `${ctx.product}: resolva ${ctx.pain} agora.`,
      `Oferta clara para ${ctx.audience}: ${ctx.promise}.`,
      `Pare de adiar ${ctx.desire}. Comece hoje.`,
      `Sem enrolação: veja como funciona.`,
      `Clique e compare antes de decidir.`,
    ],
    educationalVariations: [
      `Por que ${ctx.pain} acontece com ${ctx.audience}.`,
      `Como avaliar se ${ctx.product} faz sentido para você.`,
      `3 sinais de que ${ctx.objections} é só falta de clareza.`,
      `O mapa simples para chegar a ${ctx.desire}.`,
      `O que testar antes de escalar este anúncio.`,
    ],
    visualPrompts: generateVisualPrompts(form, 5),
  };
}

export function suggestCreativeImprovements(metrics: CreativeMetrics) {
  const suggestions: string[] = [];

  if (metrics.ctr < 1) {
    suggestions.push('Melhorar headline');
    suggestions.push('Usar gancho mais forte');
    suggestions.push('Colocar benefício mais claro');
    suggestions.push('Testar visual com mais contraste');
  }

  if (metrics.cpc > 3) {
    suggestions.push('Melhorar segmentação');
    suggestions.push('Tornar copy mais direta');
    suggestions.push('Usar promessa mais específica');
    suggestions.push('Remover público muito amplo');
  }

  if (metrics.conversions < 3 && metrics.clicks > 20) {
    suggestions.push('Melhorar CTA');
    suggestions.push('Adicionar prova social');
    suggestions.push('Trabalhar objeções');
    suggestions.push('Criar urgência');
    suggestions.push('Melhorar oferta');
  }

  if (metrics.retention > 0 && metrics.retention < 35) {
    suggestions.push('Melhorar os 3 primeiros segundos');
    suggestions.push('Cortar introdução');
    suggestions.push('Usar quebra de padrão');
    suggestions.push('Adicionar legenda dinâmica');
    suggestions.push('Acelerar ritmo do vídeo');
  }

  if (metrics.roi > 0 && metrics.roi < 1) {
    suggestions.push('Pausar criativo');
    suggestions.push('Testar nova headline');
    suggestions.push('Testar nova promessa');
    suggestions.push('Reduzir custo de aquisição');
    suggestions.push('Criar nova variação');
  }

  return Array.from(new Set(suggestions.length ? suggestions : ['Criar variação com promessa mais específica', 'Testar novo visual', 'Comparar novo CTA']));
}

export function calculateCreativeScore(metrics: CreativeMetrics) {
  const positive =
    Math.min(metrics.ctr * 8, 24) +
    Math.min(metrics.conversions * 3, 22) +
    Math.min(metrics.roi * 12, 24) +
    Math.min(metrics.retention * 0.28, 20);
  const negative = Math.min(metrics.cpc * 2.1, 12) + Math.min(metrics.cpa * 0.18, 12);
  return Math.max(0, Math.min(100, Math.round(22 + positive - negative)));
}

export function analyzeCreativePerformance(creative: Creative): CreativeAnalysis {
  const { metrics } = creative;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const nextTests: string[] = [];

  if (metrics.ctr >= 2) strengths.push('Gancho e headline chamam atenção');
  if (metrics.cpc > 0 && metrics.cpc <= 2) strengths.push('Custo por clique competitivo');
  if (metrics.conversions >= 5) strengths.push('Copy e oferta geram ação');
  if (metrics.roi >= 2) strengths.push('Potencial de escala positivo');
  if (metrics.retention >= 50) strengths.push('Boa retenção de atenção');

  if (metrics.ctr < 1) weaknesses.push('Headline ou visual com baixa força de parada');
  if (metrics.cpc > 3) weaknesses.push('Clique caro para a audiência atual');
  if (metrics.conversions < 3 && metrics.clicks > 20) weaknesses.push('Oferta ou CTA não convertem o tráfego');
  if (metrics.retention > 0 && metrics.retention < 35) weaknesses.push('Abertura do vídeo perde atenção cedo');
  if (metrics.roi > 0 && metrics.roi < 1) weaknesses.push('Retorno insuficiente para escala');

  nextTests.push('Testar headline com promessa mais específica');
  nextTests.push('Criar variação visual com mais contraste');
  if (creative.type.includes('Vídeo') || creative.platform.includes('TikTok') || creative.platform.includes('Shorts')) {
    nextTests.push('Testar gancho alternativo nos 3 primeiros segundos');
  }

  return {
    strengths: strengths.length ? strengths : ['Estrutura pronta para teste controlado'],
    weaknesses: weaknesses.length ? weaknesses : ['Ainda precisa de volume de dados para diagnóstico forte'],
    improvementSuggestions: suggestCreativeImprovements(metrics),
    nextTests,
  };
}

export function compareCreatives(left: Creative | null, right: Creative | null): CreativeComparison {
  if (!left || !right) {
    return {
      winner: null,
      probableReason: 'Selecione dois criativos para comparar.',
      strongestElement: 'Aguardando seleção',
      weakestElement: 'Aguardando seleção',
      nextRecommendedTest: 'Escolha dois criativos em teste.',
      notes: [],
    };
  }

  const leftScore = calculateCreativeScore(left.metrics);
  const rightScore = calculateCreativeScore(right.metrics);
  const winner = leftScore >= rightScore ? left : right;
  const loser = winner.id === left.id ? right : left;
  const notes: string[] = [];

  if (winner.metrics.ctr > loser.metrics.ctr) notes.push('CTR maior indica gancho/headline mais forte.');
  if (winner.metrics.cpc < loser.metrics.cpc || loser.metrics.cpc === 0) notes.push('CPC menor indica cliques mais baratos.');
  if (winner.metrics.conversions > loser.metrics.conversions) notes.push('Conversões maiores indicam oferta/copy mais eficiente.');
  if (winner.metrics.roi > loser.metrics.roi) notes.push('ROI maior indica criativo mais escalável.');
  if (winner.metrics.retention > loser.metrics.retention) notes.push('Retenção maior indica melhor capacidade de prender atenção.');

  const strongestElement =
    winner.metrics.roi >= loser.metrics.roi && winner.metrics.roi >= 2
      ? 'ROI e escalabilidade'
      : winner.metrics.ctr >= loser.metrics.ctr
        ? 'Headline e gancho'
        : 'Eficiência de clique';

  const weakestElement =
    winner.metrics.retention < 35
      ? 'Retenção inicial'
      : winner.metrics.conversions < loser.metrics.conversions
        ? 'Oferta e CTA'
        : 'Próxima variação visual';

  return {
    winner,
    probableReason: notes[0] ?? 'O score composto favorece equilíbrio entre atenção, custo e retorno.',
    strongestElement,
    weakestElement,
    nextRecommendedTest: `Criar uma variação do vencedor mantendo ${strongestElement.toLowerCase()} e testando ${weakestElement.toLowerCase()}.`,
    notes: notes.length ? notes : ['O resultado está próximo. Aumente volume de impressões antes de decidir escala.'],
  };
}

export function duplicateCreative(creative: Creative): Creative {
  const now = new Date().toISOString();
  return {
    ...creative,
    id: createId('creative'),
    title: `${creative.title} (cópia)`,
    status: 'Ideia',
    createdAt: now,
    updatedAt: now,
    metrics: { ...emptyMetrics },
    analysis: emptyAnalysis,
  };
}

export function updateCreativeStatus(creative: Creative, status: CreativeStatus): Creative {
  const updated = {
    ...creative,
    status,
    updatedAt: new Date().toISOString(),
  };
  return {
    ...updated,
    analysis: analyzeCreativePerformance(updated),
  };
}

export function createVariationFromCreative(creative: Creative, tone: CreativeTone = 'Direto'): Creative {
  const duplicated = duplicateCreative(creative);
  const form: CreativeFormData = {
    campaignName: creative.campaignName,
    product: creative.product,
    audience: creative.audience,
    pain: creative.pain,
    desire: creative.desire,
    objections: creative.objections,
    promise: creative.promise,
    tone,
    platform: platformOptions.includes(creative.platform as CreativePlatform) ? (creative.platform as CreativePlatform) : 'Instagram Reels',
    type: creativeTypeOptions.includes(creative.type as CreativeType) ? (creative.type as CreativeType) : 'Vídeo curto',
    objective: objectiveOptions.includes(creative.objective as CampaignObjective) ? (creative.objective as CampaignObjective) : 'Vender',
  };
  const headline = generateHeadlines(form, 10)[2];
  return {
    ...duplicated,
    title: `${creative.title} - variação ${tone.toLowerCase()}`,
    tone,
    headline,
    copy: `${creative.copy}\n\nVariação ${tone}: teste um gancho mais específico para ${creative.promise}.`,
    mainText: `${creative.mainText}\n\nVariação ${tone}: teste um gancho mais específico para ${creative.promise}.`,
    cta: generateCTAs(form, 5)[1],
    analysis: emptyAnalysis,
  };
}

export async function loadCreatives(userId: string): Promise<PersistenceResult<Creative[]>> {
  try {
    const snap = await getDocs(
      query(collection(db, 'creatives'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
    );
    const data = snap.docs.map((item) => normalizeCreative(item.data(), item.id));
    return { data, source: 'firestore' };
  } catch (error) {
    const data = readLocal<Creative>(userId, 'creatives').map((item) => normalizeCreative(item as unknown as Record<string, unknown>, item.id));
    return { data, source: 'localStorage', error: error instanceof Error ? error.message : 'Erro ao carregar Firestore' };
  }
}

export async function loadCreativeCampaigns(userId: string): Promise<PersistenceResult<CreativeCampaign[]>> {
  try {
    const snap = await getDocs(
      query(collection(db, 'campaigns'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
    );
    const data = snap.docs.map((item) => normalizeCampaign(item.data(), item.id));
    return { data, source: 'firestore' };
  } catch (error) {
    const data = readLocal<CreativeCampaign>(userId, 'campaigns').map((item) => normalizeCampaign(item as unknown as Record<string, unknown>, item.id));
    return { data, source: 'localStorage', error: error instanceof Error ? error.message : 'Erro ao carregar campanhas' };
  }
}

export async function saveCreative(userId: string, creative: Creative): Promise<PersistenceResult<Creative>> {
  const now = new Date().toISOString();
  const payload: Creative = {
    ...creative,
    userId,
    updatedAt: now,
    analysis: analyzeCreativePerformance(creative),
  };

  try {
    const ref = doc(collection(db, 'creatives'));
    const firestorePayload = { ...payload, id: ref.id, userId, createdAt: payload.createdAt || now, updatedAt: now };
    await setDoc(ref, firestorePayload);
    return { data: firestorePayload, source: 'firestore' };
  } catch (error) {
    const localCreative = { ...payload, id: payload.id || createId('creative'), createdAt: payload.createdAt || now };
    upsertLocalCreative(userId, localCreative);
    return { data: localCreative, source: 'localStorage', error: error instanceof Error ? error.message : 'Erro ao salvar localmente' };
  }
}

export async function updateCreative(userId: string, creative: Creative): Promise<PersistenceResult<Creative>> {
  const updated: Creative = {
    ...creative,
    userId,
    updatedAt: new Date().toISOString(),
    analysis: analyzeCreativePerformance(creative),
  };

  try {
    await updateDoc(doc(db, 'creatives', creative.id), { ...updated, updatedAt: updated.updatedAt });
    return { data: updated, source: 'firestore' };
  } catch (error) {
    upsertLocalCreative(userId, updated);
    return { data: updated, source: 'localStorage', error: error instanceof Error ? error.message : 'Erro ao atualizar localmente' };
  }
}

export async function removeCreative(userId: string, creativeId: string): Promise<PersistenceResult<string>> {
  try {
    await deleteDoc(doc(db, 'creatives', creativeId));
    return { data: creativeId, source: 'firestore' };
  } catch (error) {
    deleteLocalCreative(userId, creativeId);
    return { data: creativeId, source: 'localStorage', error: error instanceof Error ? error.message : 'Erro ao excluir localmente' };
  }
}

export async function createCreativeCampaign(
  userId: string,
  campaign: Pick<CreativeCampaign, 'name' | 'product' | 'audience' | 'objective'>
): Promise<PersistenceResult<CreativeCampaign>> {
  const now = new Date().toISOString();
  const localCampaign: CreativeCampaign = {
    id: createId('campaign'),
    userId,
    name: sanitizeText(campaign.name, 120) || 'Nova campanha',
    product: sanitizeText(campaign.product, 180),
    audience: sanitizeText(campaign.audience, 240),
    objective: sanitizeText(campaign.objective, 180),
    createdAt: now,
    creatives: [],
  };

  try {
    const ref = await addDoc(collection(db, 'campaigns'), {
      ...localCampaign,
      id: undefined,
      status: 'planned',
      channel: 'Criativos',
      startDate: '',
      endDate: '',
      source: 'creative-agent',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { data: { ...localCampaign, id: ref.id }, source: 'firestore' };
  } catch (error) {
    const campaigns = readLocal<CreativeCampaign>(userId, 'campaigns');
    writeLocal(userId, 'campaigns', [{ ...localCampaign }, ...campaigns]);
    return { data: localCampaign, source: 'localStorage', error: error instanceof Error ? error.message : 'Erro ao salvar campanha localmente' };
  }
}
