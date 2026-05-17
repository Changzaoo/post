import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import {
  collection, getDocs, doc, updateDoc, addDoc,
  serverTimestamp, query, orderBy, limit,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import type { UserProfile, UserRole } from '../types';
import { Users, UserPlus, Activity, Shield } from 'lucide-react';

type TabKey = 'users' | 'create' | 'logs';

const ROLE_BADGE_VARIANT: Record<UserRole, 'default' | 'info' | 'success' | 'muted'> = {
  admin: 'default', editor: 'info', creator: 'success', viewer: 'muted',
};

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin', editor: 'Editor', creator: 'Creator', viewer: 'Viewer',
};

export function Admin() {
  const { isAdmin, user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('creator');
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState('');
  const [createError, setCreateError] = useState('');

  const [logs, setLogs] = useState<{ id: string; action: string; userId: string; createdAt: Date }[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const items = snap.docs.map((d) => ({
          ...d.data(),
          createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
          updatedAt: d.data().updatedAt?.toDate?.() ?? new Date(),
        })) as UserProfile[];
        setUsers(items);
      } finally { setLoadingUsers(false); }
    };
    loadUsers();
  }, []);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (activeTab !== 'logs') return;
    const loadLogs = async () => {
      setLoadingLogs(true);
      try {
        const q = query(collection(db, 'activityLogs'), orderBy('createdAt', 'desc'), limit(50));
        const snap = await getDocs(q);
        const items = snap.docs.map((d) => ({
          id: d.id, ...d.data(),
          createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
        })) as { id: string; action: string; userId: string; createdAt: Date }[];
        setLogs(items);
      } finally { setLoadingLogs(false); }
    };
    loadLogs();
  }, [activeTab]);

  const handleUpdateRole = async (uid: string, role: UserRole) => {
    await updateDoc(doc(db, 'users', uid), { role, updatedAt: new Date() });
    setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role } : u)));
  };

  const handleToggleStatus = async (uid: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    await updateDoc(doc(db, 'users', uid), { status: newStatus, updatedAt: new Date() });
    setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, status: newStatus as 'active' | 'disabled' } : u)));
  };

  const handleCreateUser = async () => {
    setCreateError(''); setCreateMsg('');
    if (!newUsername || !newEmail || !newPassword) { setCreateError('Preencha usuário, email e senha.'); return; }
    setCreating(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, newEmail, newPassword);
      const profile: UserProfile = {
        uid: cred.user.uid, username: newUsername, usernameLower: newUsername.toLowerCase(),
        email: newEmail, displayName: newDisplayName || newUsername,
        role: newRole, status: 'active', createdAt: new Date(), updatedAt: new Date(), createdBy: user?.uid,
      };
      const { setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'users', cred.user.uid), { ...profile, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      await setDoc(doc(db, 'usernames', newUsername.toLowerCase()), { uid: cred.user.uid, email: newEmail, username: newUsername });
      await addDoc(collection(db, 'activityLogs'), {
        action: `Admin criou usuário @${newUsername}`, userId: user?.uid,
        targetUserId: cred.user.uid, createdAt: serverTimestamp(),
      });
      setUsers((prev) => [...prev, profile]);
      setCreateMsg(`Usuário @${newUsername} criado com sucesso!`);
      setNewUsername(''); setNewEmail(''); setNewDisplayName(''); setNewPassword(''); setNewRole('creator');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro';
      setCreateError(msg.includes('email-already-in-use') ? 'Email já cadastrado.' : msg);
    } finally { setCreating(false); }
  };

  const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: 'users', label: 'Usuários', icon: Users },
    { key: 'create', label: 'Criar usuário', icon: UserPlus },
    { key: 'logs', label: 'Logs', icon: Activity },
  ];

  const selectStyle: React.CSSProperties = {
    height: 32, padding: '0 8px', borderRadius: 8,
    border: '0.5px solid rgba(255,255,255,0.10)',
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--text-secondary)', fontSize: 12, outline: 'none', cursor: 'pointer',
  };

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <motion.div style={{ marginBottom: 24 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(59,110,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={20} style={{ color: '#7EB8FF' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Painel Admin</h1>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Gerencie usuários e configurações do workspace</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', width: 'fit-content', marginBottom: 20 }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={activeTab === tab.key ? {
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10,
                background: 'linear-gradient(135deg, #3B6EFF, #1A5CFF)', color: '#fff',
                fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(59,110,255,0.35)',
              } : {
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10,
                background: 'transparent', color: 'var(--text-tertiary)',
                fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer',
                transition: 'color 150ms',
              }}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Users table */}
        {activeTab === 'users' && (
          <motion.div className="glass-card" style={{ padding: 20 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Usuários ({users.length})</h3>
            </div>
            {loadingUsers ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
                <div style={{ width: 24, height: 24, border: '2px solid rgba(59,110,255,0.20)', borderTopColor: '#3B6EFF', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {users.map((u) => (
                  <div key={u.uid} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', background: 'rgba(59,110,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#7EB8FF' }}>
                      {u.displayName?.slice(0, 2).toUpperCase() ?? 'U'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.displayName}</p>
                        <Badge variant={ROLE_BADGE_VARIANT[u.role]}>{ROLE_LABELS[u.role]}</Badge>
                        <Badge variant={u.status === 'active' ? 'success' : 'error'}>
                          {u.status === 'active' ? 'Ativo' : 'Desabilitado'}
                        </Badge>
                      </div>
                      <p style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>@{u.username} · {u.email}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-tertiary)', opacity: 0.6 }}>
                        Criado: {u.createdAt instanceof Date ? u.createdAt.toLocaleDateString('pt-BR') : '—'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.uid, e.target.value as UserRole)}
                        style={{ ...selectStyle, background: '#020818' }}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="creator">Creator</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                      <Button
                        variant={u.status === 'active' ? 'outline' : 'secondary'}
                        size="sm"
                        onClick={() => handleToggleStatus(u.uid, u.status)}
                      >
                        {u.status === 'active' ? 'Desabilitar' : 'Ativar'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Create user */}
        {activeTab === 'create' && (
          <motion.div className="glass-card" style={{ padding: 24 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>Criar novo usuário</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 420 }}>
              <Input label="Usuário" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="novo_usuario" />
              <Input label="Nome de exibição" value={newDisplayName} onChange={(e) => setNewDisplayName(e.target.value)} placeholder="Nome Completo" />
              <Input label="Email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="usuario@email.com" />
              <Input label="Senha inicial" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Papel</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 10, border: '0.5px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontSize: 13, outline: 'none', cursor: 'pointer' }}
                >
                  <option value="viewer" style={{ background: '#020818' }}>Viewer</option>
                  <option value="creator" style={{ background: '#020818' }}>Creator</option>
                  <option value="editor" style={{ background: '#020818' }}>Editor</option>
                  <option value="admin" style={{ background: '#020818' }}>Admin</option>
                </select>
              </div>
              {createError && (
                <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,71,87,0.10)', border: '0.5px solid rgba(255,71,87,0.25)', fontSize: 13, color: '#FF6B7A' }}>
                  {createError}
                </div>
              )}
              {createMsg && (
                <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(16,217,122,0.08)', border: '0.5px solid rgba(16,217,122,0.22)', fontSize: 13, color: '#10D97A' }}>
                  {createMsg}
                </div>
              )}
              <Button variant="primary" loading={creating} onClick={handleCreateUser} className="gap-2">
                <UserPlus className="h-4 w-4" /> Criar usuário
              </Button>
            </div>
          </motion.div>
        )}

        {/* Logs */}
        {activeTab === 'logs' && (
          <motion.div className="glass-card" style={{ padding: 20 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Logs de Atividade</h3>
            {loadingLogs ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
                <div style={{ width: 24, height: 24, border: '2px solid rgba(59,110,255,0.20)', borderTopColor: '#3B6EFF', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
              </div>
            ) : logs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Activity size={40} style={{ color: 'var(--text-tertiary)', margin: '0 auto 12px' }} />
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Nenhum log de atividade registrado ainda</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {logs.map((log) => (
                  <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B6EFF', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>{log.action}</span>
                    <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)', flexShrink: 0 }}>
                      {log.createdAt instanceof Date ? log.createdAt.toLocaleString('pt-BR') : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
