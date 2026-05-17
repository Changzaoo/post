import { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CheckCircle, AlertTriangle, User, Lock, Trash2 } from 'lucide-react';

export function AccountSettings() {
  const { user, userProfile, changePassword } = useAuth();

  const [displayName, setDisplayName] = useState(userProfile?.displayName ?? '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [newUsername, setNewUsername] = useState('');
  const [usernameMsg, setUsernameMsg] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true); setProfileMsg('');
    try {
      await updateDoc(doc(db, 'users', user.uid), { displayName: displayName.trim(), updatedAt: new Date() });
      setProfileMsg('Profile updated successfully!');
    } catch { setProfileMsg('Error updating profile.'); }
    finally { setSavingProfile(false); }
  };

  const handleChangePassword = async () => {
    setPasswordError(''); setPasswordMsg('');
    if (!newPassword || !confirmPassword) { setPasswordError('Fill in all fields.'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match.'); return; }
    if (newPassword.length < 6) { setPasswordError('New password must be at least 6 characters.'); return; }
    setSavingPassword(true);
    try {
      await changePassword(newPassword);
      setPasswordMsg('Password changed successfully!');
      setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error';
      setPasswordError(msg.includes('requires-recent-login')
        ? 'Session expired. Log out and back in to change password.'
        : msg);
    } finally { setSavingPassword(false); }
  };

  const checkUsername = async () => {
    if (!newUsername || newUsername.length < 3) return;
    setCheckingUsername(true);
    try {
      const snap = await getDoc(doc(db, 'usernames', newUsername.toLowerCase()));
      setUsernameMsg(snap.exists() ? 'Username already in use.' : 'Username available!');
    } finally { setCheckingUsername(false); }
  };

  const handleSaveUsername = async () => {
    if (!user || !newUsername || usernameMsg !== 'Username available!') return;
    setSavingUsername(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { username: newUsername, usernameLower: newUsername.toLowerCase(), updatedAt: new Date() });
      const { setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'usernames', newUsername.toLowerCase()), { uid: user.uid, email: userProfile?.email ?? user.email, username: newUsername });
      setUsernameMsg('Username updated successfully!');
      setNewUsername('');
    } catch { setUsernameMsg('Error updating username.'); }
    finally { setSavingUsername(false); }
  };

  const initials = userProfile?.displayName?.slice(0, 2).toUpperCase() ?? 'U';

  return (
    <Layout>
      <div className="max-w-xl mx-auto space-y-5">
        {/* Avatar card */}
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="sidebar-user-avatar" style={{ width: 56, height: 56, fontSize: 20 }}>{initials}</div>
            <div>
              <p className="text-base font-semibold text-slate-800">
                {userProfile?.displayName ?? userProfile?.username}
              </p>
              <p className="text-sm text-slate-400">@{userProfile?.username}</p>
              <p className="text-xs text-slate-400 mt-0.5 capitalize">Role: {userProfile?.role}</p>
            </div>
          </CardContent>
        </Card>

        {/* Profile info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" /> Profile information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1.5">Email (recovery)</label>
              <p className="text-sm text-slate-400">{userProfile?.email ?? user?.email ?? 'Not defined'}</p>
            </div>
            {profileMsg && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" /> {profileMsg}
              </div>
            )}
            <Button variant="primary" loading={savingProfile} onClick={handleSaveProfile}>Save changes</Button>
          </CardContent>
        </Card>

        {/* Change username */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" /> Change username
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-400">
              Current username: <span className="text-slate-600 font-mono">@{userProfile?.username}</span>
            </p>
            <div className="flex gap-2">
              <Input
                value={newUsername}
                onChange={(e) => { setNewUsername(e.target.value); setUsernameMsg(''); }}
                placeholder="new_username"
                className="flex-1"
              />
              <Button variant="secondary" size="sm" onClick={checkUsername} loading={checkingUsername}>Check</Button>
            </div>
            {usernameMsg && (
              <p className={`text-sm ${usernameMsg.includes('available') ? 'text-green-600' : 'text-red-500'}`}>
                {usernameMsg}
              </p>
            )}
            <Button variant="primary" loading={savingUsername} onClick={handleSaveUsername} disabled={usernameMsg !== 'Username available!'}>
              Save username
            </Button>
          </CardContent>
        </Card>

        {/* Change password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-500" /> Change password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 6 characters" />
            <Input
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              error={confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match' : undefined}
            />
            {passwordError && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertTriangle className="h-4 w-4" /> {passwordError}
              </div>
            )}
            {passwordMsg && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" /> {passwordMsg}
              </div>
            )}
            <Button variant="primary" loading={savingPassword} onClick={handleChangePassword}>Change password</Button>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <Trash2 className="h-4 w-4" /> Danger zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 mb-4">
              Account deletion is permanent and cannot be undone. All your data will be removed.
            </p>
            <Button variant="danger" size="sm" onClick={() => alert('Contact an administrator to delete your account.')}>
              Delete my account
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
