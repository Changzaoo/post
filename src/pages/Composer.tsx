import { useState, useEffect, useRef, useCallback } from 'react';
import { Layout } from '../components/Layout';
import { MediaUploader } from '../components/MediaUploader';
import { adaptContent } from '../modules/ContentAdapter';
import { getPlatformService } from '../services/platforms/index';
import { platformColors } from '../services/platforms/index';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import type { Platform, AdaptedContent, PublishResult } from '../types';
import { PLATFORM_LOGOS } from '../lib/platformLogos';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, Save, CheckCircle, RefreshCw, Hash,
  Eye, ChevronDown, ImagePlus, Type, FileText,
} from 'lucide-react';

const ALL_PLATFORMS: Platform[] = ['tiktok', 'instagram', 'x', 'telegram', 'discord', 'youtube', 'linkedin', 'facebook'];

const PLATFORM_LABELS: Record<Platform, string> = {
  tiktok: 'TikTok', instagram: 'Instagram', x: 'X', telegram: 'Telegram',
  discord: 'Discord', youtube: 'YouTube', linkedin: 'LinkedIn', facebook: 'Facebook',
};

const PLATFORM_ICON_CHAR: Record<Platform, string> = {
  tiktok: '♫', instagram: '◈', x: '𝕏', telegram: '✈',
  discord: '◆', youtube: '▶', linkedin: 'in', facebook: 'f',
};

function generateHashtagSuggestions(text: string): string[] {
  if (!text.trim()) return ['#content', '#socialmedia', '#marketing', '#viral', '#trending'];
  const stopWords = new Set([
    'para', 'como', 'mais', 'muito', 'sobre', 'com', 'uma', 'por',
    'este', 'essa', 'isso', 'que', 'não', 'mas', 'ele', 'ela',
    'the', 'and', 'for', 'with', 'this', 'that', 'from', 'are', 'was', 'have',
  ]);
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w));
  const unique = [...new Set(words)];
  const result = unique.slice(0, 5).map((w) => `#${w}`);
  while (result.length < 5) {
    const fallbacks = ['#content', '#socialmedia', '#marketing', '#viral', '#trending', '#digital', '#creator'];
    const fb = fallbacks.find(f => !result.includes(f));
    if (fb) result.push(fb); else break;
  }
  return result;
}

function PlatformLogo({ platform, size = 18 }: { platform: Platform; size?: number }) {
  const [imgError, setImgError] = useState(false);
  if (imgError) {
    return (
      <span style={{ fontSize: size * 0.65, fontWeight: 800, color: platformColors[platform] }}>
        {PLATFORM_ICON_CHAR[platform]}
      </span>
    );
  }
  return (
    <img
      src={PLATFORM_LOGOS[platform]}
      alt={platform}
      width={size}
      height={size}
      style={{ display: 'block' }}
      onError={() => setImgError(true)}
    />
  );
}

