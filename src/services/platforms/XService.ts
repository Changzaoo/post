import { BasePlatformService, type PublishResult, type PlatformConfig } from './BaseService';
import type { Platform } from '../../types';

export class XService extends BasePlatformService {
  constructor() {
    super('x' as Platform);
  }

  get name() { return 'X (Twitter)'; }
  get icon() { return 'message-circle'; }

  validate(text: string, hashtags: string[], _mediaFile?: File | null): string[] {
    const warnings: string[] = [];
    if (!text?.trim()) warnings.push('O texto é obrigatório.');
    const total = text.length + (hashtags.length > 0 ? 1 + hashtags.join(' ').length : 0);
    if (total > 280) warnings.push(`Limite de 280 caracteres do X excedido (${total} chars).`);
    if (hashtags.length > 2) warnings.push('Use no máximo 1-2 hashtags no X para melhor engajamento.');
    return warnings;
  }

  async publish(text: string, hashtags: string[], mediaUrl?: string, mediaType?: 'image' | 'video'): Promise<PublishResult> {
    // X (Twitter) requires OAuth 2.0 with elevated access - mocked mode
    console.log('X publish (mocked):', { text, hashtags, mediaUrl, mediaType });
    return {
      status: 'mocked',
      message: '🔧 X (Twitter): Publicação simulada. Para publicar de verdade, é necessário acesso à API X v2 com OAuth 2.0. Acesse developer.twitter.com para solicitar acesso.',
    };
  }

  async connect(): Promise<string> {
    return 'OAuth required - visit developer.twitter.com';
  }

  async disconnect(): Promise<void> { /* no-op */ }

  get status(): PlatformConfig {
    return { enabled: true, connected: false };
  }
}
