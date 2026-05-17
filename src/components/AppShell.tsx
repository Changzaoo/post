import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Bell, Sun, Moon, Menu } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface AppShellProps {
  children: ReactNode;
  title?: string;
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':       'Dashboard',
  '/funil':           'Funil de Vendas',
  '/retencao':        'Retenção de Público',
  '/estrategias':     'Estratégias',
  '/campanhas':       'Campanhas',
  '/conteudos':       'Conteúdos',
  '/checklist':       'Checklist de Conversão',
  '/ia':              'Sugestões IA',
  '/composer':        'Nova Publicação',
  '/calendar':        'Calendário',
  '/metrics':         'Métricas',
  '/reels':           'Reels',
  '/history':         'Histórico',
  '/settings':        'Configurações',
  '/admin':           'Admin',
  '/funil-relevancia':'Funil de Relevância',
};

export function AppShell({ children }: AppShellProps) {
  const { theme, toggle } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // Prevent body scroll when mobile sidebar open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Post Alpha';

  return (
    <>
      {/* Background */}
      <div className="app-bg" />

      {/* macOS window */}
      <div className="app-window">

        {/* Topbar */}
        <div className="app-topbar">
          {/* Traffic lights */}
          <div className="app-topbar-dots">
            <div className="app-topbar-dot" style={{ background: '#ff5f57' }} />
            <div className="app-topbar-dot" style={{ background: '#febc2e' }} />
            <div className="app-topbar-dot" style={{ background: '#28c840' }} />
          </div>

          {/* Mobile menu trigger */}
          <button
            className="sidebar-hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu size={16} />
          </button>

          {/* Title */}
          <span className="app-topbar-title">{pageTitle}</span>

          {/* Actions */}
          <div className="app-topbar-actions">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="theme-toggle-btn"
              title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              aria-label="Alternar tema"
            >
              <span className="theme-toggle-track">
                <span className="theme-toggle-thumb">
                  {theme === 'dark'
                    ? <Moon className="theme-toggle-icon" />
                    : <Sun  className="theme-toggle-icon" />}
                </span>
              </span>
            </button>

            {/* Notification bell */}
            <button className="topbar-btn" aria-label="Notificações" style={{ position: 'relative' }}>
              <Bell size={15} />
              <span
                style={{
                  position: 'absolute', top: 5, right: 5,
                  width: 6, height: 6,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  border: '1.5px solid var(--bg-window)',
                }}
              />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="app-body">
          {/* Desktop sidebar */}
          <div style={{ display: 'contents' }} className="sidebar-desktop-wrapper">
            <Sidebar />
          </div>

          {/* Mobile sidebar overlay + panel */}
          <AnimatePresence>
            {sidebarOpen && (
              <>
                {/* Overlay */}
                <motion.div
                  className="sidebar-overlay"
                  style={{ position: 'absolute', zIndex: 40 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  onClick={() => setSidebarOpen(false)}
                />
                {/* Panel */}
                <motion.div
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, bottom: 0,
                    width: 'var(--sidebar-width)',
                    zIndex: 50,
                    display: 'flex',
                  }}
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                >
                  <Sidebar onClose={() => setSidebarOpen(false)} />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main content — page transition */}
          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              className="app-main"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
