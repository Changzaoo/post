import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Eye, EyeOff, CheckCircle, XCircle, Loader } from 'lucide-react';

type UsernameState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

const fieldBase: React.CSSProperties = {
  width: '100%', height: 42, borderRadius: 10,
  border: '0.5px solid rgba(255,255,255,0.14)',
  background: 'rgba(118,118,128,0.18)',
  color: 'rgba(255,255,255,0.88)',
  fontSize: 14, padding: '0 13px', outline: 'none',
  fontFamily: 'inherit', letterSpacing: '-0.005em',
  transition: 'border-color 220ms, box-shadow 220ms, background 220ms',
};

function applyFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = 'rgba(59,110,255,0.65)';
  e.target.style.boxShadow   = '0 0 0 3px rgba(59,110,255,0.15)';
  e.target.style.background  = 'rgba(118,118,128,0.24)';
}
function applyBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = 'rgba(255,255,255,0.14)';
  e.target.style.boxShadow   = 'none';
  e.target.style.background  = 'rgba(118,118,128,0.18)';
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12.5, fontWeight: 500, color: 'rgba(235,235,245,0.55)', marginBottom: 6, letterSpacing: '-0.005em' }}>
      {children}
    </div>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername]           = useState('');
  const [displayName, setDisplayName]     = useState('');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [usernameState, setUsernameState] = useState<UsernameState>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!username) { setUsernameState('idle'); return; }
    if (!/^[a-zA-Z0-9._-]{3,30}$/.test(username)) { setUsernameState('invalid'); return; }
    setUsernameState('checking');
    debounceRef.current = setTimeout(async () => {
      try {
        const snap = await getDoc(doc(db, 'usernames', username.toLowerCase()));
        setUsernameState(snap.exists() ? 'taken' : 'available');
      } catch { setUsernameState('idle'); }
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [username]);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!username || !email || !password || !confirmPassword) { setError('Preencha todos os campos obrigatórios.'); return; }
    if (usernameState === 'taken')   { setError('Usuário já em uso.'); return; }
    if (usernameState === 'invalid') { setError('Usuário inválido.'); return; }
    if (password !== confirmPassword) { setError('Senhas não coincidem.'); return; }
    if (password.length < 6) { setError('Senha deve ter no mínimo 6 caracteres.'); return; }
    setLoading(true);
    try {
      await register(username.trim(), email.trim(), password, displayName.trim() || username.trim());
      navigate('/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar conta';
      setError(msg.includes('email-already-in-use') ? 'Este e-mail já está cadastrado.' : msg);
    } finally {
      setLoading(false);
    }
  };

  const usernameHint = () => {
    if (usernameState === 'idle' || !username) return null;
    if (usernameState === 'checking') return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(235,235,245,0.38)' }}>
        <Loader size={11} className="animate-spin" /> Verificando…
      </span>
    );
    if (usernameState === 'available') return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#34d399' }}>
        <CheckCircle size={11} /> Disponível
      </span>
    );
    if (usernameState === 'taken') return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#ff6b6b' }}>
        <XCircle size={11} /> Já em uso
      </span>
    );
    if (usernameState === 'invalid') return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#fbbf24' }}>
        <XCircle size={11} /> 3-30 chars: letras, números, . _ -
      </span>
    );
    return null;
  };

  return (
    <>
      <div className="app-bg" />

      <motion.div
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 380, margin: '0 auto', padding: '0 16px' }}
        initial={{ opacity: 0, y: 22, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div
          style={{
            borderRadius: 22,
            border: '0.5px solid rgba(255,255,255,0.12)',
            background: 'rgba(28,28,30,0.9)',
            backdropFilter: 'blur(40px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 8px 32px rgba(0,0,0,0.5)',
            padding: '32px 28px',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div className="sidebar-logo-icon" style={{ width: 36, height: 36, fontSize: 16, borderRadius: 10 }}>α</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.015em' }}>Post Alpha</div>
              <div style={{ fontSize: 11, color: 'rgba(235,235,245,0.3)', marginTop: 1 }}>Growth OS</div>
            </div>
          </div>

          <h2 style={{ fontSize: 21, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.025em', marginBottom: 5 }}>
            Criar conta
          </h2>
          <p style={{ fontSize: 13.5, color: 'rgba(235,235,245,0.45)', marginBottom: 22, letterSpacing: '-0.005em' }}>
            Preencha os dados abaixo para começar
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Username */}
            <div>
              <FieldLabel>Usuário <span style={{ color: '#ff6b6b' }}>*</span></FieldLabel>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value.replace(/\s/g, ''))}
                placeholder="meu_usuario"
                autoComplete="username"
                style={fieldBase}
                onFocus={applyFocus}
                onBlur={applyBlur}
              />
              <div style={{ minHeight: 18, marginTop: 5 }}>{usernameHint()}</div>
            </div>

            {/* Display name */}
            <div>
              <FieldLabel>Nome de exibição</FieldLabel>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Seu nome completo"
                autoComplete="name"
                style={fieldBase}
                onFocus={applyFocus}
                onBlur={applyBlur}
              />
            </div>

            {/* Email */}
            <div>
              <FieldLabel>E-mail (recuperação)</FieldLabel>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="voce@email.com"
                autoComplete="email"
                style={fieldBase}
                onFocus={applyFocus}
                onBlur={applyBlur}
              />
            </div>

            {/* Password */}
            <div>
              <FieldLabel>Senha <span style={{ color: '#ff6b6b' }}>*</span></FieldLabel>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  style={{ ...fieldBase, paddingRight: 42 }}
                  onFocus={applyFocus}
                  onBlur={applyBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(235,235,245,0.35)', display: 'flex',
                    padding: 4, borderRadius: 6, transition: 'color 200ms',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(235,235,245,0.65)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(235,235,245,0.35)'; }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <FieldLabel>Confirmar senha <span style={{ color: '#ff6b6b' }}>*</span></FieldLabel>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                autoComplete="new-password"
                style={{
                  ...fieldBase,
                  ...(confirmPassword && password !== confirmPassword
                    ? { borderColor: 'rgba(255,69,58,0.5)', background: 'rgba(255,69,58,0.07)' }
                    : {}),
                }}
                onFocus={applyFocus}
                onBlur={applyBlur}
              />
              {confirmPassword && password !== confirmPassword && (
                <p style={{ fontSize: 12, color: '#ff6b6b', marginTop: 5 }}>Senhas não coincidem</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                style={{ borderRadius: 10, border: '0.5px solid rgba(255,69,58,0.25)', background: 'rgba(255,69,58,0.10)', padding: '10px 13px', fontSize: 13, color: '#ff6b6b' }}
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              loading={loading}
              variant="primary"
              size="lg"
              className="w-full mt-1"
              disabled={usernameState === 'checking' || usernameState === 'taken' || usernameState === 'invalid'}
            >
              Criar conta
            </Button>
          </form>

          <p style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'rgba(235,235,245,0.38)' }}>
            Já tem uma conta?{' '}
            <Link to="/login" style={{ color: '#7EB8FF', fontWeight: 500, textDecoration: 'none' }}>
              Entrar
            </Link>
          </p>
        </div>
      </motion.div>
    </>
  );
}
