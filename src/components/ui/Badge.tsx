import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-bg-tertiary text-text-primary',
    success: 'bg-correct/20 text-correct border border-correct/30',
    warning: 'bg-warning/20 text-warning border border-warning/30',
    danger: 'bg-incorrect/20 text-incorrect border border-incorrect/30',
    info: 'bg-info/20 text-info border border-info/30'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
}

