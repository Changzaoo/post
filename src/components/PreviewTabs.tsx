import { useState } from 'react';
import type { Platform, AdaptedContent } from '../types';
import { platformNames, platformColors } from '../services/platforms';
import { TikTokPreview } from './TikTokPreview';
import { InstagramPreview } from './InstagramPreview';
import { XPreview } from './XPreview';
import { TelegramPreview } from './TelegramPreview';
import { DiscordPreview } from './DiscordPreview';
import { cn } from '../lib/utils';
import { PLATFORM_LOGOS } from '../lib/platformLogos';

const PLATFORM_FALLBACK: Record<Platform, string> = {
  tiktok: '♫', instagram: '◈', x: '𝕏', telegram: '✈',
  discord: '◆', youtube: '▶', linkedin: 'in', facebook: 'f',
};

interface Props {
  adaptedContent: AdaptedContent | null;
  selectedPlatforms: Platform[];
  mediaUrl?: string | null;
}


function GenericPreview({ platform, text, hashtags, warnings }: {
  platform: Platform;
  text: string;
  hashtags: string[];
  warnings: string[];
}) {
  const color = platformColors[platform];
  return (
    <div className="rounded-xl border border-white/8 bg-white/3 p-4 space-y-3">
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white"
          style={{ flexShrink: 0 }}
        >
          <img
            src={PLATFORM_LOGOS[platform]}
            alt={platformNames[platform]}
            width={18}
            height={18}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
              if (fb) fb.style.display = 'flex';
            }}
          />
          <span
            style={{
              display: 'none', fontSize: 11, fontWeight: 700,
              color, alignItems: 'center', justifyContent: 'center',
            }}
          >
            {PLATFORM_FALLBACK[platform]}
          </span>
        </div>
        <span className="text-sm font-semibold text-slate-200">{platformNames[platform]}</span>
      </div>
      <p className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed">{text}</p>
      {hashtags.length > 0 && (
        <p className="text-xs font-medium" style={{ color }}>
          {hashtags.join(' ')}
        </p>
      )}
      {warnings.map((w, i) => (
        <p key={i} className="text-xs text-amber-400">⚠ {w}</p>
      ))}
    </div>
  );
}

export function PreviewTabs({ adaptedContent, selectedPlatforms, mediaUrl }: Props) {
  const [active, setActive] = useState<Platform | null>(null);

  if (selectedPlatforms.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-600 text-sm text-center px-4">
        Selecione ao menos uma plataforma para ver a prévia
      </div>
    );
  }

  const currentPlatform = active && selectedPlatforms.includes(active)
    ? active
    : selectedPlatforms[0];

  const getContent = (p: Platform) => {
    if (!adaptedContent || !adaptedContent[p]) {
      return {
        text: 'Clique em "Adaptar Conteúdo" para gerar o conteúdo adaptado para esta plataforma.',
        hashtags: [] as string[],
        warnings: [] as string[],
      };
    }
    return adaptedContent[p]!;
  };

  const renderPreview = (p: Platform) => {
    const content = getContent(p);
    const props = {
      text: content.text,
      hashtags: content.hashtags,
      mediaUrl,
      warnings: content.warnings,
    };

    switch (p) {
      case 'tiktok':    return <TikTokPreview {...props} />;
      case 'instagram': return <InstagramPreview {...props} />;
      case 'x':         return <XPreview {...props} />;
      case 'telegram':  return <TelegramPreview {...props} />;
      case 'discord':   return <DiscordPreview {...props} />;
      default:          return <GenericPreview platform={p} {...props} />;
    }
  };

  return (
    <div>
      {/* Platform tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {selectedPlatforms.map((p) => {
          const isActive = p === currentPlatform;
          const color = platformColors[p];
          return (
            <button
              key={p}
              type="button"
              onClick={() => setActive(p)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                isActive ? 'text-white' : 'text-slate-500 bg-white/3 hover:text-slate-300 border border-white/7'
              )}
              style={
                isActive
                  ? {
                      backgroundColor: color + '22',
                      borderWidth: 1,
                      borderColor: color + '55',
                      borderStyle: 'solid',
                    }
                  : {}
              }
            >
              {/* Logo inside small white pill */}
              <span className="inline-flex items-center justify-center bg-white rounded-md" style={{ width: 16, height: 16, flexShrink: 0 }}>
                <img
                  src={PLATFORM_LOGOS[p]}
                  alt={p}
                  width={10}
                  height={10}
                  style={{ display: 'block' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
                    if (fb) fb.style.display = 'inline';
                  }}
                />
                <span style={{ display: 'none', fontSize: 8 }}>{PLATFORM_FALLBACK[p]}</span>
              </span>
              {platformNames[p].split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* Preview */}
      <div className="overflow-auto max-h-140 rounded-xl">
        {renderPreview(currentPlatform)}
      </div>
    </div>
  );
}
