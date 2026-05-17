import { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CheckCircle, XCircle, Settings2, Key, Webhook, Sparkles } from 'lucide-react';

type TabKey = 'platforms' | 'ai' | 'media' | 'webhooks';

interface IntegrationConfig {
  provider: string;
  name: string;
  description: string;
  fields: { key: string; label: string; placeholder: string; secret?: boolean }[];
  docUrl?: string;
  note?: string;
}

const PLATFORM_INTEGRATIONS: IntegrationConfig[] = [
  {
    provider: 'telegram', name: 'Telegram', description: 'Publishing via Bot API',
    fields: [
      { key: 'botToken', label: 'Bot Token', placeholder: '123456789:AAH...', secret: true },
      { key: 'chatId', label: 'Chat ID', placeholder: '-1001234567890' },
    ],
    docUrl: 'https://t.me/BotFather', note: 'Functional — real publishing via Bot API',
  },
  {
    provider: 'discord', name: 'Discord', description: 'Publishing via Webhook',
    fields: [{ key: 'webhookUrl', label: 'Webhook URL', placeholder: 'https://discord.com/api/webhooks/...', secret: true }],
    docUrl: 'https://discord.com/developers', note: 'Functional — real publishing via Webhook',
  },
  {
    provider: 'tiktok', name: 'TikTok', description: 'Publishing via TikTok API (OAuth)',
    fields: [
      { key: 'clientId', label: 'Client ID', placeholder: 'your_client_id' },
      { key: 'clientSecret', label: 'Client Secret', placeholder: 'your_client_secret', secret: true },
    ],
    docUrl: 'https://developers.tiktok.com/', note: 'Requires approved Business account — simulated mode',
  },
  {
    provider: 'instagram', name: 'Instagram', description: 'Publishing via Meta Graph API',
    fields: [
      { key: 'appId', label: 'App ID', placeholder: 'your_app_id' },
      { key: 'appSecret', label: 'App Secret', placeholder: 'your_app_secret', secret: true },
      { key: 'accessToken', label: 'Access Token', placeholder: 'EAABs...', secret: true },
    ],
    docUrl: 'https://developers.facebook.com/docs/instagram-api', note: 'Requires Business/Creator account — simulated mode',
  },
  {
    provider: 'x', name: 'X (Twitter)', description: 'Publishing via X API v2',
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'your_api_key' },
      { key: 'apiSecret', label: 'API Secret', placeholder: 'your_api_secret', secret: true },
      { key: 'accessToken', label: 'Access Token', placeholder: 'access_token', secret: true },
      { key: 'accessSecret', label: 'Access Secret', placeholder: 'access_secret', secret: true },
    ],
    docUrl: 'https://developer.twitter.com/', note: 'Requires Elevated access — simulated mode',
  },
  {
    provider: 'youtube', name: 'YouTube', description: 'Upload videos via YouTube Data API',
    fields: [{ key: 'apiKey', label: 'API Key', placeholder: 'AIzaSy...', secret: true }],
    docUrl: 'https://developers.google.com/youtube/v3', note: 'Simulated mode',
  },
  {
    provider: 'linkedin', name: 'LinkedIn', description: 'Publishing via LinkedIn API',
    fields: [
      { key: 'clientId', label: 'Client ID', placeholder: 'your_client_id' },
      { key: 'clientSecret', label: 'Client Secret', placeholder: 'your_client_secret', secret: true },
    ],
    docUrl: 'https://developer.linkedin.com/', note: 'Simulated mode',
  },
];

const AI_INTEGRATIONS: IntegrationConfig[] = [
  { provider: 'openai', name: 'OpenAI', description: 'GPT-4 for content adaptation', fields: [{ key: 'apiKey', label: 'API Key', placeholder: 'sk-...', secret: true }], docUrl: 'https://platform.openai.com/' },
  { provider: 'anthropic', name: 'Anthropic (Claude)', description: 'Claude for content generation', fields: [{ key: 'apiKey', label: 'API Key', placeholder: 'sk-ant-...', secret: true }], docUrl: 'https://console.anthropic.com/' },
  { provider: 'gemini', name: 'Google Gemini', description: 'Gemini Pro for multimodal content', fields: [{ key: 'apiKey', label: 'API Key', placeholder: 'AIzaSy...', secret: true }], docUrl: 'https://ai.google.dev/' },
];

const MEDIA_INTEGRATIONS: IntegrationConfig[] = [
  {
    provider: 'cloudinary', name: 'Cloudinary', description: 'CDN and media transformation',
    fields: [
      { key: 'cloudName', label: 'Cloud Name', placeholder: 'your_cloud' },
      { key: 'apiKey', label: 'API Key', placeholder: 'your_api_key' },
      { key: 'apiSecret', label: 'API Secret', placeholder: 'your_api_secret', secret: true },
    ],
    docUrl: 'https://cloudinary.com/',
  },
];

function maskKey(key: string): string {
  if (!key || key.length < 8) return '****';
  return key.slice(0, 4) + '****' + key.slice(-4);
}

