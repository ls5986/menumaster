import type { Achievement } from '../types/user.types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Answer your first question correctly',
    icon: '🎯',
    target: 1
  },
  {
    id: 'hot_streak',
    name: 'Hot Streak',
    description: 'Get 5 correct answers in a row',
    icon: '🔥',
    target: 5
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Answer a question in under 5 seconds',
    icon: '⚡',
    target: 1
  },
  {
    id: 'sushi_master',
    name: 'Sushi Master',
    description: 'Achieve 100% mastery in Sushi category',
    icon: '🍣',
    target: 100
  },
  {
    id: 'salad_expert',
    name: 'Salad Expert',
    description: 'Achieve 100% mastery in Soups & Salads',
    icon: '🥗',
    target: 100
  },
  {
    id: 'sauce_specialist',
    name: 'Sauce Specialist',
    description: 'Achieve 100% mastery in Sauces & Dressings',
    icon: '🧂',
    target: 100
  },
  {
    id: 'menu_master',
    name: 'Menu Master',
    description: 'Achieve 100% mastery across all items',
    icon: '📚',
    target: 100
  },
  {
    id: 'lightning_round',
    name: 'Lightning Round',
    description: 'Complete 20 questions in under 3 minutes',
    icon: '⚡',
    target: 1
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day study streak',
    icon: '🗓️',
    target: 7
  },
  {
    id: 'dedicated',
    name: 'Dedicated Scholar',
    description: 'Maintain a 30-day study streak',
    icon: '📖',
    target: 30
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Score 100% on a practice test',
    icon: '💯',
    target: 100
  },
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'Answer 500 questions total',
    icon: '🎓',
    target: 500
  },
  {
    id: 'legend',
    name: 'Legend',
    description: 'Reach Level 20',
    icon: '🏅',
    target: 20
  },
  {
    id: 'century',
    name: 'Century Club',
    description: 'Complete 100 study sessions',
    icon: '💪',
    target: 100
  },
  {
    id: 'quick_learner',
    name: 'Quick Learner',
    description: 'Master 10 items in a single session',
    icon: '🧠',
    target: 10
  }
];

export function checkAchievement(
  achievementId: string,
  currentProgress: number
): boolean {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement || !achievement.target) return false;
  return currentProgress >= achievement.target;
}

export function getAchievementProgress(
  achievementId: string,
  userStats: any
): number {
  switch (achievementId) {
    case 'first_blood':
      return userStats.totalQuestionsAnswered > 0 ? 1 : 0;
    case 'hot_streak':
      return userStats.bestEverStreak || 0;
    case 'week_warrior':
      return userStats.streakDays || 0;
    case 'dedicated':
      return userStats.streakDays || 0;
    case 'scholar':
      return userStats.totalQuestionsAnswered || 0;
    case 'legend':
      return userStats.level || 0;
    case 'century':
      return userStats.sessionsCompleted || 0;
    default:
      return 0;
  }
}

