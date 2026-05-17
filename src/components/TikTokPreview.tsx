import { Music, Heart, MessageCircle, Bookmark } from 'lucide-react';

interface Props {
  text: string;
  hashtags: string[];
  mediaUrl?: string | null;
  warnings: string[];
}

export function TikTokPreview({ text, hashtags, mediaUrl, warnings }: Props) {
  return (
    <div className="w-full max-w-[340px] mx-auto">
      <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-gradient-to-b from-gray-900 to-black border border-gray-800 shadow-2xl">
        {/* Media area */}
        <div className="absolute inset-0 flex items-center justify-center">
          {mediaUrl ? (
            <img src={mediaUrl} alt="Media" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-4">
              <Music className="h-10 w-10 text-gray-700 mx-auto mb-2" />
              <p className="text-xs text-gray-600">Mídia não adicionada</p>
            </div>
          )}
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />

        {/* TikTok UI overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">
              P
            </div>
            <span className="text-sm font-semibold text-white">@postflow</span>
          </div>
          <p className="text-sm text-white/90 line-clamp-3 mb-1">{text}</p>
          <p className="text-sm text-blue-400">{hashtags.join(' ')}</p>
        </div>

        {/* Side icons */}
        <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4">
          <div className="flex flex-col items-center">
            <Heart className="h-6 w-6 text-white" />
            <span className="text-xs text-white/70">12.4K</span>
          </div>
          <div className="flex flex-col items-center">
            <MessageCircle className="h-6 w-6 text-white" />
            <span className="text-xs text-white/70">892</span>
          </div>
          <div className="flex flex-col items-center">
            <Bookmark className="h-6 w-6 text-white" />
            <span className="text-xs text-white/70">2.1K</span>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mt-2 space-y-1">
          {warnings.map((w, i) => (
            <p key={i} className="text-xs text-yellow-500 flex items-center gap-1">
              <span>⚠️</span> {w}
            </p>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-600 mt-2 text-center">Pré-visualização TikTok</p>
    </div>
  );
}