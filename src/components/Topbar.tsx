import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Menu, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/composer': 'Criar Publicação',
  '/calendar': 'Calendário',
  '/metrics': 'Métricas',
  '/reels': 'Reels & Vídeos',
  '/history': 'Histórico',
  '/settings': 'Configurações',
  '/account': 'Minha Conta',
  '/admin': 'Painel Admin',
};

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const title = PAGE_TITLES[location.pathname] ?? 'PostFlow';

  const initials = userProfile?.displayName
    ? userProfile.displayName.slice(0, 2).toUpperCase()
    : userProfile?.username?.slice(0, 2).toUpperCase() ?? 'U';

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 shrink-0 flex items-center gap-4 border-b border-white/6 bg-[#0d0d14]/80 backdrop-blur-xl px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden flex items-center justify-center h-9 w-9 rounded-lg text-[#94a3b8] hover:text-white hover:bg-white/6 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title */}
      <h1 className="text-base font-semibold text-white">{title}</h1>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 h-9 px-3 rounded-xl border border-white/8 bg-white/3 text-[#475569] text-sm w-56 hover:border-white/12 transition-colors cursor-text">
        <Search className="h-4 w-4 shrink-0" />
        <span>Buscar...</span>
      </div>

      {/* Notifications */}
      <button className="relative flex items-center justify-center h-9 w-9 rounded-xl border border-white/8 bg-white/3 text-[#94a3b8] hover:text-white hover:bg-white/6 transition-colors">
        <Bell className="h-4 w-4" />
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-violet-500" />
      </button>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex items-center gap-2 h-9 px-2 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 transition-colors"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600/30 text-[10px] font-bold text-violet-300">
            {initials}
          </div>
          <span className="hidden sm:block text-sm font-medium text-white max-w-24 truncate">
            {userProfile?.username ?? 'Usuário'}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-[#475569]" />
        </button>

        {userMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setUserMenuOpen(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-44 z-20 rounded-xl border border-white/8 bg-[#111118] shadow-2xl overflow-hidden animate-fade-in">
              <div className="px-3 py-2.5 border-b border-white/6">
                <p className="text-xs font-medium text-white truncate">
                  {userProfile?.displayName ?? userProfile?.username}
                </p>
                <p className="text-xs text-[#475569] truncate">
                  @{userProfile?.username}
                </p>
              </div>
              <button
                onClick={() => { setUserMenuOpen(false); navigate('/account'); }}
                className="flex w-full items-center px-3 py-2 text-sm text-[#94a3b8] hover:text-white hover:bg-white/6 transition-colors"
              >
                Minha conta
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                Sair
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
