export function calculateXpForLevel(level: number): number {
  // Exponential curve: Level 1 = 100 XP, increases by 15% each level
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export function calculateLevelFromXp(xp: number): { level: number; currentLevelXp: number; xpToNextLevel: number } {
  let level = 1;
  let totalXpForCurrentLevel = 0;
  let totalXpForNextLevel = calculateXpForLevel(1);

  while (xp >= totalXpForNextLevel) {
    level++;
    totalXpForCurrentLevel = totalXpForNextLevel;
    totalXpForNextLevel += calculateXpForLevel(level);
  }

  return {
    level,
    currentLevelXp: xp - totalXpForCurrentLevel,
    xpToNextLevel: totalXpForNextLevel - totalXpForCurrentLevel
  };
}

export function calculateXpReward(
  isCorrect: boolean,
  streak: number,
  responseTimeMs: number
): number {
  if (!isCorrect) return 0;

  let xp = 10; // Base XP for correct answer

  // Streak bonus (starts at 3+ in a row)
  if (streak >= 3) {
    xp += 5;
  }
  if (streak >= 5) {
    xp += 5; // Total +10 at 5 streak
  }
  if (streak >= 10) {
    xp += 10; // Total +20 at 10 streak
  }

  // Speed bonus (under 5 seconds)
  if (responseTimeMs < 5000) {
    xp += 2;
  }

  return xp;
}

export function calculateSessionXp(
  correctAnswers: number,
  totalQuestions: number,
  mode: string
): number {
  const baseSessionXp = 50;
  const accuracyBonus = Math.floor((correctAnswers / totalQuestions) * 30);
  
  // Mode multipliers
  const modeMultipliers: Record<string, number> = {
    'quick-fire': 1,
    'flashcard': 0.8,
    'fill-blank': 1.2,
    'multiple-choice': 0.7,
    'practice-test': 2,
    'speedrun': 1.5
  };

  const multiplier = modeMultipliers[mode] || 1;
  
  return Math.floor((baseSessionXp + accuracyBonus) * multiplier);
}

