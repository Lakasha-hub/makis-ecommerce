import { Header } from './Header';
import { Footer } from './Footer';
import type { ReactNode } from 'react';
export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
