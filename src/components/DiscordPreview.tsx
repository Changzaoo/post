import { Hash, Anchor } from 'lucide-react';

interface Props {
  text: string;
  hashtags: string[];
  mediaUrl?: string | null;
  warnings: string[];
}

export function DiscordPreview({ text, hashtags, mediaUrl, warnings }: Props) {
  return (
    <div className="w-full max-w-[500px] mx-auto bg-[#313338] rounded-xl border border-gray-800 overflow-hidden">
      {/* Channel header */}
      <div className="bg-[#2b2d31] px-4 py-2 flex items-center gap-2 border-b border-gray-800">
        <Hash className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-semibold text-white">publicaçoes</span>
        <span className="text-xs text-gray-500 ml-auto">📱 PostFlow</span>
      </div>

      {/* Message */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">
            PF
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">PostFlow</span>
              <span className="text-[10px] text-gray-500">Hoje às 12:30</span>
            </div>
            <div className="mt-1 text-[15px] text-gray-100 whitespace-pre-wrap leading-relaxed">
              {text}
            </div>
            {hashtags.length > 0 && (
              <p className="mt-1 text-sm text-blue-400">{hashtags.join(' ')}</p>
            )}

            {/* Embed style */}
            <div className="mt-3 border-l-4 border-blue-500 bg-[#2b2d31] rounded-r-lg p-3">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">PostFlow</p>
              <p className="text-sm text-gray-300 mt-1">Plataforma de publicação multicanal</p>
              <p className="text-xs text-gray-500 mt-1">Compartilhado via PostFlow</p>
            </div>

            {/* Media */}
            {mediaUrl && (
              <div className="mt-3 rounded-lg overflow-hidden border border-gray-700 max-w-[400px]">
                <img src={mediaUrl} alt="Media" className="w-full object-cover" />
              </div>
            )}

            {/* Reactions */}
            <div className="mt-2 flex items-center gap-1">
              <div className="flex items-center gap-1 bg-[#2b2d31] rounded-lg px-2 py-0.5 text-xs text-gray-400 cursor-pointer hover:border hover:border-gray-600">
                🚀 1
              </div>
              <div className="flex items-center gap-1 bg-[#2b2d31] rounded-lg px-2 py-0.5 text-xs text-gray-400 cursor-pointer hover:border hover:border-gray-600">
                👍 3
              </div>
              <div className="flex items-center gap-1 bg-[#2b2d31] rounded-lg px-2 py-0.5 text-xs text-gray-400 cursor-pointer hover:border hover:border-gray-600">
                💬 Responder
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div className="border-t border-gray-800 p-3 mx-3 mb-3 bg-[#383a40] rounded-lg flex items-center gap-2">
        <div className="flex-1 text-sm text-gray-500">Mensagem para #{'publicaçoes'}...</div>
        <Anchor className="h-4 w-4 text-gray-400" />
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="px-4 pb-3 space-y-1 border-t border-gray-800 pt-2">
          {warnings.map((w, i) => (
            <p key={i} className="text-xs text-yellow-500">⚠️ {w}</p>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-gray-600 pb-2">Pré-visualização Discord</p>
    </div>
  );
}