import type { Platform } from '../types';

export const PLATFORM_LOGOS: Record<Platform, string> = {
  tiktok:    'https://cdn.simpleicons.org/tiktok/000000',
  instagram: 'https://cdn.simpleicons.org/instagram/E4405F',
  x:         'https://cdn.simpleicons.org/x/000000',
  telegram:  'https://cdn.simpleicons.org/telegram/26A5E4',
  discord:   'https://cdn.simpleicons.org/discord/5865F2',
  youtube:   'https://cdn.simpleicons.org/youtube/FF0000',
  linkedin:  'https://cdn.simpleicons.org/linkedin/0A66C2',
  facebook:  'https://cdn.simpleicons.org/facebook/0866FF',
};

export function PlatformLogo({
  platform,
  size = 20,
  className = '',
}: {
  platform: Platform;
  size?: number;
  className?: string;
}) {
  const src = PLATFORM_LOGOS[platform];
  return (
    <img
      src={src}
      alt={platform}
      width={size}
      height={size}
      className={className}
      onError={(e) => {
        const target = e.currentTarget;
        target.style.display = 'none';
        const fallback = target.nextElementSibling as HTMLElement | null;
        if (fallback) fallback.style.display = 'flex';
      }}
    />
  );
}
