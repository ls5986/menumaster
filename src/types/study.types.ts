export type StudyMode = 'quick-fire' | 'flashcard' | 'fill-blank' | 'multiple-choice' | 'practice-test' | 'speedrun';

export type ItemStatus = 'new' | 'learning' | 'confident' | 'mastered';

export interface StudyHistory {
  date: string;
  correct: boolean;
  timeMs: number;
  userAnswer?: string;
}

export interface ComponentProgress {
  attempts: number;
  correct: number;
  lastSeen: string;
  history: StudyHistory[];
}

export interface ItemProgress {
  status: ItemStatus;
  components: Record<string, ComponentProgress>;
  overallAccuracy: number;
  needsReview: boolean;
  bookmarked: boolean;
}

export interface StudySession {
  mode: StudyMode;
  questions: StudyQuestion[];
  currentQuestionIndex: number;
  score: number;
  streak: number;
  startTime: number;
  endTime?: number;
}

export interface StudyQuestion {
  id: string;
  itemName: string;
  category: string;
  underlineText: string;
  answer: string;
  alternatives?: string[];
  hint?: string;
  userAnswer?: string;
  isCorrect?: boolean;
  timeMs?: number;
}

export interface AnswerValidation {
  isCorrect: boolean;
  match?: 'exact' | 'close' | 'partial';
  similarity?: number;
  feedback?: string;
}

