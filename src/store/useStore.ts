import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, UserSettings, PracticeTest, UserStats } from '../types/user.types';
import type { ItemProgress, StudySession } from '../types/study.types';
import { calculateLevelFromXp } from '../utils/xpCalculator';
import { updateItemProgress } from '../utils/spacedRepetition';
import { format, isToday, parseISO } from 'date-fns';

interface AppState {
  // User data
  user: UserProfile;
  itemsProgress: Record<string, ItemProgress>;
  practiceTests: PracticeTest[];
  stats: UserStats;

  // Current session
  currentSession: StudySession | null;

  // Actions
  addXp: (amount: number) => void;
  incrementStreak: () => void;
  resetSessionStreak: () => void;
  recordAnswer: (itemId: string, componentId: string, isCorrect: boolean, timeMs: number) => void;
  startSession: (session: StudySession) => void;
  endSession: () => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  unlockAchievement: (achievementId: string) => void;
  savePracticeTest: (test: PracticeTest) => void;
  resetProgress: () => void;
  checkDailyStreak: () => void;
}

const DEFAULT_USER: UserProfile = {
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  streakDays: 0,
  lastStudyDate: '',
  currentSessionStreak: 0,
  bestEverStreak: 0,
  totalQuestionsAnswered: 0,
  achievements: [],
  settings: {
    darkMode: true,
    soundEffects: false,
    autoAdvance: true,
    timerEnabled: false,
    hintLevel: 'medium'
  }
};

const DEFAULT_STATS: UserStats = {
  totalStudyTimeMs: 0,
  sessionsCompleted: 0,
  averageSessionTimeMs: 0,
  favoriteMode: 'quick-fire',
  strongestCategory: '',
  weakestCategory: ''
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: DEFAULT_USER,
      itemsProgress: {},
      practiceTests: [],
      stats: DEFAULT_STATS,
      currentSession: null,

      addXp: (amount: number) => {
        set((state) => {
          const newXp = state.user.xp + amount;
          const levelInfo = calculateLevelFromXp(newXp);
          
          return {
            user: {
              ...state.user,
              xp: newXp,
              level: levelInfo.level,
              xpToNextLevel: levelInfo.xpToNextLevel
            }
          };
        });
      },

      incrementStreak: () => {
        set((state) => {
          const newStreak = state.user.currentSessionStreak + 1;
          const newBest = Math.max(newStreak, state.user.bestEverStreak);
          
          return {
            user: {
              ...state.user,
              currentSessionStreak: newStreak,
              bestEverStreak: newBest
            }
          };
        });
      },

      resetSessionStreak: () => {
        set((state) => ({
          user: {
            ...state.user,
            currentSessionStreak: 0
          }
        }));
      },

      recordAnswer: (itemId: string, componentId: string, isCorrect: boolean, timeMs: number) => {
        set((state) => {
          const currentProgress = state.itemsProgress[itemId];
          const updatedProgress = updateItemProgress(currentProgress, componentId, isCorrect, timeMs);

          return {
            itemsProgress: {
              ...state.itemsProgress,
              [itemId]: updatedProgress
            },
            user: {
              ...state.user,
              totalQuestionsAnswered: state.user.totalQuestionsAnswered + 1
            }
          };
        });
      },

      startSession: (session: StudySession) => {
        set({ currentSession: session });
      },

      endSession: () => {
        const session = get().currentSession;
        if (!session) return;

        const endTime = Date.now();
        const sessionDuration = endTime - session.startTime;

        set((state) => ({
          currentSession: null,
          user: {
            ...state.user,
            lastStudyDate: format(new Date(), 'yyyy-MM-dd')
          },
          stats: {
            ...state.stats,
            totalStudyTimeMs: state.stats.totalStudyTimeMs + sessionDuration,
            sessionsCompleted: state.stats.sessionsCompleted + 1,
            averageSessionTimeMs: Math.floor(
              (state.stats.totalStudyTimeMs + sessionDuration) / (state.stats.sessionsCompleted + 1)
            )
          }
        }));
      },

      updateSettings: (settings: Partial<UserSettings>) => {
        set((state) => ({
          user: {
            ...state.user,
            settings: {
              ...state.user.settings,
              ...settings
            }
          }
        }));
      },

      unlockAchievement: (achievementId: string) => {
        set((state) => {
          if (state.user.achievements.includes(achievementId)) {
            return state;
          }

          return {
            user: {
              ...state.user,
              achievements: [...state.user.achievements, achievementId]
            }
          };
        });
      },

      savePracticeTest: (test: PracticeTest) => {
        set((state) => ({
          practiceTests: [...state.practiceTests, test]
        }));
      },

      resetProgress: () => {
        set({
          user: DEFAULT_USER,
          itemsProgress: {},
          practiceTests: [],
          stats: DEFAULT_STATS,
          currentSession: null
        });
      },

      checkDailyStreak: () => {
        set((state) => {
          const today = format(new Date(), 'yyyy-MM-dd');
          const lastStudy = state.user.lastStudyDate;

          if (!lastStudy) {
            // First time studying
            return {
              user: {
                ...state.user,
                streakDays: 1,
                lastStudyDate: today
              }
            };
          }

          const lastStudyDate = parseISO(lastStudy);
          const todayDate = new Date();

          // Check if already studied today
          if (isToday(lastStudyDate)) {
            return state;
          }

          // Check if studied yesterday (continue streak)
          const yesterday = new Date(todayDate);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = format(yesterday, 'yyyy-MM-dd');

          if (lastStudy === yesterdayStr) {
            return {
              user: {
                ...state.user,
                streakDays: state.user.streakDays + 1,
                lastStudyDate: today
              }
            };
          }

          // Streak broken - reset to 1
          return {
            user: {
              ...state.user,
              streakDays: 1,
              lastStudyDate: today
            }
          };
        });
      }
    }),
    {
      name: 'mastros-menu-app-storage',
      version: 1
    }
  )
);

