import { BasePlatformService, type PublishResult, type PlatformConfig } from './BaseService';
import type { Platform } from '../../types';

export interface DiscordWebhook {
  id: string;
  name: string;
  url: string;
}

export class DiscordService extends BasePlatformService {
  constructor() {
    super('discord' as Platform);
  }

  get name() { return 'Discord'; }
  get icon() { return 'hash'; }

  validate(text: string, _hashtags: string[], _mediaFile?: File | null): string[] {
    const warnings: string[] = [];
    if (!text?.trim()) warnings.push('O texto é obrigatório.');
    if (text.length > 2000) warnings.push('Limite de 2000 caracteres excedido.');
    return warnings;
  }

  async publish(text: string, _hashtags: string[], mediaUrl?: string, mediaType?: 'image' | 'video'): Promise<PublishResult> {
    try {
      const res = await fetch('/api/publish/discord', {
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
      return { status: 'error', message: `Discord: ${err instanceof Error ? err.message : 'Erro desconhecido'}` };
    }
  }

  async connect(): Promise<string> {
    return 'configure';
  }

  async disconnect(): Promise<void> {
    // No-op: webhook configured via backend env vars
  }

  get status(): PlatformConfig {
    return { enabled: true, connected: true };
  }
}

export const discordService = new DiscordService();
