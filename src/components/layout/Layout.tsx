import type { ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

export function Layout({ children, onNavigate, currentPage }: LayoutProps) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Header onNavigate={onNavigate} currentPage={currentPage} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

