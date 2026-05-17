import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { Platform } from '../types';

const DEMO_POSTS = [
  {
    baseText: 'Lançamos uma nova feature incrível no PostFlow! Agora você pode publicar em 8 plataformas diferentes com um só clique. Teste você mesmo!',
    selectedPlatforms: ['instagram', 'x', 'telegram'] as Platform[],
    results: {
      instagram: { status: 'mocked', message: 'Demo - Instagram simulado' },
      x: { status: 'mocked', message: 'Demo - X simulado' },
      telegram: { status: 'published', message: 'Enviado com sucesso' },
    },
    mediaType: null,
    mediaUrl: null,
    _isDemo: true,
  },
  {
    baseText: 'Dicas para crescer nas redes sociais em 2026: 1) Consistência é tudo 2) Engaje com sua audiência 3) Use o PostFlow para simplificar tudo!',
    selectedPlatforms: ['tiktok', 'instagram', 'discord'] as Platform[],
    results: {
      tiktok: { status: 'mocked', message: 'Demo - TikTok simulado' },
      instagram: { status: 'mocked', message: 'Demo - Instagram simulado' },
      discord: { status: 'published', message: 'Enviado ao servidor' },
    },
    mediaType: null,
    mediaUrl: null,
    _isDemo: true,
  },
  {
    baseText: 'O futuro do marketing de conteúdo é a automação inteligente. Com o PostFlow você adapta seu conteúdo para cada plataforma automaticamente.',
    selectedPlatforms: ['x', 'linkedin', 'telegram'] as Platform[],
    results: {
      x: { status: 'mocked', message: 'Demo - X simulado' },
      linkedin: { status: 'mocked', message: 'Demo - LinkedIn simulado' },
      telegram: { status: 'published', message: 'Enviado ao canal' },
    },
    mediaType: null,
    mediaUrl: null,
    _isDemo: true,
  },
];

export async function seedDemoData(userId: string): Promise<void> {
  try {
    // Check if user already has posts
    const q = query(
      collection(db, 'publishedPosts'),
      where('userId', '==', userId)
    );
    const existing = await getDocs(q);
    if (!existing.empty) return; // Already has data

    // Create demo posts
    for (const post of DEMO_POSTS) {
      await addDoc(collection(db, 'publishedPosts'), {
        userId,
        ...post,
        adaptedContent: null,
        createdAt: serverTimestamp(),
      });
    }

    console.log('[PostFlow] Demo data seeded for user:', userId);
  } catch (err) {
    console.warn('[PostFlow] Could not seed demo data:', err);
  }
}
