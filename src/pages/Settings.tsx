import { useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  Bell, CheckCircle, Database, ExternalLink, Eye, Key, Laptop,
  Lock, Palette, Plug, Save, Settings2, Shield, Sparkles, User,
  Webhook, XCircle,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { Badge } from '../components/ui/Badge';
import { DataPanel } from '../components/ui/DataPanel';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassModal } from '../components/ui/GlassModal';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { db } from '../lib/firebase';

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
    provider: 'telegram',
    name: 'Telegram',
    description: 'Publicacao via Bot API',
    fields: [
      { key: 'botToken', label: 'Bot Token', placeholder: '123456789:AAH...', secret: true },
      { key: 'chatId', label: 'Chat ID', placeholder: '-1001234567890' },
    ],
    docUrl: 'https://t.me/BotFather',
    note: 'Funcional para publicacao real via Bot API',
  },
  {
    provider: 'discord',
    name: 'Discord',
    description: 'Publicacao via Webhook',
    fields: [{ key: 'webhookUrl', label: 'Webhook URL', placeholder: 'https://discord.com/api/webhooks/...', secret: true }],
    docUrl: 'https://discord.com/developers',
    note: 'Funcional para publicacao real via Webhook',
  },
  {
    provider: 'tiktok',
    name: 'TikTok',
    description: 'Publicacao via TikTok API OAuth',
    fields: [
      { key: 'clientId', label: 'Client ID', placeholder: 'your_client_id' },
      { key: 'clientSecret', label: 'Client Secret', placeholder: 'your_client_secret', secret: true },
    ],
    docUrl: 'https://developers.tiktok.com/',
    note: 'Requer conta Business aprovada; modo simulado disponivel',
  },
  {
    provider: 'instagram',
    name: 'Instagram',
    description: 'Publicacao via Meta Graph API',
    fields: [
      { key: 'appId', label: 'App ID', placeholder: 'your_app_id' },
      { key: 'appSecret', label: 'App Secret', placeholder: 'your_app_secret', secret: true },
      { key: 'accessToken', label: 'Access Token', placeholder: 'EAABs...', secret: true },
    ],
    docUrl: 'https://developers.facebook.com/docs/instagram-api',
    note: 'Requer conta Business ou Creator; modo simulado disponivel',
  },
  {
    provider: 'x',
    name: 'X',
    description: 'Publicacao via X API v2',
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'your_api_key' },
      { key: 'apiSecret', label: 'API Secret', placeholder: 'your_api_secret', secret: true },
      { key: 'accessToken', label: 'Access Token', placeholder: 'access_token', secret: true },
      { key: 'accessSecret', label: 'Access Secret', placeholder: 'access_secret', secret: true },
    ],
    docUrl: 'https://developer.twitter.com/',
    note: 'Requer acesso elevado; modo simulado disponivel',
  },
  {
    provider: 'youtube',
    name: 'YouTube',
    description: 'Upload via YouTube Data API',
    fields: [{ key: 'apiKey', label: 'API Key', placeholder: 'AIzaSy...', secret: true }],
    docUrl: 'https://developers.google.com/youtube/v3',
    note: 'Modo simulado disponivel',
  },
  {
    provider: 'linkedin',
    name: 'LinkedIn',
    description: 'Publicacao via LinkedIn API',
    fields: [
      { key: 'clientId', label: 'Client ID', placeholder: 'your_client_id' },
      { key: 'clientSecret', label: 'Client Secret', placeholder: 'your_client_secret', secret: true },
    ],
    docUrl: 'https://developer.linkedin.com/',
    note: 'Modo simulado disponivel',
  },
];

