import { Activity, BarChart3, PauseCircle, Rocket, TestTube2, Trophy, Zap } from 'lucide-react';
import { calculateCreativeScore } from '../../services/creativeAgentService';
import type { Creative } from '../../types/creative';

interface StatCard {
  label: string;
  value: string;
  detail: string;
  color: string;
  bg: string;
  icon: React.ElementType;
}

function bestCreativeOfWeek(creatives: Creative[]) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return creatives
    .filter((creative) => new Date(creative.createdAt).getTime() >= weekAgo)
    .sort((a, b) => calculateCreativeScore(b.metrics) - calculateCreativeScore(a.metrics))[0];
}

export function CreativeStatsCards({ creatives }: { creatives: Creative[] }) {
  const activeCreatives = creatives.filter((creative) => creative.status !== 'Arquivado');
  const bestCtr = activeCreatives.reduce((best, item) => Math.max(best, item.metrics.ctr), 0);
  const bestRoi = activeCreatives.reduce((best, item) => Math.max(best, item.metrics.roi), 0);
  const weeklyBest = bestCreativeOfWeek(activeCreatives);

  const stats: StatCard[] = [
    {
      label: 'Total de criativos',
      value: String(activeCreatives.length),
      detail: `${creatives.filter((creative) => creative.status === 'Arquivado').length} arquivados`,
      color: '#7EB8FF',
      bg: 'rgba(59,110,255,0.12)',
      icon: Rocket,
    },
    {
      label: 'Criativos em teste',
      value: String(activeCreatives.filter((creative) => creative.status === 'Em teste').length),
      detail: 'com métricas comparáveis',
      color: '#20F5D8',
      bg: 'rgba(32,245,216,0.10)',
      icon: TestTube2,
    },
    {
      label: 'Criativos vencedores',
      value: String(activeCreatives.filter((creative) => creative.status === 'Vencedor').length),
      detail: 'marcados para escala',
      color: '#10D97A',
      bg: 'rgba(16,217,122,0.10)',
      icon: Trophy,
    },
    {
      label: 'Criativos pausados',
      value: String(activeCreatives.filter((creative) => creative.status === 'Pausado').length),
      detail: `${creatives.filter((creative) => creative.status === 'Arquivado').length} arquivados`,
      color: '#FFD84D',
      bg: 'rgba(255,216,77,0.10)',
      icon: PauseCircle,
    },
    {
      label: 'Melhor CTR',
      value: `${bestCtr.toFixed(2)}%`,
      detail: 'melhor gancho atual',
      color: '#FF9F0A',
      bg: 'rgba(255,159,10,0.10)',
      icon: Activity,
    },
    {
      label: 'Melhor ROI',
      value: bestRoi ? `${bestRoi.toFixed(2)}x` : '0x',
      detail: 'potencial de escala',
      color: '#A78BFA',
      bg: 'rgba(139,92,246,0.12)',
      icon: BarChart3,
    },
    {
      label: 'Melhor criativo da semana',
      value: weeklyBest ? String(calculateCreativeScore(weeklyBest.metrics)) : '0',
      detail: weeklyBest?.title ?? 'Nenhum criativo novo',
      color: '#FF6B7A',
      bg: 'rgba(255,71,87,0.10)',
      icon: Zap,
    },
  ];

  return (
    <div className="creative-agent-stats-grid">
      {stats.map((stat) => (
        <div className="stat-card creative-agent-stat-card" key={stat.label}>
          <div className="stat-icon" style={{ background: stat.bg }}>
            <stat.icon size={18} style={{ color: stat.color }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
            <div className="creative-agent-stat-detail">{stat.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
