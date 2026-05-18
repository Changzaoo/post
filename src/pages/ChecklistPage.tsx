import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CheckSquare, Square, TrendingUp, Target, Zap, BarChart3, Users, Shield, Clock, RefreshCw } from 'lucide-react';

interface ChecklistItem {
  id: string;
  category: string;
  icon: React.ElementType;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  color: string;
}

const checklistItems: ChecklistItem[] = [
  { id: '1', category: 'Mensagem', icon: Target, title: 'Headline clara e específica', description: 'Sua headline comunica o benefício principal em menos de 7 palavras?', impact: 'high', color: '#3B6EFF' },
  { id: '2', category: 'Oferta', icon: Zap, title: 'Oferta visível e irresistível', description: 'A proposta de valor está posicionada acima da dobra, sem necessidade de scroll?', impact: 'high', color: '#FFD84D' },
  { id: '3', category: 'Conversão', icon: TrendingUp, title: 'CTA acima da dobra', description: 'O botão de ação principal está visível sem scroll na versão mobile?', impact: 'high', color: '#10D97A' },
  { id: '4', category: 'Confiança', icon: Shield, title: 'Prova social presente', description: 'Você tem depoimentos, números de clientes ou resultados visíveis?', impact: 'high', color: '#20F5D8' },
  { id: '5', category: 'Mensagem', icon: Target, title: 'Benefícios objetivos', description: 'Os benefícios estão listados de forma clara e específica (não características)?', impact: 'medium', color: '#3B6EFF' },
  { id: '6', category: 'Confiança', icon: Shield, title: 'Garantia ou redução de risco', description: 'Existe alguma garantia, trial gratuito ou compromisso sem risco para o lead?', impact: 'high', color: '#8B5CF6' },
  { id: '7', category: 'Técnico', icon: Zap, title: 'Página com carregamento rápido', description: 'Sua página carrega em menos de 3 segundos no mobile com 4G?', impact: 'medium', color: '#FF9F0A' },
  { id: '8', category: 'Confiança', icon: Shield, title: 'Visual confiável e profissional', description: 'O design passa credibilidade? Sem elementos genéricos ou estoque de imagens?', impact: 'medium', color: '#8B5CF6' },
  { id: '9', category: 'Conteúdo', icon: BarChart3, title: 'Conteúdo de retenção no topo', description: 'Você tem conteúdo gratuito de valor que retém o público antes da oferta?', impact: 'medium', color: '#20F5D8' },
  { id: '10', category: 'Email', icon: Users, title: 'Sequência pós-captura configurada', description: 'Existe automação de boas-vindas ativa para novos leads captados?', impact: 'high', color: '#3B6EFF' },
  { id: '11', category: 'Reativação', icon: RefreshCw, title: 'Recuperação de leads frios', description: 'Você tem um processo para reengajar leads inativos há mais de 14 dias?', impact: 'medium', color: '#EC4899' },
  { id: '12', category: 'Análise', icon: Clock, title: 'Análise semanal de métricas', description: 'Você analisa suas métricas principais pelo menos uma vez por semana?', impact: 'medium', color: '#FFD84D' },
];

const impactColor = { high: '#FF4757', medium: '#FFD84D', low: '#10D97A' };
const impactLabel = { high: 'Alto', medium: 'Médio', low: 'Baixo' };

