import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

interface Props {
  onFileSelect: (file: File | null) => void;
  currentFile?: File | null;
}

export function MediaUploader({ onFileSelect, currentFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(
    currentFile ? URL.createObjectURL(currentFile) : null
  );

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      alert('Unsupported format. Use images or videos.');
      return;
    }
    if (isImage && file.size > 8 * 1024 * 1024) {
      alert('Image too large. Maximum 8MB.');
      return;
    }
    if (isVideo && file.size > 1024 * 1024 * 1024) {
      alert('Video too large. Maximum 1GB.');
      return;
    }

    setPreview(URL.createObjectURL(file));
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const clearFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex gap-3">
      {/* Preview card */}
      {preview && (
        <div className="relative shrink-0">
          {currentFile?.type.startsWith('video/') ? (
            <video src={preview} className="h-20 w-20 rounded-xl object-cover" />
          ) : (
            <img src={preview} alt="Preview" className="h-20 w-20 rounded-xl object-cover" />
          )}
          <button
            onClick={clearFile}
            className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Add Media card */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-1.5 h-20 px-5 rounded-xl border-2 border-dashed border-white/12 bg-white/3 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all cursor-pointer"
      >
        <Upload className="h-5 w-5 text-slate-500" />
        <p className="text-xs font-medium text-slate-500">Adicionar Mídia</p>
        <p className="text-xs text-slate-600" style={{ fontSize: 10 }}>Imagem ou Vídeo (até 1GB)</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
