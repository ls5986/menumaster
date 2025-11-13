import type { ItemProgress, ItemStatus, StudyHistory } from '../types/study.types';

export function calculateItemDifficulty(history: StudyHistory[]): ItemStatus {
  if (history.length === 0) return 'new';

  const attempts = history.length;
  const correctCount = history.filter(h => h.correct).length;
  const accuracy = correctCount / attempts;

  // Get recent performance (last 5 attempts)
  const recentHistory = history.slice(-5);
  const recentCorrect = recentHistory.filter(h => h.correct).length;
  const recentAccuracy = recentCorrect / recentHistory.length;

  // Mastered: 90%+ accuracy over 3+ attempts and recent performance is good
  if (accuracy >= 0.9 && attempts >= 3 && recentAccuracy >= 0.8) {
    return 'mastered';
  }

  // Confident: 70%+ accuracy over 2+ attempts
  if (accuracy >= 0.7 && attempts >= 2) {
    return 'confident';
  }

  // Learning: Has at least 1 attempt
  if (attempts >= 1) {
    return 'learning';
  }

  return 'new';
}

export function getItemWeight(status: ItemStatus, lastSeenDate?: string): number {
  const baseWeights: Record<ItemStatus, number> = {
    new: 3,
    learning: 4,
    confident: 2,
    mastered: 1
  };

  let weight = baseWeights[status];

  // Boost weight for items not seen recently
  if (lastSeenDate) {
    const daysSinceLastSeen = getDaysSince(lastSeenDate);
    
    if (daysSinceLastSeen >= 7) {
      weight *= 2; // Double weight if not seen in a week
    } else if (daysSinceLastSeen >= 3) {
      weight *= 1.5; // 1.5x weight if not seen in 3 days
    }
  } else {
    weight *= 2; // Never seen, higher priority
  }

  return weight;
}

export function selectNextQuestions(
  availableItems: any[],
  count: number,
  focusCategory?: string
): any[] {
  let items = [...availableItems];

  // Filter by category if specified
  if (focusCategory) {
    items = items.filter(item => item.category === focusCategory);
  }

  // Filter out inactive items
  items = items.filter(item => item.status !== 'inactive');

  if (items.length === 0) return [];

  // Calculate weights for each item
  const weightedItems = items.map(item => {
    // This is simplified - in real implementation, we'd look at component progress
    const status: ItemStatus = 'learning'; // Placeholder
    const weight = getItemWeight(status);
    return { item, weight };
  });

  // Weighted random selection
  const selected: any[] = [];
  const availablePool = [...weightedItems];

  for (let i = 0; i < count && availablePool.length > 0; i++) {
    const totalWeight = availablePool.reduce((sum, { weight }) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (let j = 0; j < availablePool.length; j++) {
      random -= availablePool[j].weight;
      if (random <= 0) {
        selected.push(availablePool[j].item);
        availablePool.splice(j, 1);
        break;
      }
    }
  }

  return selected;
}

export function shouldReviewItem(progress: ItemProgress): boolean {
  const { status, components } = progress;

  // Always review items marked for review
  if (progress.needsReview) return true;

  // Get the least recent component
  const componentProgresses = Object.values(components);
  if (componentProgresses.length === 0) return true;

  const oldestSeen = componentProgresses.reduce((oldest, comp) => {
    if (!oldest || new Date(comp.lastSeen) < new Date(oldest.lastSeen)) {
      return comp;
    }
    return oldest;
  });

  const daysSinceLastSeen = getDaysSince(oldestSeen.lastSeen);

  // Review schedule based on status
  const reviewIntervals: Record<ItemStatus, number> = {
    new: 0,        // Review immediately
    learning: 1,   // Review every day
    confident: 3,  // Review every 3 days
    mastered: 7    // Review every week
  };

  return daysSinceLastSeen >= reviewIntervals[status];
}

function getDaysSince(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function updateItemProgress(
  currentProgress: ItemProgress | undefined,
  componentId: string,
  isCorrect: boolean,
  timeMs: number
): ItemProgress {
  const now = new Date().toISOString();

  // Initialize if doesn't exist
  if (!currentProgress) {
    currentProgress = {
      status: 'new',
      components: {},
      overallAccuracy: 0,
      needsReview: false,
      bookmarked: false
    };
  }

  // Initialize component if doesn't exist
  if (!currentProgress.components[componentId]) {
    currentProgress.components[componentId] = {
      attempts: 0,
      correct: 0,
      lastSeen: now,
      history: []
    };
  }

  const component = currentProgress.components[componentId];

  // Update component progress
  component.attempts += 1;
  if (isCorrect) component.correct += 1;
  component.lastSeen = now;
  component.history.push({
    date: now,
    correct: isCorrect,
    timeMs
  });

  // Keep only last 20 history items
  if (component.history.length > 20) {
    component.history = component.history.slice(-20);
  }

  // Recalculate overall accuracy
  const allComponents = Object.values(currentProgress.components);
  const totalAttempts = allComponents.reduce((sum, c) => sum + c.attempts, 0);
  const totalCorrect = allComponents.reduce((sum, c) => sum + c.correct, 0);
  currentProgress.overallAccuracy = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;

  // Update difficulty status based on worst component
  const worstComponent = allComponents.reduce((worst, comp) => {
    const difficulty = calculateItemDifficulty(comp.history);
    const priorityMap: Record<ItemStatus, number> = { new: 0, learning: 1, confident: 2, mastered: 3 };
    const worstPriority = worst ? priorityMap[calculateItemDifficulty(worst.history)] : -1;
    const currentPriority = priorityMap[difficulty];
    
    return currentPriority < worstPriority ? comp : worst;
  }, null as any);

  if (worstComponent) {
    currentProgress.status = calculateItemDifficulty(worstComponent.history);
  }

  return currentProgress;
}

