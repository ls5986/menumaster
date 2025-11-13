interface ProgressBarProps {
  progress: number; // 0-100
  showLabel?: boolean;
  color?: 'gold' | 'green' | 'blue' | 'red';
  className?: string;
}

export function ProgressBar({
  progress,
  showLabel = false,
  color = 'gold',
  className = ''
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const colorClasses = {
    gold: 'bg-accent-gold',
    green: 'bg-correct',
    blue: 'bg-info',
    red: 'bg-incorrect'
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="relative w-full h-3 bg-bg-tertiary rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-sm text-text-secondary mt-1 text-center">
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  );
}

