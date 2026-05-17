import type { Platform, PublishResult } from '../types';
import { getPlatformService } from '../services/platforms';
import { adaptContent } from '../modules/ContentAdapter';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface PublishJob {
  userId: string;
  baseText: string;
  selectedPlatforms: Platform[];
  mediaUrl?: string | null;
  mediaType?: 'image' | 'video' | null;
}

export class PublishOrchestrator {
  /**
   * Orchestrates publishing to multiple platforms.
   * Validates content, calls each platform service, logs results to Firestore.
   */
  static async publish(job: PublishJob): Promise<{ success: boolean; results: PublishResult }> {
    const { userId, baseText, selectedPlatforms, mediaUrl, mediaType } = job;

    // Adapt content for all selected platforms
    const adapted = adaptContent(baseText, selectedPlatforms);

    const results: PublishResult = {
      tiktok: { status: 'pending' },
      instagram: { status: 'pending' },
      x: { status: 'pending' },
      telegram: { status: 'pending' },
      discord: { status: 'pending' },
    };

    // Publish to each platform in sequence
    for (const platform of selectedPlatforms) {
      const service = getPlatformService(platform);
      const content = adapted[platform];
      if (!content) {
        results[platform] = { status: 'error', message: 'Plataforma não suportada' };
        continue;
      }

      try {
        const result = await service.publish(
          content.text + (content.hashtags.length > 0 ? '\n\n' + content.hashtags.join(' ') : ''),
          content.hashtags,
          mediaUrl || undefined,
          mediaType || undefined
        );
        results[platform] = result;

        // Log to Firestore
        await addDoc(collection(db, 'platformLogs'), {
          userId,
          platform,
          action: 'publish',
          status: result.status === 'published' ? 'success' : 'error',
          message: result.message || result.status,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        results[platform] = {
          status: 'error',
          message: err instanceof Error ? err.message : 'Unknown error',
        };
      }
    }

    const success = Object.values(results).some((r) => r.status === 'published' || r.status === 'mocked');

    return { success, results };
  }

  /**
   * Validates content for all selected platforms before publishing.
   */
  static validate(job: PublishJob): Record<Platform, string[]> {
    const { baseText, selectedPlatforms } = job;
    const adapted = adaptContent(baseText, selectedPlatforms);
    const warnings: Record<Platform, string[]> = {} as Record<Platform, string[]>;

    for (const platform of selectedPlatforms) {
      const service = getPlatformService(platform);
      const content = adapted[platform];
      if (!content) { warnings[platform] = []; continue; }
      warnings[platform] = service.validate(
        content.text,
        content.hashtags,
        null // media file not available at validation time via orchestrator
      );
    }

    return warnings;
  }
}
