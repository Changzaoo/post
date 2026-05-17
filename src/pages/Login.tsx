import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Zap, TrendingUp, Target, BarChart3, Shield } from 'lucide-react';

const floatingCards = [
  { icon: TrendingUp, label: 'Funil de Vendas', value: '+38%', color: '#20F5D8', x: -280, y: -60, delay: 0 },
  { icon: Target, label: 'Taxa de Conversão', value: '12.4%', color: '#FFD84D', x: 260, y: -40, delay: 0.3 },
  { icon: BarChart3, label: 'Retenção', value: '68%', color: '#8B5CF6', x: -240, y: 120, delay: 0.6 },
  { icon: Zap, label: 'Campanhas Ativas', value: '6', color: '#10D97A', x: 240, y: 130, delay: 0.9 },
];

export function Login() {
  const { login, permissionError } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) { setError('Preencha todos os campos.'); return; }
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('invalid-credential') || msg.includes('user-not-found') || msg.includes('wrong-password')) {
        setError('Usuário ou senha incorretos.');
      } else if (msg.includes('too-many-requests')) {
        setError('Muitas tentativas. Tente novamente mais tarde.');
      } else {
        setError(msg || 'Erro de autenticação.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {/* Background layers */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #020818 0%, #061B7A 35%, #020818 65%, #0D0520 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(0,59,255,0.25) 0%, transparent 55%), radial-gradient(ellipse at 80% 50%, rgba(139,92,246,0.20) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(32,245,216,0.08) 0%, transparent 45%)' }} />

      {/* Animated blobs */}
      <motion.div
        style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,59,255,0.18) 0%, transparent 70%)', top: '-15%', left: '-10%', filter: 'blur(60px)' }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', bottom: '-10%', right: '-8%', filter: 'blur(50px)' }}
        animate={{ x: [0, -25, 0], y: [0, 20, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(32,245,216,0.10) 0%, transparent 70%)', top: '40%', left: '60%', filter: 'blur(40px)' }}
        animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />

      {/* 3D Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(59,110,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,110,255,0.04) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, transparent 75%)',
      }} />

      {/* Floating stat cards — desktop only */}
      {floatingCards.map((card) => (
        <motion.div
          key={card.label}
          style={{
            position: 'absolute',
            left: '50%', top: '50%',
            marginLeft: card.x, marginTop: card.y,
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            border: `0.5px solid ${card.color}28`,
            borderRadius: 14,
            padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: [0, -6, 0] }}
          transition={{ delay: card.delay + 0.6, duration: 0.5, y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: card.delay } }}
        >
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `${card.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <card.icon size={15} style={{ color: card.color }} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(180,200,240,0.55)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: card.color, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{card.value}</div>
          </div>
        </motion.div>
      ))}

      {/* Main login card */}
      <motion.div
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 400, margin: '0 auto', padding: '0 20px' }}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div style={{
          borderRadius: 24,
          border: '0.5px solid rgba(59,110,255,0.25)',
          background: 'rgba(4,12,40,0.85)',
          backdropFilter: 'blur(48px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(48px) saturate(1.6)',
          boxShadow: '0 40px 120px rgba(0,0,40,0.80), 0 0 0 0.5px rgba(59,110,255,0.15), 0 0 80px rgba(0,59,255,0.10)',
          padding: '40px 36px',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Card top glow */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(59,110,255,0.60), rgba(32,245,216,0.40), transparent)' }} />
          <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,59,255,0.12) 0%, transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }} />

          {/* Logo */}
          <motion.div
            style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'linear-gradient(135deg, #003BFF 0%, #20F5D8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 900, fontSize: 20,
              boxShadow: '0 4px 20px rgba(0,59,255,0.50), 0 0 0 1px rgba(32,245,216,0.25)',
              flexShrink: 0, fontFamily: 'Inter, sans-serif',
            }}>α</div>
            <div>
              <div style={{
                fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em',
                background: 'linear-gradient(90deg, #F7FBFF 0%, #20F5D8 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Post Alpha</div>
              <div style={{ fontSize: 10, color: 'rgba(140,170,220,0.50)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 1 }}>Growth OS</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'rgba(247,251,255,0.95)', letterSpacing: '-0.03em', marginBottom: 6, lineHeight: 1.2 }}>
              Entre no seu painel de crescimento
            </h2>
            <p style={{ fontSize: 13.5, color: 'rgba(140,170,220,0.60)', marginBottom: 28, lineHeight: 1.5 }}>
              Gerencie funis, retenção, campanhas e métricas em um só lugar.
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            {/* Username */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(140,170,220,0.70)', marginBottom: 7, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Usuário
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="seu_usuario"
                autoComplete="username"
                autoFocus
                style={{
                  width: '100%', height: 46, borderRadius: 12,
                  border: '0.5px solid rgba(59,110,255,0.20)',
                  background: 'rgba(59,110,255,0.07)',
                  color: 'rgba(247,251,255,0.95)',
                  fontSize: 14, padding: '0 14px', outline: 'none',
                  fontFamily: 'inherit', letterSpacing: '-0.005em',
                  transition: 'all 200ms',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(59,110,255,0.55)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59,110,255,0.14)';
                  e.target.style.background = 'rgba(59,110,255,0.10)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(59,110,255,0.20)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = 'rgba(59,110,255,0.07)';
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(140,170,220,0.70)', marginBottom: 7, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: '100%', height: 46, borderRadius: 12,
                    border: '0.5px solid rgba(59,110,255,0.20)',
                    background: 'rgba(59,110,255,0.07)',
                    color: 'rgba(247,251,255,0.95)',
                    fontSize: 14, padding: '0 44px 0 14px', outline: 'none',
                    fontFamily: 'inherit', letterSpacing: '-0.005em',
                    transition: 'all 200ms',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'rgba(59,110,255,0.55)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59,110,255,0.14)';
                    e.target.style.background = 'rgba(59,110,255,0.10)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(59,110,255,0.20)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.background = 'rgba(59,110,255,0.07)';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  style={{
                    position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(140,170,220,0.40)', display: 'flex', padding: 4, borderRadius: 6,
                    transition: 'color 150ms',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(140,170,220,0.80)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(140,170,220,0.40)'; }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Errors */}
            {(error || permissionError) && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
                {error && (
                  <div style={{ borderRadius: 10, border: '0.5px solid rgba(255,71,87,0.30)', background: 'rgba(255,71,87,0.10)', padding: '10px 14px', fontSize: 13, color: '#FF6B7A' }}>
                    {error}
                  </div>
                )}
                {permissionError && (
                  <div style={{ borderRadius: 10, border: '0.5px solid rgba(255,216,77,0.30)', background: 'rgba(255,216,77,0.08)', padding: '10px 14px', fontSize: 13, color: '#FFD84D' }}>
                    <p style={{ fontWeight: 600, marginBottom: 2 }}>{permissionError}</p>
                    <p style={{ opacity: 0.75, fontSize: 12 }}>Configure as regras em <code style={{ background: 'rgba(255,216,77,0.15)', padding: '1px 5px', borderRadius: 4 }}>firestore.rules</code></p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                height: 48, borderRadius: 13, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? 'rgba(59,110,255,0.40)' : 'linear-gradient(135deg, #003BFF 0%, #1A5CFF 50%, #20F5D8 100%)',
                color: loading ? 'rgba(255,255,255,0.50)' : 'white',
                fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.005em',
                fontFamily: 'inherit',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(0,59,255,0.45), 0 0 0 1px rgba(32,245,216,0.15)',
                transition: 'all 200ms',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginTop: 4,
              }}
              onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 28px rgba(0,59,255,0.55), 0 0 0 1px rgba(32,245,216,0.20)'; } }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(0,59,255,0.45), 0 0 0 1px rgba(32,245,216,0.15)'; }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.30)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
                  Entrando...
                </>
              ) : 'Acessar Growth OS'}
            </button>
          </motion.form>

          {/* Security badge */}
          <motion.div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, background: 'rgba(16,217,122,0.07)', border: '0.5px solid rgba(16,217,122,0.18)' }}>
              <Shield size={11} style={{ color: '#10D97A' }} />
              <span style={{ fontSize: 11, color: 'rgba(16,217,122,0.80)', fontWeight: 600, letterSpacing: '0.02em' }}>Ambiente seguro para gestão estratégica</span>
            </div>
          </motion.div>

          <p style={{ marginTop: 16, textAlign: 'center', fontSize: 11.5, color: 'rgba(140,170,220,0.25)', letterSpacing: '-0.005em' }}>
            Post Alpha Growth OS © {new Date().getFullYear()}
          </p>

          {/* Bottom lock */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(59,110,255,0.25), rgba(32,245,216,0.15), transparent)' }} />
        </div>
      </motion.div>
    </div>
  );
}