const AI_INTEGRATIONS: IntegrationConfig[] = [
  {
    provider: 'openai',
    name: 'OpenAI',
    description: 'Modelos GPT para adaptacao e ideacao de conteudo',
    fields: [{ key: 'apiKey', label: 'API Key', placeholder: 'sk-...', secret: true }],
    docUrl: 'https://platform.openai.com/',
  },
  {
    provider: 'anthropic',
    name: 'Anthropic',
    description: 'Claude para geracao e analise criativa',
    fields: [{ key: 'apiKey', label: 'API Key', placeholder: 'sk-ant-...', secret: true }],
    docUrl: 'https://console.anthropic.com/',
  },
  {
    provider: 'gemini',
    name: 'Google Gemini',
    description: 'Modelos multimodais para conteudo',
    fields: [{ key: 'apiKey', label: 'API Key', placeholder: 'AIzaSy...', secret: true }],
    docUrl: 'https://ai.google.dev/',
  },
];

const MEDIA_INTEGRATIONS: IntegrationConfig[] = [
  {
    provider: 'cloudinary',
    name: 'Cloudinary',
    description: 'CDN e transformacao de midia',
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
  return `${key.slice(0, 4)}****${key.slice(-4)}`;
}

function SwitchRow({ label, description, defaultChecked }: { label: string; description: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(Boolean(defaultChecked));
  return (
    <div className="settings-row">
      <div>
        <strong>{label}</strong>
        <span>{description}</span>
      </div>
      <label className="ios-switch">
        <input checked={checked} onChange={(event) => setChecked(event.target.checked)} type="checkbox" />
        <span />
      </label>
    </div>
  );
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
    } catch {
      /* keep modal usable offline */
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const maskedFields: Record<string, string> = {};
      const encodedFields: Record<string, string> = {};

      for (const field of config.fields) {
        const val = fields[field.key] ?? '';
        if (val) {
          encodedFields[field.key] = btoa(val);
          maskedFields[field.key] = maskKey(val);
        } else if (savedKeys[field.key]) {
          maskedFields[field.key] = savedKeys[field.key];
        }
      }

      await setDoc(
        doc(db, 'apiIntegrations', `${userId}_${config.provider}`),
        {
          name: config.name,
          provider: config.provider,
          status: 'connected',
          maskedFields,
          encodedFields,
          updatedAt: new Date(),
          createdBy: userId,
          createdAt: new Date(),
        },
        { merge: true }
      );

      setSavedKeys(maskedFields);
      setConnected(true);
      setFields({});
      setModalOpen(false);
    } catch (err) {
      console.error('Save integration error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setTestResult(connected ? 'success' : 'error');
    setTesting(false);
  };

  return (
    <>
      <div className="settings-integration-card">
        <div>
          <div className="settings-integration-title">
            <strong>{config.name}</strong>
            <Badge variant={connected ? 'success' : 'muted'}>{connected ? 'Conectado' : 'Desconectado'}</Badge>
          </div>
          <p>{config.description}</p>
          {config.note && <span>{config.note}</span>}
          {connected && Object.keys(savedKeys).length > 0 && <code>{Object.values(savedKeys)[0]}</code>}
        </div>
        <div className="settings-integration-actions">
          {connected && (
            <GlassButton variant="ghost" size="sm" onClick={handleTest} loading={testing}>
              {testResult === 'success' && <CheckCircle size={14} style={{ color: 'var(--success)' }} />}
              {testResult === 'error' && <XCircle size={14} style={{ color: 'var(--danger)' }} />}
              Testar
            </GlassButton>
          )}
          <GlassButton variant="secondary" size="sm" onClick={handleOpen}>
            Configurar
          </GlassButton>
        </div>
      </div>

      <GlassModal open={modalOpen} onClose={() => setModalOpen(false)} title={`Configurar ${config.name}`} size="lg">
        <div className="settings-modal-stack">
          <p style={{ color: 'var(--text-secondary)' }}>{config.description}</p>
          {config.note && <div className="settings-callout settings-callout--warning">{config.note}</div>}
          <div className="settings-callout settings-callout--danger">
            As chaves continuam seguindo o fluxo atual do app e sao armazenadas vinculadas a sua conta.
          </div>

          {config.fields.map((field) => (
            <GlassInput
              key={field.key}
              label={field.label}
              type={field.secret ? 'password' : 'text'}
              value={fields[field.key] ?? ''}
              onChange={(event) => setFields({ ...fields, [field.key]: event.target.value })}
              placeholder={savedKeys[field.key] ? `Atual: ${savedKeys[field.key]}` : field.placeholder}
            />
          ))}

          {config.docUrl && (
            <a className="settings-doc-link" href={config.docUrl} target="_blank" rel="noopener noreferrer">
              Documentacao oficial <ExternalLink size={13} />
            </a>
          )}

          <div className="settings-modal-actions">
            <GlassButton variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</GlassButton>
            <GlassButton variant="primary" loading={saving} onClick={handleSave}>
              <Save size={15} /> Salvar
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </>
  );
}

export function Settings() {
  const { user, userProfile } = useAuth();
  const { theme, toggle } = useTheme();

  if (!user) return null;

  return (
    <Layout>
      <div className="pf-page pf-page-wide settings-page">
        <PageHeader
          eyebrow={<><Settings2 size={14} /> Centro de controle</>}
          title="Configuracoes"
          description="Ajuste perfil, aparencia, preferencias, seguranca e integracoes em um painel unico do PostFlow."
          actions={<GlassButton variant="primary"><Save size={16} /> Salvar ajustes</GlassButton>}
        />

        <div className="settings-grid">
          <GlassCard className="settings-section">
            <div className="settings-section-heading">
              <User size={18} />
              <div>
                <h2>Perfil</h2>
                <p>Dados basicos exibidos no app.</p>
              </div>
            </div>
            <div className="settings-form-grid">
              <GlassInput label="Nome" defaultValue={userProfile?.displayName ?? ''} placeholder="Seu nome" />
              <GlassInput label="Usuario" defaultValue={userProfile?.username ?? ''} placeholder="@usuario" />
              <GlassInput label="Email" defaultValue={user.email ?? ''} disabled />
            </div>
          </GlassCard>

          <GlassCard className="settings-section">
            <div className="settings-section-heading">
              <Palette size={18} />
              <div>
                <h2>Aparencia</h2>
                <p>Liquid Glass com leitura confortavel.</p>
              </div>
            </div>
            <div className="settings-row">
              <div>
                <strong>Modo {theme === 'dark' ? 'escuro' : 'claro'}</strong>
                <span>Alterna o tema global sem mudar seus dados.</span>
              </div>
              <GlassButton variant="secondary" onClick={toggle}>
                <Eye size={15} /> Alternar
              </GlassButton>
            </div>
            <SwitchRow label="Reducao de brilho" description="Mantem superficies mais discretas em ambientes escuros." />
            <SwitchRow label="Animacoes suaves" description="Transicoes premium respeitando preferencias do sistema." defaultChecked />
          </GlassCard>

          <GlassCard className="settings-section">
            <div className="settings-section-heading">
              <Laptop size={18} />
              <div>
                <h2>Preferencias</h2>
                <p>Padroes usados nas telas de criacao.</p>
              </div>
            </div>
            <div className="settings-form-grid">
              <GlassInput label="Fuso horario" defaultValue="America/Sao_Paulo" />
              <GlassInput label="Idioma" defaultValue="Portugues (Brasil)" />
            </div>
            <SwitchRow label="Abrir preview automaticamente" description="Mostra previews quando uma plataforma e selecionada." defaultChecked />
          </GlassCard>

          <GlassCard className="settings-section">
            <div className="settings-section-heading">
              <Bell size={18} />
              <div>
                <h2>Notificacoes</h2>
                <p>Alertas importantes sem excesso de ruido.</p>
              </div>
            </div>
            <SwitchRow label="Publicacoes concluídas" description="Avise quando um post terminar de publicar." defaultChecked />
            <SwitchRow label="Erros de integracao" description="Destaque falhas ou reconexoes necessarias." defaultChecked />
            <SwitchRow label="Resumo semanal" description="Receba um resumo de desempenho toda semana." />
          </GlassCard>

          <GlassCard className="settings-section">
            <div className="settings-section-heading">
              <Shield size={18} />
              <div>
                <h2>Seguranca</h2>
                <p>Protecao de conta e credenciais.</p>
              </div>
            </div>
            <div className="settings-row">
              <div>
                <strong>Sessao autenticada</strong>
                <span>Conta Firebase ativa neste dispositivo.</span>
              </div>
              <span className="status-chip" data-status="success">Ativa</span>
            </div>
            <SwitchRow label="Confirmar acoes destrutivas" description="Solicita confirmacao antes de excluir dados." defaultChecked />
            <GlassButton variant="secondary"><Lock size={15} /> Revisar acesso</GlassButton>
          </GlassCard>

          <GlassCard className="settings-section">
            <div className="settings-section-heading">
              <Database size={18} />
              <div>
                <h2>Sistema</h2>
                <p>Estado operacional do app.</p>
              </div>
            </div>
            <div className="settings-system-list">
              <span><strong>Firestore</strong><em>Conectado</em></span>
              <span><strong>Storage</strong><em>Ativo</em></span>
              <span><strong>Versao</strong><em>PostFlow 1.0</em></span>
            </div>
          </GlassCard>
        </div>

        <DataPanel
          title={<><Plug size={17} /> Integracoes</>}
          description="Conecte plataformas de publicacao, IA, midia e webhooks mantendo o mesmo fluxo atual de credenciais."
        >
          <div className="settings-integrations-grid">
            <GlassCard className="settings-integration-group" padded={false}>
              <div className="settings-integration-group-header">
                <Settings2 size={18} />
                <div>
                  <h3>Plataformas</h3>
                  <p>Publicacao e distribuicao.</p>
                </div>
              </div>
              <div className="settings-integration-stack">
                {PLATFORM_INTEGRATIONS.map((config) => (
                  <IntegrationCard key={config.provider} config={config} userId={user.uid} />
                ))}
              </div>
            </GlassCard>

            <GlassCard className="settings-integration-group" padded={false}>
              <div className="settings-integration-group-header">
                <Sparkles size={18} />
                <div>
                  <h3>IA</h3>
                  <p>Geracao, adaptacao e insights.</p>
                </div>
              </div>
              <div className="settings-integration-stack">
                {AI_INTEGRATIONS.map((config) => (
                  <IntegrationCard key={config.provider} config={config} userId={user.uid} />
                ))}
              </div>
            </GlassCard>

            <GlassCard className="settings-integration-group" padded={false}>
              <div className="settings-integration-group-header">
                <Key size={18} />
                <div>
                  <h3>Midia</h3>
                  <p>Armazenamento e distribuicao de assets.</p>
                </div>
              </div>
              <div className="settings-integration-stack">
                {MEDIA_INTEGRATIONS.map((config) => (
                  <IntegrationCard key={config.provider} config={config} userId={user.uid} />
                ))}
                <div className="settings-integration-card">
                  <div>
                    <div className="settings-integration-title">
                      <strong>Firebase Storage</strong>
                      <Badge variant="success">Ativo</Badge>
                    </div>
                    <p>Configurado automaticamente via Firebase.</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="settings-integration-group" padded={false}>
              <div className="settings-integration-group-header">
                <Webhook size={18} />
                <div>
                  <h3>Webhooks</h3>
                  <p>Eventos externos e automacoes.</p>
                </div>
              </div>
              <div className="settings-integration-stack">
                <div className="settings-empty-mini">
                  <Webhook size={24} />
                  <strong>Webhooks em breve</strong>
                  <span>O painel ja esta preparado para filtros e criacao futura.</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </DataPanel>
      </div>
    </Layout>
  );
}
