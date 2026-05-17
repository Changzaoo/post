import { MoreHorizontal, MessageCircle, Repeat2, Heart, BarChart3, Share2 } from 'lucide-react';

interface Props {
  text: string;
  hashtags: string[];
  mediaUrl?: string | null;
  warnings: string[];
}

export function XPreview({ text, hashtags, mediaUrl, warnings }: Props) {
  const charCount = text.length;
  const remaining = 280 - charCount;

  return (
    <div className="w-full max-w-[500px] mx-auto bg-black rounded-xl border border-gray-800 p-4">
      {/* Tweet header */}
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center text-sm font-bold text-white">
          P
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">PostFlow</span>
            <span className="text-sm text-gray-500">@postflow_app</span>
            <span className="text-xs text-gray-600">· 2h</span>
            <MoreHorizontal className="h-4 w-4 text-gray-500 ml-auto cursor-pointer" />
          </div>
          <p className="mt-1 text-[15px] text-white/90 leading-relaxed whitespace-pre-wrap">{text}</p>
          {hashtags.length > 0 && (
            <p className="mt-1 text-sm text-blue-400">{hashtags.join(' ')}</p>
          )}

          {/* Media */}
          {mediaUrl && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-gray-800">
              <img src={mediaUrl} alt="Media" className="w-full max-h-72 object-cover" />
            </div>
          )}

          {/* Character counter */}
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  remaining < 0 ? 'bg-red-500' : remaining < 20 ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, (charCount / 280) * 100)}%` }}
              />
            </div>
            <span className={`text-xs ${remaining < 0 ? 'text-red-500' : 'text-gray-500'}`}>
              {remaining}
            </span>
          </div>

          {/* Actions */}
          <div className="mt-3 flex items-center justify-between max-w-md">
            <div className="flex items-center gap-1 text-gray-500 hover:text-blue-400 cursor-pointer">
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">24</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 hover:text-green-400 cursor-pointer">
              <Repeat2 className="h-4 w-4" />
              <span className="text-xs">8</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 hover:text-red-400 cursor-pointer">
              <Heart className="h-4 w-4" />
              <span className="text-xs">142</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 hover:text-blue-400 cursor-pointer">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs">2.1K</span>
            </div>
            <Share2 className="h-4 w-4 text-gray-500 hover:text-blue-400 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-800 space-y-1">
          {warnings.map((w, i) => (
            <p key={i} className="text-xs text-yellow-500">⚠️ {w}</p>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-600 mt-3 text-center">Pré-visualização X</p>
    </div>
  );
}