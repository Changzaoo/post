import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, PenSquare, Calendar, BarChart3,
  Video, Clock, Settings2, Shield, LogOut,
  TrendingUp, X, Target, Users, Layers, CheckSquare,
  Sparkles, Megaphone, FileText,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  adminOnly?: boolean;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Visão Geral',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    ],
  },
  {
    label: 'Growth OS',
    items: [
      { label: 'Funil de Vendas',    icon: TrendingUp,   path: '/funil' },
      { label: 'Retenção',           icon: Users,        path: '/retencao' },
      { label: 'Estratégias',        icon: Target,       path: '/estrategias' },
      { label: 'Campanhas',          icon: Megaphone,    path: '/campanhas' },
      { label: 'Conteúdos',          icon: FileText,     path: '/conteudos' },
      { label: 'Checklist',          icon: CheckSquare,  path: '/checklist' },
      { label: 'Sugestões IA',       icon: Sparkles,     path: '/ia', badge: 'Beta', badgeColor: '#20F5D8' },
    ],
  },
  {
    label: 'Publicação',
    items: [
      { label: 'Nova Publicação', icon: PenSquare,  path: '/composer' },
      { label: 'Calendário',      icon: Calendar,   path: '/calendar' },
      { label: 'Métricas',        icon: BarChart3,  path: '/metrics' },
      { label: 'Reels',           icon: Video,      path: '/reels' },
      { label: 'Histórico',       icon: Clock,      path: '/history' },
      { label: 'Funil Relevância',icon: Layers,     path: '/funil-relevancia' },
    ],
  },
  {
    label: 'Conta',
    items: [
      { label: 'Configurações', icon: Settings2, path: '/settings' },
      { label: 'Admin',         icon: Shield,    path: '/admin', adminOnly: true },
    ],
  },
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
    : userProfile?.username?.slice(0, 2).toUpperCase() ?? 'U';

  const roleLabel =
    userProfile?.role === 'admin'  ? 'Admin' :
    userProfile?.role === 'editor' ? 'Editor' :
    'Growth Creator';

  let navIndex = 0;

  return (
    <div className="app-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" style={{ fontFamily: 'Inter, sans-serif' }}>α</div>
        <div className="sidebar-logo-text">
          <div className="name">Post Alpha</div>
          <div className="sub">Growth OS</div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            aria-label="Fechar menu"
            style={{
              marginLeft: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: 8,
              background: 'rgba(59,110,255,0.08)', border: '0.5px solid rgba(59,110,255,0.18)',
              cursor: 'pointer', color: 'var(--text-secondary)', flexShrink: 0,
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(item => !item.adminOnly || isAdmin);
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} style={{ marginBottom: 4 }}>
              <div className="sidebar-section-label">{group.label}</div>
              {visibleItems.map((item) => {
                const currentIndex = navIndex++;
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: currentIndex * 0.035, duration: 0.22, ease: 'easeOut' }}
                  >
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 9, justifyContent: 'space-between' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1, minWidth: 0 }}>
                        <item.icon className="icon" style={{ flexShrink: 0, width: 15, height: 15 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span style={{
                          fontSize: 9, fontWeight: 700, letterSpacing: '0.04em',
                          padding: '2px 6px', borderRadius: 20,
                          background: `${item.badgeColor}18`,
                          color: item.badgeColor,
                          border: `0.5px solid ${item.badgeColor}30`,
                          flexShrink: 0,
                        }}>{item.badge}</span>
                      )}
                    </NavLink>
                  </motion.div>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User */}
      <div
        className="sidebar-user"
        onClick={handleLogout}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && handleLogout()}
        title="Sair da conta"
      >
        <div className="sidebar-user-avatar">{initials}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">
            {userProfile?.displayName ?? userProfile?.username ?? 'User'}
          </div>
          <div className="sidebar-user-role">{roleLabel}</div>
        </div>
        <LogOut size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0, opacity: 0.7 }} />
      </div>
    </div>
  );
}
