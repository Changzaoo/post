import type { PostStatus } from '../types';

export const POST_STATUS: Record<
  PostStatus,
  { label: string; color: string; bgColor: string; borderColor: string; icon: string; description: string }
> = {
  draft: {
    label: 'Rascunho',
    color: '#94a3b8',
    bgColor: 'rgba(100,116,139,0.15)',
    borderColor: 'rgba(100,116,139,0.3)',
    icon: 'FileText',
    description: 'Aguardando edição',
  },
  scheduled: {
    label: 'Agendado',
    color: '#60a5fa',
    bgColor: 'rgba(59,130,246,0.15)',
    borderColor: 'rgba(59,130,246,0.3)',
    icon: 'Clock',
    description: 'Publicação programada',
  },
  publishing: {
    label: 'Publicando',
    color: '#fbbf24',
    bgColor: 'rgba(245,158,11,0.15)',
    borderColor: 'rgba(245,158,11,0.3)',
    icon: 'Loader',
    description: 'Em processo de publicação',
  },
  published: {
    label: 'Publicado',
    color: '#10b981',
    bgColor: 'rgba(16,185,129,0.15)',
    borderColor: 'rgba(16,185,129,0.3)',
    icon: 'CheckCircle',
    description: 'Publicado com sucesso',
  },
  failed: {
    label: 'Falhou',
    color: '#ef4444',
    bgColor: 'rgba(239,68,68,0.15)',
    borderColor: 'rgba(239,68,68,0.3)',
    icon: 'XCircle',
    description: 'Erro ao publicar',
  },
  under_review: {
    label: 'Em análise',
    color: '#f97316',
    bgColor: 'rgba(249,115,22,0.15)',
    borderColor: 'rgba(249,115,22,0.3)',
    icon: 'AlertCircle',
    description: 'Em revisão pela plataforma',
  },
  rejected: {
    label: 'Rejeitado',
    color: '#dc2626',
    bgColor: 'rgba(220,38,38,0.15)',
    borderColor: 'rgba(220,38,38,0.3)',
    icon: 'Ban',
    description: 'Rejeitado pela plataforma',
  },
  expired: {
    label: 'Expirado',
    color: '#6b7280',
    bgColor: 'rgba(107,114,128,0.15)',
    borderColor: 'rgba(107,114,128,0.3)',
    icon: 'Clock',
    description: 'Prazo de publicação expirado',
  },
};

export const PUBLISH_STATUS_COLORS: Record<string, { label: string; color: string; bgColor: string }> = {
  published: { label: 'Publicado', color: '#10b981', bgColor: 'rgba(16,185,129,0.15)' },
  error: { label: 'Erro', color: '#ef4444', bgColor: 'rgba(239,68,68,0.15)' },
  mocked: { label: 'Simulado', color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.15)' },
  pending: { label: 'Pendente', color: '#fbbf24', bgColor: 'rgba(245,158,11,0.15)' },
  pending_auth: { label: 'Aguardando Auth', color: '#f97316', bgColor: 'rgba(249,115,22,0.15)' },
  needs_reconnect: { label: 'Reconectar', color: '#ef4444', bgColor: 'rgba(239,68,68,0.15)' },
};
