import { BasePlatformService, type PublishResult, type PlatformConfig } from './BaseService';
import type { Platform } from '../../types';

export class TikTokService extends BasePlatformService {
  constructor() {
    super('tiktok' as Platform);
  }

  get name() { return 'TikTok'; }
  get icon() { return 'music'; }

  validate(text: string, hashtags: string[], _mediaFile?: File | null): string[] {
    const warnings: string[] = [];
    if (!text?.trim()) warnings.push('O texto é obrigatório.');
    if (text.length > 150) warnings.push('Limite de 150 caracteres recomendado para TikTok.');
    if (hashtags.length > 5) warnings.push('Use no máximo 5 hashtags.');
    return warnings;
  }

  async publish(text: string, hashtags: string[], mediaUrl?: string, mediaType?: 'image' | 'video'): Promise<PublishResult> {
    // TikTok requires OAuth 2.0 authorization - mocked mode
    console.log('TikTok publish (mocked):', { text, hashtags, mediaUrl, mediaType });
    return {
      status: 'mocked',
      message: '🔧 TikTok: Publicação simulada. Para publicar de verdade, é necessário OAuth 2.0 com uma conta TikTok Business aprovada. Acesse developers.tiktok.com para solicitar acesso.',
    };
  }

  async connect(): Promise<string> {
    return 'OAuth required - visit developers.tiktok.com';
  }

  async disconnect(): Promise<void> { /* no-op */ }

  get status(): PlatformConfig {
    return { enabled: true, connected: false };
  }
}
