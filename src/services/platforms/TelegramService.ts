import { BasePlatformService, type PublishResult, type PlatformConfig } from './BaseService';
import type { Platform } from '../../types';

export class TelegramService extends BasePlatformService {
  constructor() {
    super('telegram' as Platform);
  }

  get name() { return 'Telegram'; }
  get icon() { return 'send'; }

  validate(text: string, _hashtags: string[], _mediaFile?: File | null): string[] {
    const warnings: string[] = [];
    if (!text?.trim()) warnings.push('O texto é obrigatório.');
    if (text.length > 4096) warnings.push('Limite de 4096 caracteres excedido.');
    return warnings;
  }

  async publish(text: string, _hashtags: string[], mediaUrl?: string, mediaType?: 'image' | 'video'): Promise<PublishResult> {
    try {
      const res = await fetch('/api/publish/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          mediaUrl,
          mediaType,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
        return { status: 'error', message: data.message || `HTTP ${res.status}` };
      }

      return await res.json();
    } catch (err) {
      return { status: 'error', message: `Telegram: ${err instanceof Error ? err.message : 'Erro desconhecido'}` };
    }
  }

  async connect(): Promise<string> {
    return 'configure';
  }

  async disconnect(): Promise<void> {
    // No-op: credentials are managed via backend env vars
  }

  get status(): PlatformConfig {
    return { enabled: true, connected: true };
  }
}
