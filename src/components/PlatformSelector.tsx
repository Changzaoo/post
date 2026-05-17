import type { Platform } from '../types';
import { platformNames } from '../services/platforms';
import { PLATFORM_LOGOS } from '../lib/platformLogos';

interface Props {
  selected: Platform[];
  onChange: (platforms: Platform[]) => void;
}

const ALL_PLATFORMS: Platform[] = [
  'tiktok', 'instagram', 'x', 'telegram', 'discord', 'youtube', 'linkedin', 'facebook',
];

const PLATFORM_FALLBACK: Record<Platform, string> = {
  tiktok: '♫', instagram: '◈', x: '𝕏', telegram: '✈',
  discord: '◆', youtube: '▶', linkedin: 'in', facebook: 'f',
};

const PLATFORM_BG: Record<Platform, string> = {
  tiktok:    '#010101',
  instagram: '#e1306c',
  x:         '#1a1a1a',
  telegram:  '#26A5E4',
  discord:   '#5865F2',
  youtube:   '#FF0000',
  linkedin:  '#0A66C2',
  facebook:  '#0866FF',
};

export function PlatformSelector({ selected, onChange }: Props) {
  const toggle = (p: Platform) =>
    onChange(selected.includes(p) ? selected.filter((x) => x !== p) : [...selected, p]);

  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Publicar Em</p>
      <div className="flex flex-wrap gap-2">
        {ALL_PLATFORMS.map((p) => {
          const isSelected = selected.includes(p);
          return (
            <button
              key={p}
              type="button"
              onClick={() => toggle(p)}
              title={platformNames[p]}
              className={[
                'relative flex flex-col items-center gap-2 px-3 py-3 rounded-2xl',
                'border transition-all duration-200 cursor-pointer min-w-17',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                isSelected
                  ? 'border-emerald-500/60 bg-emerald-500/8 shadow-sm shadow-emerald-500/10'
                  : 'border-white/8 bg-white/3 hover:border-white/16 hover:bg-white/6 hover:shadow-sm hover:shadow-black/20',
              ].join(' ')}
            >
              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4l2 2L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}

              {/* Logo circle */}
              <div
                className="flex items-center justify-center rounded-full bg-white"
                style={{ width: 36, height: 36, flexShrink: 0 }}
              >
                <img
                  src={PLATFORM_LOGOS[p]}
                  alt={platformNames[p]}
                  width={20}
                  height={20}
                  style={{ display: 'block' }}
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.style.display = 'none';
                    const fb = img.nextElementSibling as HTMLElement | null;
                    if (fb) fb.style.display = 'flex';
                  }}
                />
                {/* Fallback */}
                <span
                  style={{
                    display: 'none',
                    width: 20, height: 20,
                    alignItems: 'center', justifyContent: 'center',
                    color: PLATFORM_BG[p], fontSize: 12, fontWeight: 700,
                  }}
                >
                  {PLATFORM_FALLBACK[p]}
                </span>
              </div>

              {/* Name */}
              <span
                className={`font-medium leading-none ${isSelected ? 'text-emerald-300' : 'text-slate-400'}`}
                style={{ fontSize: 10 }}
              >
                {platformNames[p].split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <p className="text-xs text-slate-500 mt-2.5">
          {selected.length} plataforma{selected.length > 1 ? 's' : ''} selecionada{selected.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
