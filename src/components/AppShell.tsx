import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Menu, Moon, Sun } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sidebar, mobileNavItems } from './Sidebar';

interface AppShellProps {
  children: ReactNode;
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/funil': 'Funil de Vendas',
  '/retencao': 'Retencao de Publico',
  '/estrategias': 'Estrategias',
  '/campanhas': 'Campanhas',
  '/conteudos': 'Conteudos',
  '/checklist': 'Checklist de Conversao',
  '/ia': 'Sugestoes IA',
  '/criativos': 'Agente Criativo',
  '/composer': 'Nova Publicacao',
  '/calendar': 'Calendario',
  '/metrics': 'Metricas',
  '/reels': 'Reels',
  '/history': 'Historico',
  '/settings': 'Configuracoes',
  '/admin': 'Admin',
  '/funil-relevancia': 'Funil de Relevancia',
};

export function AppShell({ children }: AppShellProps) {
  const { theme, toggle } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'PostFlow';

  return (
    <>
      <div className="app-bg" />
      <div className="app-window">
        <header className="app-topbar">
          <div className="topbar-brand">
            <button className="sidebar-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
              <Menu size={18} />
            </button>
            <div className="topbar-logo-mark" aria-hidden="true">PF</div>
            <span className="app-topbar-title">{pageTitle}</span>
          </div>

          <div className="app-topbar-actions">
            <button
              onClick={toggle}
              className="theme-toggle-btn"
              title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              aria-label="Alternar tema"
            >
              <span className="theme-toggle-track">
                <span className="theme-toggle-thumb">
                  {theme === 'dark' ? <Moon className="theme-toggle-icon" /> : <Sun className="theme-toggle-icon" />}
                </span>
              </span>
            </button>

            <button className="topbar-btn" aria-label="Notificacoes" style={{ position: 'relative' }}>
              <Bell size={16} />
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  border: '1.5px solid var(--bg-main)',
                }}
              />
            </button>
          </div>
        </header>

        <div className="app-body">
          <div className="desktop-sidebar">
            <Sidebar />
          </div>

          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div
                  className="sidebar-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  onClick={() => setSidebarOpen(false)}
                />
                <motion.div
                  className="mobile-sidebar-panel"
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                >
                  <Sidebar onClose={() => setSidebarOpen(false)} />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              className="app-main"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </div>

        <nav className="mobile-bottom-nav" aria-label="Navegacao principal mobile">
          {mobileNavItems.map((item) => (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => (isActive ? 'active' : undefined)}>
              <item.icon size={19} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}
