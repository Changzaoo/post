import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

// Firebase public config — safe to commit (security via Firestore/Auth rules)
// Override with VITE_ env vars in .env or Vercel dashboard
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyAhUdwr5gsl8oV3i04SfjhIZCH2T2_Wp6M',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'post-93621.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'post-93621',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'post-93621.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '82414298728',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:82414298728:web:37ed694b2444ded93dfddd',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? 'G-Q69PM24P8H',
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export let analytics: Analytics | null = null;

if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported && firebaseConfig.measurementId) {
        analytics = getAnalytics(app);
      }
    })
    .catch((error) => {
      console.warn('Firebase Analytics not supported:', error);
    });
}

export default app;
