import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';

interface Props {
  text: string;
  hashtags: string[];
  mediaUrl?: string | null;
  warnings: string[];
}

export function InstagramPreview({ text, hashtags, mediaUrl, warnings }: Props) {
  return (
    <div className="w-full max-w-[400px] mx-auto bg-black rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
            P
          </div>
          <div>
            <p className="text-sm font-semibold text-white">postflow</p>
            <p className="text-xs text-gray-500">Sugestão de publicação</p>
          </div>
        </div>
        <MoreHorizontal className="h-5 w-5 text-gray-400" />
      </div>

      {/* Media */}
      <div className="aspect-square bg-gray-900 flex items-center justify-center">
        {mediaUrl ? (
          <img src={mediaUrl} alt="Media" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center text-gray-600">
            <svg className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">Sem mídia</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-4">
          <Heart className="h-6 w-6 text-white hover:text-red-500 cursor-pointer" />
          <MessageCircle className="h-6 w-6 text-white cursor-pointer" />
          <Send className="h-6 w-6 text-white cursor-pointer" />
        </div>
        <Bookmark className="h-6 w-6 text-white cursor-pointer" />
      </div>

      {/* Content */}
      <div className="px-4 pb-4 space-y-1">
        <p className="text-sm font-semibold text-white">1.234 curtidas</p>
        <p className="text-sm text-white/90">
          <span className="font-semibold">postflow</span> {text}
        </p>
        <p className="text-sm text-blue-400">{hashtags.join(' ')}</p>
        <p className="text-xs text-gray-500">Ver todos os 45 comentários</p>
        <p className="text-xs text-gray-600">Há 1 hora</p>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="px-4 pb-3 space-y-1 border-t border-gray-800 pt-2">
          {warnings.map((w, i) => (
            <p key={i} className="text-xs text-yellow-500">⚠️ {w}</p>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-gray-600 pb-2">Pré-visualização Instagram</p>
    </div>
  );
}