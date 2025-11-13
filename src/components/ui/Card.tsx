import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className = '', onClick, hover = false }: CardProps) {
  const hoverClasses = hover ? 'hover:bg-bg-tertiary hover:scale-105 cursor-pointer' : '';
  
  return (
    <div
      className={`bg-bg-secondary rounded-xl p-6 border border-bg-tertiary transition-all duration-200 ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