export function ChecklistPage() {
  const { user } = useAuth();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState('Todos');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'userSettings', user.uid)).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.checklistChecked)) {
          setChecked(new Set(data.checklistChecked as string[]));
        }
      }
    });
  }, [user]);

  const saveChecked = async (next: Set<string>) => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'userSettings', user.uid), { checklistChecked: Array.from(next) }, { merge: true });
    } finally {
      setSaving(false);
    }
  };

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveChecked(next);
      return next;
    });
  };

  const categories = ['Todos', ...Array.from(new Set(checklistItems.map(i => i.category)))];
  const filtered = filter === 'Todos' ? checklistItems : checklistItems.filter(i => i.category === filter);
  const progress = Math.round((checked.size / checklistItems.length) * 100);
  const highImpactDone = checklistItems.filter(i => i.impact === 'high' && checked.has(i.id)).length;
  const highImpactTotal = checklistItems.filter(i => i.impact === 'high').length;

  const progressColor =
    progress >= 80 ? '#10D97A' :
    progress >= 50 ? '#FFD84D' :
    '#3B6EFF';

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <motion.div style={{ marginBottom: 24 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 5 }}>
                <span style={{ background: 'linear-gradient(90deg, #10D97A, #20F5D8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Checklist de Conversão</span>
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Itens essenciais para maximizar suas taxas de conversão</p>
            </div>
            {saving && (
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', border: '1.5px solid rgba(59,110,255,0.20)', borderTopColor: '#3B6EFF', animation: 'spin 0.8s linear infinite' }} />
                Salvando...
              </span>
            )}
          </div>
        </motion.div>

        <motion.div
          className="glass-card"
          style={{ marginBottom: 22, padding: '24px 24px' }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Seu funil está{' '}
                <span style={{ color: progressColor, fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em' }}>{progress}%</span>
                {' '}otimizado
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)' }}>
                {checked.size} de {checklistItems.length} itens completos · {highImpactDone}/{highImpactTotal} itens de alto impacto
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {progress < 50 && <div style={{ fontSize: 12, color: '#FF4757', fontWeight: 600 }}>Atenção necessária</div>}
              {progress >= 50 && progress < 80 && <div style={{ fontSize: 12, color: '#FFD84D', fontWeight: 600 }}>Bom progresso</div>}
              {progress >= 80 && <div style={{ fontSize: 12, color: '#10D97A', fontWeight: 600 }}>Excelente!</div>}
            </div>
          </div>

          <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', borderRadius: 6, background: `linear-gradient(90deg, ${progressColor}, ${progressColor}88)` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
            {Object.entries(impactColor).map(([key, color]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                  Impacto {impactLabel[key as keyof typeof impactLabel]} ({checklistItems.filter(i => i.impact === key && checked.has(i.id)).length}/{checklistItems.filter(i => i.impact === key).length})
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{ padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 150ms', ...(filter === cat ? { background: 'linear-gradient(135deg, #3B6EFF, #1A5CFF)', color: '#fff' } : { background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '0.5px solid rgba(255,255,255,0.10)' }) }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((item, i) => {
            const isDone = checked.has(item.id);
            return (
              <motion.div key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04, duration: 0.25 }}>
                <div
                  onClick={() => toggle(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
                    borderRadius: 14, cursor: 'pointer',
                    background: isDone ? 'rgba(16,217,122,0.05)' : 'rgba(255,255,255,0.03)',
                    border: `0.5px solid ${isDone ? 'rgba(16,217,122,0.20)' : 'rgba(255,255,255,0.07)'}`,
                    transition: 'all 200ms',
                    opacity: isDone ? 0.75 : 1,
                  }}
                  onMouseEnter={e => { if (!isDone) (e.currentTarget as HTMLDivElement).style.background = 'rgba(59,110,255,0.05)'; }}
                  onMouseLeave={e => { if (!isDone) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'; }}
                >
                  <div style={{ flexShrink: 0 }}>
                    {isDone
                      ? <CheckSquare size={20} style={{ color: '#10D97A' }} />
                      : <Square size={20} style={{ color: 'rgba(140,170,220,0.35)' }} />}
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <item.icon size={17} style={{ color: item.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: isDone ? 'var(--text-tertiary)' : 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none' }}>
                        {item.title}
                      </span>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 20, background: `${impactColor[item.impact]}12`, color: impactColor[item.impact], border: `0.5px solid ${impactColor[item.impact]}25`, flexShrink: 0 }}>
                        {impactLabel[item.impact]}
                      </span>
                    </div>
                    <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>{item.description}</p>
                  </div>
                  <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', color: 'var(--text-tertiary)', border: '0.5px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
                    {item.category}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {progress === 100 && (
          <motion.div
            style={{ marginTop: 20, padding: 20, borderRadius: 16, background: 'linear-gradient(90deg, rgba(16,217,122,0.10), rgba(32,245,216,0.06))', border: '0.5px solid rgba(16,217,122,0.25)', textAlign: 'center' }}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, color: '#10D97A', marginBottom: 4 }}>Funil 100% Otimizado!</div>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Seu funil está completamente configurado para máxima conversão.</div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