export function Composer() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [baseText, setBaseText] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [adaptedContent, setAdaptedContent] = useState<AdaptedContent | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishResults, setPublishResults] = useState<PublishResult | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const [hashtagSuggestions, setHashtagSuggestions] = useState<string[]>([
    '#content', '#socialmedia', '#marketing', '#viral', '#trending',
  ]);
  const [activeTab, setActiveTab] = useState<'write' | 'media'>('write');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateLiveData = useCallback((text: string, platforms: Platform[]) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (text.trim()) {
        setHashtagSuggestions(generateHashtagSuggestions(text));
        if (platforms.length > 0) setAdaptedContent(adaptContent(text, platforms));
      }
    }, 500);
  }, []);

  useEffect(() => {
    updateLiveData(baseText, selectedPlatforms);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [baseText, selectedPlatforms, updateLiveData]);

  const handleAdapt = () => {
    if (!baseText.trim() || selectedPlatforms.length === 0) return;
    setAdaptedContent(adaptContent(baseText, selectedPlatforms));
  };

  const uploadMedia = async (): Promise<string | null> => {
    if (!mediaFile || !user) return null;
    const storageRef = ref(storage, `media/${user.uid}/${Date.now()}_${mediaFile.name}`);
    const snapshot = await uploadBytes(storageRef, mediaFile);
    return await getDownloadURL(snapshot.ref);
  };

  const handlePublish = async () => {
    if (!user) return;
    setPublishing(true);
    setPublishResults(null);
    try {
      let mediaUrl: string | null = null;
      if (mediaFile) mediaUrl = await uploadMedia();
      const contentToUse = adaptedContent ?? adaptContent(baseText, selectedPlatforms);
      const results: PublishResult = {};
      for (const platform of selectedPlatforms) {
        const service = getPlatformService(platform);
        const adapted = contentToUse[platform];
        if (!adapted) { results[platform] = { status: 'error', message: 'Plataforma não suportada' }; continue; }
        try {
          const result = await service.publish(
            adapted.text + (adapted.hashtags.length ? ' ' + adapted.hashtags.join(' ') : ''),
            adapted.hashtags, mediaUrl ?? undefined,
            mediaFile?.type.startsWith('video/') ? 'video' : 'image'
          );
          results[platform] = result;
        } catch (err) {
          results[platform] = { status: 'error', message: err instanceof Error ? err.message : 'Erro desconhecido' };
        }
      }
      setPublishResults(results);
      await addDoc(collection(db, 'publishedPosts'), {
        userId: user.uid, baseText, adaptedContent: contentToUse, mediaUrl,
        mediaType: mediaFile?.type.startsWith('video/') ? 'video' : mediaFile?.type.startsWith('image/') ? 'image' : null,
        selectedPlatforms, results, createdAt: serverTimestamp(),
      });
    } catch (err) { console.error('Publish error:', err); }
    finally { setPublishing(false); }
  };

  const handleSaveDraft = async () => {
    if (!user || !baseText.trim()) return;
    setSavingDraft(true);
    try {
      await addDoc(collection(db, 'drafts'), {
        userId: user.uid, baseText, adaptedContent, mediaUrl: null, mediaType: null,
        selectedPlatforms, createdAt: serverTimestamp(),
      });
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 3000);
    } finally { setSavingDraft(false); }
  };

  const addHashtag = (tag: string) => {
    if (!baseText.includes(tag)) {
      const newText = baseText + (baseText.endsWith(' ') || baseText === '' ? '' : ' ') + tag + ' ';
      setBaseText(newText);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const togglePlatform = (p: Platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const mediaUrl = mediaFile ? URL.createObjectURL(mediaFile) : null;
  const charLimit = 2200;
  const isOverLimit = baseText.length > charLimit * 0.85;

  return (
    <Layout>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>

          {/* ===== LEFT — EDITOR ===== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Editor card */}
            <motion.div
              className="glass-card"
              style={{ overflow: 'hidden' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Card top bar */}
              <div style={{ padding: '18px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['write', 'media'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={activeTab === tab ? {
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        background: 'rgba(59,110,255,0.15)', color: '#7EB8FF',
                        border: '0.5px solid rgba(59,110,255,0.25)', cursor: 'pointer',
                      } : {
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                        background: 'transparent', color: 'var(--text-tertiary)',
                        border: '0.5px solid transparent', cursor: 'pointer',
                      }}
                    >
                      {tab === 'write' ? <Type size={12} /> : <ImagePlus size={12} />}
                      {tab === 'write' ? 'Texto' : 'Mídia'}
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: 11, color: isOverLimit ? '#FF4757' : 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
                  {baseText.length.toLocaleString('pt-BR')} / {charLimit.toLocaleString('pt-BR')}
                </span>
              </div>

              {activeTab === 'write' ? (
                <div style={{ padding: '14px 22px 20px' }}>
                  {/* Title */}
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título (opcional)..."
                    maxLength={100}
                    style={{
                      width: '100%', height: 38, borderRadius: 8, marginBottom: 12,
                      border: '0.5px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.03)',
                      color: 'var(--text-primary)', fontSize: 13, fontWeight: 500,
                      padding: '0 12px', outline: 'none', fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(59,110,255,0.40)'; e.target.style.background = 'rgba(59,110,255,0.04)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.03)'; }}
                  />

                  {/* Main textarea */}
                  <textarea
                    ref={textareaRef}
                    value={baseText}
                    onChange={(e) => setBaseText(e.target.value)}
                    placeholder="O que você quer compartilhar? Escreva seu conteúdo aqui e ele será adaptado para cada plataforma selecionada..."
                    maxLength={charLimit}
                    rows={9}
                    style={{
                      width: '100%', borderRadius: 10, resize: 'none',
                      border: '0.5px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.02)',
                      color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.65,
                      padding: '14px', outline: 'none', fontFamily: 'inherit',
                      boxSizing: 'border-box', marginBottom: 10,
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(59,110,255,0.35)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  />

                  {/* Hashtag suggestions */}
                  <div style={{ marginBottom: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Hashtags sugeridas
                      </span>
                      <button
                        onClick={() => setHashtagSuggestions(generateHashtagSuggestions(baseText))}
                        style={{ padding: 4, borderRadius: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex' }}
                      >
                        <RefreshCw size={12} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {hashtagSuggestions.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => addHashtag(tag)}
                          style={{
                            padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                            background: baseText.includes(tag) ? 'rgba(59,110,255,0.15)' : 'rgba(255,255,255,0.04)',
                            color: baseText.includes(tag) ? '#7EB8FF' : 'var(--text-tertiary)',
                            border: baseText.includes(tag) ? '0.5px solid rgba(59,110,255,0.30)' : '0.5px solid rgba(255,255,255,0.08)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                            transition: 'all 150ms',
                          }}
                        >
                          <Hash size={10} />
                          {tag.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '14px 22px 20px' }}>
                  <MediaUploader onFileSelect={setMediaFile} currentFile={mediaFile} />
                  {mediaUrl && (
                    <div style={{ marginTop: 14, borderRadius: 10, overflow: 'hidden', border: '0.5px solid rgba(255,255,255,0.08)', maxHeight: 200 }}>
                      {mediaFile?.type.startsWith('video/') ? (
                        <video src={mediaUrl} controls style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }} />
                      ) : (
                        <img src={mediaUrl} alt="" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} />
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Platform selector */}
            <motion.div
              className="glass-card"
              style={{ padding: '18px 22px' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.07 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Publicar em
                </span>
                {selectedPlatforms.length > 0 && (
                  <span style={{ fontSize: 12, color: '#10D97A', fontWeight: 600 }}>
                    {selectedPlatforms.length} selecionada{selectedPlatforms.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ALL_PLATFORMS.map((p) => {
                  const active = selectedPlatforms.includes(p);
                  return (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
                        background: active ? `${platformColors[p]}14` : 'rgba(255,255,255,0.03)',
                        border: active ? `1px solid ${platformColors[p]}50` : '0.5px solid rgba(255,255,255,0.08)',
                        transition: 'all 200ms', minWidth: 72,
                        boxShadow: active ? `0 0 12px ${platformColors[p]}20` : 'none',
                      }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: active ? '#fff' : 'rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PlatformLogo platform={p} size={18} />
                      </div>
                      <span style={{ fontSize: 10.5, fontWeight: active ? 700 : 500, color: active ? platformColors[p] : 'var(--text-tertiary)', letterSpacing: '-0.01em' }}>
                        {PLATFORM_LABELS[p]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Action bar */}
            <motion.div
              style={{ display: 'flex', gap: 10, alignItems: 'center' }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              <button
                onClick={handleAdapt}
                disabled={!baseText.trim() || selectedPlatforms.length === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
                  borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)',
                  border: '0.5px solid rgba(255,255,255,0.10)', transition: 'all 200ms',
                  opacity: (!baseText.trim() || selectedPlatforms.length === 0) ? 0.4 : 1,
                }}
              >
                <Sparkles size={14} /> Adaptar
              </button>

              <button
                onClick={handleSaveDraft}
                disabled={savingDraft || !baseText.trim()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
                  borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.05)', color: draftSaved ? '#10D97A' : 'var(--text-secondary)',
                  border: draftSaved ? '0.5px solid rgba(16,217,122,0.30)' : '0.5px solid rgba(255,255,255,0.10)',
                  transition: 'all 200ms',
                  opacity: (!baseText.trim()) ? 0.4 : 1,
                }}
              >
                {draftSaved ? <><CheckCircle size={14} /> Salvo!</> : <><Save size={14} /> Salvar Rascunho</>}
              </button>

              <div style={{ flex: 1 }} />

              <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 16px rgba(59,110,255,0.35)' }}>
                <button
                  onClick={handlePublish}
                  disabled={publishing || !baseText.trim() || selectedPlatforms.length === 0}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7, padding: '10px 22px',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    background: 'linear-gradient(135deg, #3B6EFF, #1A5CFF)',
                    color: '#fff', border: 'none',
                    opacity: (!baseText.trim() || selectedPlatforms.length === 0) ? 0.5 : 1,
                    transition: 'opacity 200ms',
                  }}
                >
                  {publishing ? (
                    <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  ) : (
                    <Send size={14} />
                  )}
                  {publishing ? 'Publicando…' : 'Publicar Tudo'}
                </button>
                <button
                  style={{
                    width: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(59,110,255,0.80)', color: '#fff', border: 'none',
                    borderLeft: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
                  }}
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            </motion.div>

            {/* Publish results */}
            <AnimatePresence>
              {publishResults && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="glass-card"
                  style={{ padding: '16px 20px' }}
                >
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Resultados da publicação
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {Object.entries(publishResults).map(([platform, result]) => (
                      <div key={platform} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 24, height: 24, borderRadius: 6, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <PlatformLogo platform={platform as Platform} size={14} />
                          </div>
                          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{PLATFORM_LABELS[platform as Platform]}</span>
                        </div>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                          background: result.status === 'published' ? 'rgba(16,217,122,0.12)' : result.status === 'mocked' ? 'rgba(139,92,246,0.12)' : 'rgba(255,71,87,0.12)',
                          color: result.status === 'published' ? '#10D97A' : result.status === 'mocked' ? '#A78BFA' : '#FF6B7A',
                          border: result.status === 'published' ? '0.5px solid rgba(16,217,122,0.25)' : result.status === 'mocked' ? '0.5px solid rgba(139,92,246,0.25)' : '0.5px solid rgba(255,71,87,0.25)',
                        }}>
                          {result.status === 'published' ? 'Publicado' : result.status === 'mocked' ? 'Simulado' : 'Erro'}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ===== RIGHT — PREVIEW ===== */}
          <motion.div
            style={{ position: 'sticky', top: 20, display: 'flex', flexDirection: 'column', gap: 12 }}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Preview header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Eye size={14} style={{ color: 'var(--text-tertiary)' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>Prévia ao Vivo</span>
              </div>
              {adaptedContent && (
                <span style={{ fontSize: 11, color: '#10D97A', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                  <CheckCircle size={11} /> Adaptado
                </span>
              )}
            </div>

            {selectedPlatforms.length === 0 ? (
              <div className="glass-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <FileText size={22} style={{ color: 'var(--text-tertiary)' }} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Nenhuma plataforma selecionada</p>
                <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>Selecione as plataformas abaixo para ver como seu post vai aparecer</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedPlatforms.map((platform) => {
                  const adapted = adaptedContent?.[platform];
                  const previewText = adapted?.text ?? baseText;
                  const snippet = previewText
                    ? previewText.slice(0, 160) + (previewText.length > 160 ? '…' : '')
                    : null;

                  return (
                    <motion.div
                      key={platform}
                      className="glass-card"
                      style={{ padding: 0, overflow: 'hidden' }}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      {/* Platform header bar */}
                      <div style={{ height: 3, background: `linear-gradient(90deg, ${platformColors[platform]}, ${platformColors[platform]}80)` }} />
                      <div style={{ padding: '12px 14px' }}>
                        {/* Profile row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${platformColors[platform]}20`, border: `1.5px solid ${platformColors[platform]}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <PlatformLogo platform={platform} size={16} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>Seu perfil</div>
                            <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)', marginTop: 2 }}>@voce · agora</div>
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: `${platformColors[platform]}14`, color: platformColors[platform], border: `0.5px solid ${platformColors[platform]}30` }}>
                            {PLATFORM_LABELS[platform]}
                          </span>
                        </div>

                        {/* Post text */}
                        <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: adapted?.hashtags?.length ? 6 : 0 }}>
                          {snippet ?? <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Escreva algo para ver a prévia…</span>}
                        </p>

                        {/* Hashtags */}
                        {adapted?.hashtags && adapted.hashtags.length > 0 && (
                          <p style={{ fontSize: 12, marginBottom: 8 }}>
                            {adapted.hashtags.slice(0, 4).map((h, i) => (
                              <span key={i} style={{ color: platformColors[platform], fontWeight: 500, marginRight: 4 }}>{h}</span>
                            ))}
                          </p>
                        )}

                        {/* Media thumbnail */}
                        {mediaUrl && (
                          <div style={{ borderRadius: 8, overflow: 'hidden', border: '0.5px solid rgba(255,255,255,0.06)', marginTop: 4 }}>
                            {mediaFile?.type.startsWith('video/') ? (
                              <video src={mediaUrl} style={{ width: '100%', maxHeight: 120, objectFit: 'cover', display: 'block' }} />
                            ) : (
                              <img src={mediaUrl} alt="" style={{ width: '100%', maxHeight: 120, objectFit: 'cover', display: 'block' }} />
                            )}
                          </div>
                        )}

                        {/* Status */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTop: '0.5px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>
                            {adapted ? `Adaptado para ${PLATFORM_LABELS[platform]}` : 'Clique em Adaptar para otimizar'}
                          </span>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                            background: adapted ? 'rgba(16,217,122,0.10)' : 'rgba(255,255,255,0.05)',
                            color: adapted ? '#10D97A' : 'var(--text-tertiary)',
                            border: adapted ? '0.5px solid rgba(16,217,122,0.22)' : '0.5px solid rgba(255,255,255,0.08)',
                          }}>
                            {adapted ? '✓ Pronto' : 'Rascunho'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
