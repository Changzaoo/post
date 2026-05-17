import { AppShell } from './AppShell';
import type { ReactNode } from 'react';

export function Layout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
