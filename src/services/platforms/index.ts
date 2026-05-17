import type { Platform, PublishStatus } from '../../types';
import { TikTokService } from './TikTokService';
import { InstagramService } from './InstagramService';
import { XService } from './XService';
import { TelegramService } from './TelegramService';
import { DiscordService } from './DiscordService';
import { BasePlatformService } from './BaseService';

export { BasePlatformService };
export { TikTokService } from './TikTokService';
export { InstagramService } from './InstagramService';
export { XService } from './XService';
export { TelegramService } from './TelegramService';
export { DiscordService, type DiscordWebhook } from './DiscordService';

// Stub service for platforms not yet implemented
class StubService extends BasePlatformService {
  private _label: string;
  constructor(p: Platform) {
    super(p);
    this._label = p;
  }
  get name() { return this._label; }
  get icon() { return '●'; }
  get status() { return { enabled: false, connected: false }; }
  validate() { return []; }
  async publish(): Promise<{ status: PublishStatus; message: string }> {
    return { status: 'mocked', message: `${this._label} — modo simulado (API não configurada)` };
  }
  async connect() { return ''; }
  async disconnect() { /* noop */ }
}

const coreServices: Partial<Record<Platform, BasePlatformService>> = {
  tiktok: new TikTokService(),
  instagram: new InstagramService(),
  x: new XService(),
  telegram: new TelegramService(),
  discord: new DiscordService(),
};

export function getPlatformService(platform: Platform): BasePlatformService {
  return coreServices[platform] ?? new StubService(platform);
}

export function getAllServices(): Partial<Record<Platform, BasePlatformService>> {
  return coreServices;
}

export const platformNames: Record<Platform, string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  x: 'X (Twitter)',
  telegram: 'Telegram',
  discord: 'Discord',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
};

export const platformColors: Record<Platform, string> = {
  tiktok: '#ff0050',
  instagram: '#e1306c',
  x: '#1da1f2',
  telegram: '#0088cc',
  discord: '#5865f2',
  youtube: '#ff0000',
  linkedin: '#0077b5',
  facebook: '#1877f2',
};
