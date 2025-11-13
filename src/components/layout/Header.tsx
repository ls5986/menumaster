import { Moon, Sun, Home, Settings } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';

interface HeaderProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

export function Header({ onNavigate, currentPage = 'home' }: HeaderProps) {
  const { user, updateSettings } = useStore();
  const { level, xp, xpToNextLevel, streakDays, settings } = user;

  const progressPercent = (xp / (xp + xpToNextLevel)) * 100;

  const toggleDarkMode = () => {
    updateSettings({ darkMode: !settings.darkMode });
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="bg-bg-secondary border-b border-bg-tertiary sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-accent-gold">🍴 Mastro's</h1>
            <span className="text-text-secondary text-sm hidden sm:inline">
              Menu Master
            </span>
          </div>

          {/* Center - User Stats */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-text-secondary">Level</span>{' '}
                <span className="text-accent-gold font-bold">{level}</span>
              </div>
              <div className="flex-1">
                <ProgressBar progress={progressPercent} />
              </div>
              <div className="text-sm text-text-secondary">
                {xp}/{xp + xpToNextLevel} XP
              </div>
            </div>
          </div>

          {/* Right side - Streak & Actions */}
          <div className="flex items-center gap-3">
            {streakDays > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-accent-red/20 rounded-full">
                <span className="text-xl">🔥</span>
                <span className="text-sm font-bold">{streakDays}</span>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate?.('home')}
              className={currentPage === 'home' ? 'bg-bg-tertiary' : ''}
              icon={<Home size={18} />}
            >
              <span className="hidden sm:inline">Home</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate?.('settings')}
              className={currentPage === 'settings' ? 'bg-bg-tertiary' : ''}
              icon={<Settings size={18} />}
            >
              <span className="hidden sm:inline">Settings</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              icon={settings.darkMode ? <Sun size={18} /> : <Moon size={18} />}
            >
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>

        {/* Mobile stats */}
        <div className="pb-3 md:hidden">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-text-secondary">Level {level}</span>
            <div className="flex-1">
              <ProgressBar progress={progressPercent} />
            </div>
            <span className="text-text-secondary">{Math.round(progressPercent)}%</span>
          </div>
        </div>
      </div>
    </header>
  );
}

