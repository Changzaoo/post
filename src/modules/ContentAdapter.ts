import type { Platform, AdaptedContent, PlatformContent } from '../types';

export const CHARACTER_LIMITS: Partial<Record<Platform, number>> = {
  tiktok: 150,
  instagram: 2200,
  x: 280,
  telegram: 4096,
  discord: 2000,
  youtube: 5000,
  linkedin: 3000,
  facebook: 63206,
};

function dedupeHashtags(hashtags: string[]): string[] {
  const seen = new Set<string>();
  return hashtags.filter((h) => {
    const lower = h.toLowerCase();
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });
}

function extractKeywords(baseText: string, count: number): string[] {
  const stopWords = new Set([
    'para', 'como', 'mais', 'muito', 'sobre', 'com', 'uma', 'por',
    'este', 'essa', 'isso', 'que', 'não', 'mas', 'ele', 'ela',
    'the', 'and', 'for', 'with', 'this', 'that', 'from', 'are',
  ]);
  const words = baseText
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w));
  const unique = [...new Set(words)];
  return unique.slice(0, count).map((w) => `#${w}`);
}

function getWarnings(platform: Platform, text: string, hashtags: string[]): string[] {
  const warnings: string[] = [];
  const limit = CHARACTER_LIMITS[platform];

  if (!text.trim()) {
    warnings.push('O texto é obrigatório.');
    return warnings;
  }

  if (platform === 'x') {
    const totalLen = text.length + (hashtags.length > 0 ? 1 + hashtags.join(' ').length : 0);
    if (totalLen > 280) warnings.push(`Limite de 280 caracteres do X excedido (${totalLen}).`);
    if (hashtags.length > 2) warnings.push('Use no máximo 1-2 hashtags no X.');
  } else if (limit && text.length > limit) {
    warnings.push(`Limite de ${limit} caracteres excedido (${text.length}).`);
  }

  if (platform === 'instagram' && hashtags.length > 30) warnings.push('Máximo de 30 hashtags no Instagram.');
  if (platform === 'tiktok' && hashtags.length > 5) warnings.push('Use 3-5 hashtags no TikTok.');

  return warnings;
}

function buildEntry(text: string, hashtags: string[], platform: Platform): PlatformContent {
  const warnings = getWarnings(platform, text, hashtags);
  const charCount = platform === 'x'
    ? text.length + (hashtags.length > 0 ? 1 + hashtags.join(' ').length : 0)
    : text.length;
  const isValid = !warnings.some((w) => w.includes('Limite') || w.includes('obrigatório'));
  return { text, hashtags, warnings, characterCount: charCount, isValid };
}

export function adaptContent(baseText: string, _platforms?: Platform[]): AdaptedContent {
  const keywords = extractKeywords(baseText, 10);

  // TikTok
  const tiktokText = baseText.length > 130 ? baseText.slice(0, 127) + '...' : baseText;
  const tiktokHashtags = dedupeHashtags(['#fyp', '#viral', '#trending', ...keywords.slice(0, 2)]);

  // Instagram
  const instagramText = baseText.split(/[.!?]+/).filter((s) => s.trim()).map((s) => s.trim()).join('\n\n') || baseText;
  const instagramHashtags = dedupeHashtags([...keywords.slice(0, 10)]);

  // X
  const xHashtags = dedupeHashtags(keywords.slice(0, 2));
  const hashtagStr = xHashtags.length > 0 ? ' ' + xHashtags.join(' ') : '';
  const maxXLen = 280 - hashtagStr.length;
  const xText = baseText.length > maxXLen ? baseText.slice(0, maxXLen - 3) + '...' : baseText;

  // Telegram
  const telegramText = `📢 **${baseText.split(' ').slice(0, 8).join(' ')}...**\n\n${baseText}\n\n👇 Compartilhe com seus amigos!`;

  // Discord
  const discordText = `> **📣 Nova Publicação via PostFlow**\n\n${baseText}\n\n---\n*Compartilhado via PostFlow* 🚀`;

  // YouTube
  const youtubeText = `${baseText}\n\n📌 Descrição gerada pelo PostFlow.\n\n${keywords.slice(0, 5).join(' ')}`;

  // LinkedIn
  const linkedinText = `${baseText}\n\n💼 Publicado via PostFlow\n\n${keywords.slice(0, 3).join(' ')}`;

  // Facebook
  const facebookText = `${baseText}\n\n${keywords.slice(0, 5).join(' ')}`;

  return {
    tiktok: buildEntry(tiktokText, tiktokHashtags, 'tiktok'),
    instagram: buildEntry(instagramText, instagramHashtags, 'instagram'),
    x: buildEntry(xText, xHashtags, 'x'),
    telegram: buildEntry(telegramText, [], 'telegram'),
    discord: buildEntry(discordText, [], 'discord'),
    youtube: buildEntry(youtubeText, keywords.slice(0, 5), 'youtube'),
    linkedin: buildEntry(linkedinText, keywords.slice(0, 3), 'linkedin'),
    facebook: buildEntry(facebookText, keywords.slice(0, 5), 'facebook'),
  };
}

export function validateContent(
  platform: Platform,
  text: string,
  _hashtags: string[],
  mediaFile?: File | null
): string[] {
  const warnings: string[] = [];
  const limit = CHARACTER_LIMITS[platform];

  if (!text || text.trim().length === 0) warnings.push('O texto é obrigatório.');
  if (limit && text.length > limit) warnings.push(`Limite de ${limit} caracteres excedido (${text.length}).`);
  if (platform === 'tiktok' && !mediaFile) warnings.push('TikTok requer um vídeo ou imagem.');
  if (platform === 'instagram' && !mediaFile) warnings.push('Instagram requer uma imagem ou vídeo.');

  return warnings;
}

export { CHARACTER_LIMITS as characterLimits };
