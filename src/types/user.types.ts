export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

export interface UserSettings {
  darkMode: boolean;
  soundEffects: boolean;
  autoAdvance: boolean;
  timerEnabled: boolean;
  hintLevel: 'none' | 'low' | 'medium' | 'high';
}

export interface PracticeTest {
  date: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeMs: number;
  weakAreas: string[];
}

export interface UserStats {
  totalStudyTimeMs: number;
  sessionsCompleted: number;
  averageSessionTimeMs: number;
  favoriteMode: string;
  strongestCategory: string;
  weakestCategory: string;
}

export interface UserProfile {
  level: number;
  xp: number;
  xpToNextLevel: number;
  streakDays: number;
  lastStudyDate: string;
  currentSessionStreak: number;
  bestEverStreak: number;
  totalQuestionsAnswered: number;
  achievements: string[];
  settings: UserSettings;
}

