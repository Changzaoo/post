import { BasePlatformService, type PublishResult, type PlatformConfig } from './BaseService';
import type { Platform } from '../../types';

export class InstagramService extends BasePlatformService {
  constructor() {
    super('instagram' as Platform);
  }

  get name() { return 'Instagram'; }
  get icon() { return 'camera'; }

  validate(text: string, hashtags: string[], _mediaFile?: File | null): string[] {
    const warnings: string[] = [];
    if (!text?.trim()) warnings.push('O texto é obrigatório.');
    if (text.length > 2200) warnings.push('Limite de 2200 caracteres excedido.');
    if (hashtags.length > 30) warnings.push('Máximo de 30 hashtags.');
    return warnings;
  }

  async publish(text: string, hashtags: string[], mediaUrl?: string, mediaType?: 'image' | 'video'): Promise<PublishResult> {
    // Instagram requires Meta Business API + approved app - mocked mode
    console.log('Instagram publish (mocked):', { text, hashtags, mediaUrl, mediaType });
    return {
      status: 'mocked',
      message: '🔧 Instagram: Publicação simulada. Para publicar de verdade, é necessária uma conta Business ou Creator com o Meta Graph API aprovado. Acesse developers.facebook.com/docs/instagram-api.',
    };
  }

  async connect(): Promise<string> {
    return 'OAuth required - visit developers.facebook.com';
  }

  async disconnect(): Promise<void> { /* no-op */ }

  get status(): PlatformConfig {
    return { enabled: true, connected: false };
  }
}
