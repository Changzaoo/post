import type { Platform, PublishStatus } from '../../types';

export interface PublishResult {
  status: PublishStatus;
  message?: string;
  postId?: string;
}

export interface PlatformConfig {
  enabled: boolean;
  connected: boolean;
}

export abstract class BasePlatformService {
  protected platform: Platform;

  constructor(platform: Platform) {
    this.platform = platform;
  }

  abstract get name(): string;
  abstract get icon(): string;

  abstract validate(text: string, hashtags: string[], mediaFile?: File | null): string[];
  abstract publish(text: string, hashtags: string[], mediaUrl?: string, mediaType?: 'image' | 'video'): Promise<PublishResult>;
  abstract connect(): Promise<string>;
  abstract disconnect(): Promise<void>;
  abstract get status(): PlatformConfig;

  getPreviewData(text: string, hashtags: string[], mediaUrl?: string | null) {
    return {
      text,
      hashtags,
      mediaUrl: mediaUrl || null,
      warnings: this.validate(text, hashtags),
    };
  }
}