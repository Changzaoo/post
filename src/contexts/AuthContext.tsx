import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updatePassword,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { UserProfile, UserRole } from '../types';

const ADMIN_EMAIL = 'vinicinhos@gmail.com';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  permissionError: string | null;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  changePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserProfile({
              ...data,
              createdAt: data.createdAt?.toDate?.() ?? new Date(),
              updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
              lastLoginAt: data.lastLoginAt?.toDate?.() ?? undefined,
            } as UserProfile);
          } else {
            // First-time user — create profile
            const isAdminUser = firebaseUser.email === ADMIN_EMAIL;
            const username = firebaseUser.email?.split('@')[0] ?? 'user';
            const profile: UserProfile = {
              uid: firebaseUser.uid,
              username,
              usernameLower: username.toLowerCase(),
              email: firebaseUser.email ?? undefined,
              displayName: firebaseUser.displayName ?? username,
              role: isAdminUser ? 'admin' : 'creator',
              status: 'active',
              createdAt: new Date(),
              updatedAt: new Date(),
              lastLoginAt: new Date(),
            };
            try {
              await setDoc(docRef, {
                ...profile,
                createdAt: new Date(),
                updatedAt: new Date(),
                lastLoginAt: new Date(),
              });
              // Also create username lookup
              await setDoc(doc(db, 'usernames', username.toLowerCase()), {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                username,
              });
              setUserProfile(profile);
            } catch (writeErr) {
              console.warn('Could not write user profile:', writeErr);
              setUserProfile(profile);
            }
          }
        } catch (err) {
          if (err instanceof Error && err.message.includes('permission')) {
            setPermissionError(
              'Permissão negada. Configure as regras do Firestore no console do Firebase.'
            );
          }
          console.error('AuthContext load error:', err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (username: string, password: string) => {
    setPermissionError(null);
    // Look up email by username
    let emailToUse = username;

    // If it doesn't look like an email, do username lookup
    if (!username.includes('@')) {
      try {
        const q = query(
          collection(db, 'usernames'),
          where('username', '==', username.toLowerCase())
        );
        const snap = await getDocs(q);
        if (snap.empty) {
          // Try exact doc by id
          const docSnap = await getDoc(doc(db, 'usernames', username.toLowerCase()));
          if (docSnap.exists()) {
            emailToUse = docSnap.data().email;
          } else {
            throw new Error('Usuário não encontrado. Verifique o nome de usuário.');
          }
        } else {
          emailToUse = snap.docs[0].data().email;
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes('Usuário')) throw err;
        // If Firestore lookup fails (permissions), try treating as email
        emailToUse = username;
      }
    }

    await signInWithEmailAndPassword(auth, emailToUse, password);
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    displayName: string
  ) => {
    setPermissionError(null);

    // Validate username
    if (!/^[a-zA-Z0-9._-]{3,30}$/.test(username)) {
      throw new Error(
        'Username inválido. Use 3-30 caracteres: letras, números, ponto, hífen ou sublinhado.'
      );
    }

    // Check username availability
    const existingDoc = await getDoc(doc(db, 'usernames', username.toLowerCase()));
    if (existingDoc.exists()) {
      throw new Error('Este username já está em uso. Escolha outro.');
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const isAdminUser = email === ADMIN_EMAIL;

    const profile: UserProfile = {
      uid: cred.user.uid,
      username,
      usernameLower: username.toLowerCase(),
      email,
      displayName: displayName || username,
      role: isAdminUser ? 'admin' : 'creator',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await setDoc(doc(db, 'users', cred.user.uid), {
        ...profile,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await setDoc(doc(db, 'usernames', username.toLowerCase()), {
        uid: cred.user.uid,
        email,
        username,
      });
      setUserProfile(profile);
    } catch (err) {
      if (err instanceof Error && err.message.includes('permission')) {
        setPermissionError(
          'Permissão negada ao salvar dados. Configure as regras do Firestore.'
        );
      }
      setUserProfile(profile);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const changePassword = async (newPassword: string) => {
    if (!user) throw new Error('Não autenticado');
    await updatePassword(user, newPassword);
  };

  const isAdmin = userProfile?.role === 'admin';

  const hasRole = (role: UserRole): boolean => {
    if (!userProfile) return false;
    const hierarchy: UserRole[] = ['viewer', 'creator', 'editor', 'admin'];
    const userLevel = hierarchy.indexOf(userProfile.role);
    const requiredLevel = hierarchy.indexOf(role);
    return userLevel >= requiredLevel;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        permissionError,
        isAdmin,
        login,
        register,
        logout,
        hasRole,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
