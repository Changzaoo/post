import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, PenSquare, Calendar, BarChart3,
  Video, Clock, Settings2, Shield, LogOut,
  TrendingUp, X, Target, Users, Layers, CheckSquare,
  Sparkles, Megaphone, FileText, Palette,
} from 'lucide-react';
import type { ElementType } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GlassButton } from './ui/GlassButton';

export interface NavItem {
  label: string;
  icon: ElementType;
  path: string;
  adminOnly?: boolean;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: 'Visao geral',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    ],
  },
  {
    label: 'Growth OS',
    items: [
      { label: 'Funil de Vendas', icon: TrendingUp, path: '/funil' },
      { label: 'Retencao', icon: Users, path: '/retencao' },
      { label: 'Estrategias', icon: Target, path: '/estrategias' },
      { label: 'Campanhas', icon: Megaphone, path: '/campanhas' },
      { label: 'Agente Criativo', icon: Palette, path: '/criativos', badge: 'Novo', badgeColor: '#facc15' },
      { label: 'Conteudos', icon: FileText, path: '/conteudos' },
      { label: 'Checklist', icon: CheckSquare, path: '/checklist' },
      { label: 'Sugestoes IA', icon: Sparkles, path: '/ia', badge: 'Beta', badgeColor: '#4ff7dd' },
    ],
  },
  {
    label: 'Publicacao',
    items: [
      { label: 'Nova Publicacao', icon: PenSquare, path: '/composer' },
      { label: 'Calendario', icon: Calendar, path: '/calendar' },
      { label: 'Metricas', icon: BarChart3, path: '/metrics' },
      { label: 'Reels', icon: Video, path: '/reels' },
      { label: 'Historico', icon: Clock, path: '/history' },
      { label: 'Funil Relevancia', icon: Layers, path: '/funil-relevancia' },
    ],
  },
  {
    label: 'Conta',
    items: [
      { label: 'Configuracoes', icon: Settings2, path: '/settings' },
      { label: 'Admin', icon: Shield, path: '/admin', adminOnly: true },
    ],
  },
];

export const mobileNavItems: NavItem[] = [
  { label: 'Inicio', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Funil', icon: TrendingUp, path: '/funil' },
  { label: 'Criar', icon: PenSquare, path: '/composer' },
  { label: 'Agenda', icon: Calendar, path: '/calendar' },
  { label: 'Conta', icon: Settings2, path: '/settings' },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { userProfile, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = userProfile?.displayName
    ? userProfile.displayName.slice(0, 2).toUpperCase()
    : userProfile?.username?.slice(0, 2).toUpperCase() ?? 'PF';

  const roleLabel =
    userProfile?.role === 'admin' ? 'Admin' :
    userProfile?.role === 'editor' ? 'Editor' :
    'Creator';

  let navIndex = 0;

  return (
    <aside className="app-sidebar" aria-label="Menu principal">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" aria-hidden="true">PF</div>
        <div className="sidebar-logo-text">
          <div className="name">PostFlow</div>
          <div className="sub">Creator OS</div>
        </div>

        {onClose && (
          <GlassButton
            onClick={onClose}
            aria-label="Fechar menu"
            variant="ghost"
            size="icon"
            style={{ marginLeft: 'auto', width: 34, minWidth: 34, height: 34 }}
          >
            <X size={16} />
          </GlassButton>
        )}
      </div>

      <nav className="sidebar-nav">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => !item.adminOnly || isAdmin);
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label}>
              <div className="sidebar-section-label">{group.label}</div>
              {visibleItems.map((item) => {
                const currentIndex = navIndex++;
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: currentIndex * 0.018, duration: 0.22, ease: 'easeOut' }}
                  >
                    <NavLink to={item.path} className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                        <item.icon className="icon" aria-hidden="true" />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className="status-chip"
                          style={{
                            minHeight: 20,
                            fontSize: 9,
                            color: item.badgeColor,
                            background: `${item.badgeColor}18`,
                            borderColor: `${item.badgeColor}30`,
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  </motion.div>
                );
              })}
            </div>
          );
        })}
      </nav>

      <button className="sidebar-user" onClick={handleLogout} type="button" title="Sair da conta">
        <div className="sidebar-user-avatar">{initials}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{userProfile?.displayName ?? userProfile?.username ?? 'Usuario'}</div>
          <div className="sidebar-user-role">{roleLabel}</div>
        </div>
        <LogOut size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      </button>
    </aside>
  );
}