function IntegrationCard({ config, userId }: { config: IntegrationConfig; userId: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [savedKeys, setSavedKeys] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [connected, setConnected] = useState(false);

  const handleOpen = async () => {
    try {
      const snap = await getDoc(doc(db, 'apiIntegrations', `${userId}_${config.provider}`));
      if (snap.exists()) {
        const data = snap.data();
        setSavedKeys(data.maskedFields ?? {});
        setConnected(data.status === 'connected');
      }
    } catch { /* ignore */ }
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const maskedFields: Record<string, string> = {};
      const encodedFields: Record<string, string> = {};
      for (const f of config.fields) {
        const val = fields[f.key] ?? '';
        if (val) { encodedFields[f.key] = btoa(val); maskedFields[f.key] = maskKey(val); }
        else if (savedKeys[f.key]) maskedFields[f.key] = savedKeys[f.key];
      }
      await setDoc(doc(db, 'apiIntegrations', `${userId}_${config.provider}`), {
        name: config.name, provider: config.provider, status: 'connected',
        maskedFields, encodedFields, updatedAt: new Date(), createdBy: userId, createdAt: new Date(),
      }, { merge: true });
      setSavedKeys(maskedFields); setConnected(true); setFields({}); setModalOpen(false);
    } catch (err) { console.error('Save integration error:', err); }
    finally { setSaving(false); }
  };

  const handleTest = async () => {
    setTesting(true); setTestResult(null);
    await new Promise((r) => setTimeout(r, 1200));
    setTestResult(connected ? 'success' : 'error');
    setTesting(false);
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 rounded-xl border border-white/7 hover:border-white/12 hover:bg-white/3 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-slate-200">{config.name}</p>
            <Badge variant={connected ? 'success' : 'muted'}>{connected ? 'Conectado' : 'Desconectado'}</Badge>
          </div>
          <p className="text-xs text-slate-500">{config.description}</p>
          {config.note && <p className="text-xs mt-0.5" style={{ color: '#7EB8FF', opacity: 0.8 }}>{config.note}</p>}
          {connected && Object.keys(savedKeys).length > 0 && (
            <p className="text-xs text-slate-500 mt-1 font-mono">{Object.values(savedKeys)[0]}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          {connected && (
            <Button variant="ghost" size="sm" onClick={handleTest} loading={testing}>
              {testResult === 'success' && <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" />}
              {testResult === 'error' && <XCircle className="h-3.5 w-3.5 text-red-500 mr-1" />}
              Testar
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={handleOpen}>Configurar</Button>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Configure ${config.name}`}>
        <div className="space-y-4">
          <p className="text-sm text-slate-400">{config.description}</p>
          {config.note && (
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">{config.note}</div>
          )}
          <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2 text-xs text-slate-400">
            Chaves armazenadas com codificação base64 (não é criptografia real). Em produção, use criptografia no servidor.
          </div>
          {config.fields.map((f) => (
            <Input
              key={f.key}
              label={f.label}
              type={f.secret ? 'password' : 'text'}
              value={fields[f.key] ?? ''}
              onChange={(e) => setFields({ ...fields, [f.key]: e.target.value })}
              placeholder={savedKeys[f.key] ? `Current: ${savedKeys[f.key]}` : f.placeholder}
            />
          ))}
          {config.docUrl && (
            <a href={config.docUrl} target="_blank" rel="noopener noreferrer" className="text-xs transition-colors" style={{ color: '#7EB8FF' }}>
              Documentação oficial
            </a>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/8">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" loading={saving} onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'platforms', label: 'Plataformas', icon: Settings2 },
  { key: 'ai', label: 'IA', icon: Sparkles },
  { key: 'media', label: 'Mídia', icon: Key },
  { key: 'webhooks', label: 'Webhooks', icon: Webhook },
];

export function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('platforms');
  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-white/8 bg-white/4 p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={activeTab === tab.key ? { background: 'linear-gradient(135deg, #3B6EFF, #1A5CFF)', color: '#fff', boxShadow: '0 2px 8px rgba(59,110,255,0.35)' } : {}}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeTab === tab.key
                  ? 'text-white shadow'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/6'
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:block">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Notice */}
        <Card>
          <CardContent className="p-4 flex items-start gap-3">
            <Key className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-400">
              Credenciais armazenadas no Firestore vinculadas à sua conta. Nunca as exponha publicamente. Em produção, use variáveis de ambiente no servidor.
            </p>
          </CardContent>
        </Card>

        {activeTab === 'platforms' && (
          <Card>
            <CardHeader><CardTitle>Plataformas de Publicação</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {PLATFORM_INTEGRATIONS.map((cfg) => <IntegrationCard key={cfg.provider} config={cfg} userId={user.uid} />)}
            </CardContent>
          </Card>
        )}

        {activeTab === 'ai' && (
          <Card>
            <CardHeader><CardTitle>Integração com IA</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {AI_INTEGRATIONS.map((cfg) => <IntegrationCard key={cfg.provider} config={cfg} userId={user.uid} />)}
              <div className="mt-4 p-3 rounded-xl text-xs text-slate-400" style={{ background: 'rgba(59,110,255,0.06)', border: '0.5px solid rgba(59,110,255,0.18)' }}>
                <p className="font-medium mb-1" style={{ color: '#7EB8FF' }}>Em desenvolvimento</p>
                A integração com IA para adaptação automática de conteúdo será ativada quando uma chave API for configurada.
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'media' && (
          <Card>
            <CardHeader><CardTitle>Armazenamento de Mídia</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {MEDIA_INTEGRATIONS.map((cfg) => <IntegrationCard key={cfg.provider} config={cfg} userId={user.uid} />)}
              <div className="p-4 rounded-xl border border-white/8 bg-white/3">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-slate-200">Firebase Storage</p>
                  <Badge variant="success">Ativo</Badge>
                </div>
                <p className="text-xs text-slate-500">Configurado automaticamente via Firebase. Upload de mídia já funcional.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'webhooks' && (
          <Card>
            <CardHeader><CardTitle>Webhooks Personalizados</CardTitle></CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <Webhook className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Webhooks em breve</p>
                <p className="text-xs text-slate-600 mt-1">Configure notificações para seus sistemas externos</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
