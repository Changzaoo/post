import { Paperclip, Smile, Mic, Send } from 'lucide-react';

interface Props {
  text: string;
  hashtags: string[];
  mediaUrl?: string | null;
  warnings: string[];
}

export function TelegramPreview({ text, hashtags, mediaUrl, warnings }: Props) {
  return (
    <div className="w-full max-w-[400px] mx-auto bg-[#212121] rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-[#2b5278] px-4 py-3 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-blue-400 flex items-center justify-center text-xs font-bold text-white">
          P
        </div>
        <div>
          <p className="text-sm font-semibold text-white">PostFlow Channel</p>
          <p className="text-xs text-blue-200">142 inscritos</p>
        </div>
      </div>

      {/* Message area */}
      <div className="p-4 space-y-4">
        <div className="flex items-start gap-2">
          <div className="max-w-[85%] bg-[#2b5278] rounded-lg rounded-tl-none px-3 py-2">
            <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">{text}</p>
            {hashtags.length > 0 && (
              <p className="text-xs text-blue-300 mt-1">{hashtags.join(' ')}</p>
            )}
            <p className="text-[10px] text-blue-200/60 text-right mt-1">12:30</p>
          </div>
        </div>

        {/* Media */}
        {mediaUrl && (
          <div className="rounded-lg overflow-hidden border border-gray-700 max-w-[85%]">
            <img src={mediaUrl} alt="Media" className="w-full object-cover" />
          </div>
        )}

        {/* Bot message */}
        <div className="flex items-start gap-2 justify-end">
          <div className="max-w-[85%] bg-[#8774e1] rounded-lg rounded-tr-none px-3 py-2">
            <p className="text-sm text-white">✅ Mensagem publicada com sucesso!</p>
            <p className="text-[10px] text-white/60 text-right mt-1">12:30</p>
          </div>
          <div className="h-7 w-7 rounded-full bg-purple-500 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white">
            B
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div className="border-t border-gray-700 p-2 flex items-center gap-2 bg-[#1f1f1f]">
        <Paperclip className="h-5 w-5 text-gray-400 cursor-pointer" />
        <Smile className="h-5 w-5 text-gray-400 cursor-pointer" />
        <div className="flex-1 bg-[#2b2b2b] rounded-lg px-3 py-2">
          <p className="text-sm text-gray-500">Mensagem...</p>
        </div>
        <Mic className="h-5 w-5 text-gray-400 cursor-pointer" />
        <Send className="h-5 w-5 text-blue-400 cursor-pointer" />
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="px-4 pb-3 space-y-1 border-t border-gray-800 pt-2 mt-2">
          {warnings.map((w, i) => (
            <p key={i} className="text-xs text-yellow-500">⚠️ {w}</p>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-gray-600 pb-2">Pré-visualização Telegram</p>
    </div>
  );
}