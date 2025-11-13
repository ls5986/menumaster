import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, SkipForward, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { AnswerFeedback } from '../shared/AnswerFeedback';
import { useStore } from '../../store/useStore';
import { useMenuData } from '../../hooks/useMenuData';
import { validateAnswer } from '../../utils/answerValidation';
import { calculateXpReward } from '../../utils/xpCalculator';
import type { QuestionItem } from '../../types/menu.types';

interface QuickFireProps {
  questionsPerRound?: number;
  categoryFilter?: string;
  onComplete?: () => void;
}

export function QuickFire({
  questionsPerRound,
  categoryFilter,
  onComplete
}: QuickFireProps) {
  const { questions: allQuestions } = useMenuData();
  const { user, addXp, incrementStreak, resetSessionStreak, recordAnswer, checkDailyStreak } = useStore();
  
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [lastXpGained, setLastXpGained] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize questions
  useEffect(() => {
    const filtered = categoryFilter
      ? allQuestions.filter(q => q.category === categoryFilter)
      : allQuestions;
    
    // Use ALL questions, shuffled
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setQuestions(questionsPerRound ? shuffled.slice(0, questionsPerRound) : shuffled);
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
    checkDailyStreak();
  }, [allQuestions, questionsPerRound, categoryFilter, checkDailyStreak]);

  // Focus input when question changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex]);

  // Auto-advance after correct answer
  useEffect(() => {
    if (showFeedback && isCorrect && user.settings.autoAdvance) {
      feedbackTimerRef.current = setTimeout(() => {
        handleContinue();
      }, 2000);
    }
    
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, [showFeedback, isCorrect, user.settings.autoAdvance]);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userAnswer.trim() || !currentQuestion) return;

    const timeMs = Date.now() - questionStartTime;
    
    // For new format with individual_blanks
    const individualBlanks = currentQuestion.component.individual_blanks || [];
    let isAnswerCorrect = false;
    
    if (individualBlanks.length > 0) {
      // Join all blanks as the expected answer
      const expectedAnswer = individualBlanks.map(b => b.answer).join(', ');
      const allAlternatives = individualBlanks.flatMap(b => b.alternatives || []);
      
      const validation = validateAnswer(userAnswer, expectedAnswer, allAlternatives);
      isAnswerCorrect = validation.isCorrect;
    }

    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);

    if (isAnswerCorrect) {
      setSessionScore(prev => prev + 1);
      incrementStreak();
      
      const xpGained = calculateXpReward(true, user.currentSessionStreak, timeMs);
      setLastXpGained(xpGained);
      addXp(xpGained);

      // Check for speed demon achievement (under 5s)
      if (timeMs < 5000) {
        // Could unlock achievement here
      }
    } else {
      resetSessionStreak();
      setLastXpGained(0);
    }

    // Record answer in progress tracking
    recordAnswer(currentQuestion.id, '0', isAnswerCorrect, timeMs);
  };

  const handleSkip = () => {
    resetSessionStreak();
    setIsCorrect(false);
    setShowFeedback(true);
    setLastXpGained(0);
  };

  const handleContinue = () => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }

    setShowFeedback(false);
    setUserAnswer('');
    setShowHint(false);

    if (currentIndex + 1 >= questions.length) {
      setCompleted(true);
      onComplete?.();
    } else {
      setCurrentIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Loading questions...</p>
      </div>
    );
  }

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-4 sm:px-6"
      >
        <Card className="text-center p-4 sm:p-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Round Complete! 🎉</h2>
          <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">
            {sessionScore === questions.length ? '💯' : sessionScore >= questions.length * 0.8 ? '🌟' : '👍'}
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div>
              <p className="text-text-secondary text-xs sm:text-sm">Score</p>
              <p className="text-xl sm:text-3xl font-bold text-accent-gold">
                {sessionScore}/{questions.length}
              </p>
            </div>
            <div>
              <p className="text-text-secondary text-xs sm:text-sm">Accuracy</p>
              <p className="text-xl sm:text-3xl font-bold text-correct">
                {Math.round((sessionScore / questions.length) * 100)}%
              </p>
            </div>
            <div>
              <p className="text-text-secondary text-xs sm:text-sm">Time</p>
              <p className="text-xl sm:text-3xl font-bold text-info">
                {Math.round((Date.now() - startTime) / 1000)}s
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
            <Button variant="primary" onClick={() => window.location.reload()} className="w-full sm:w-auto">
              Play Again
            </Button>
            <Button variant="secondary" onClick={onComplete} className="w-full sm:w-auto">
              Back to Home
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      {/* Header Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-text-secondary text-sm sm:text-base">
            Q {currentIndex + 1}/{questions.length}
          </span>
          {user.currentSessionStreak > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-accent-red/20 rounded-full">
              <span>🔥</span>
              <span className="font-bold text-sm">{user.currentSessionStreak}</span>
            </div>
          )}
        </div>
        <div className="text-text-secondary text-sm">
          Score: {sessionScore}/{currentIndex + 1}
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar progress={progress} className="mb-4 sm:mb-8" />

      {/* Question Card */}
      <motion.div
        key={currentIndex}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <Card className="p-4 sm:p-6">
          {/* Item name */}
          <div className="mb-3 sm:mb-4">
            <h3 className="text-lg sm:text-2xl font-bold text-accent-gold mb-1">
              {currentQuestion.itemName}
            </h3>
            <p className="text-text-secondary text-xs sm:text-sm">{currentQuestion.category}</p>
          </div>

          {/* Question - Full Context */}
          <div className="mb-4 sm:mb-6">
            <div className="bg-bg-tertiary/30 rounded-lg p-3 sm:p-6 border-l-4 border-accent-gold">
              <p className="text-base sm:text-xl text-text-primary leading-relaxed font-medium mb-3 sm:mb-4">
                {currentQuestion.component.underline_text}
              </p>
              {currentQuestion.component.individual_blanks && currentQuestion.component.individual_blanks.length > 0 && (
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <span>Fill in:</span>
                  <div className="flex gap-2">
                    {currentQuestion.component.individual_blanks.slice(0, 8).map((_, i) => (
                      <div key={i} className="h-1.5 bg-accent-gold/40 rounded" style={{ width: '45px' }} />
                    ))}
                    {currentQuestion.component.individual_blanks.length > 8 && (
                      <span className="text-text-secondary">...</span>
                    )}
                  </div>
                  <span className="text-accent-gold font-medium">({currentQuestion.component.individual_blanks.length} blanks)</span>
                </div>
              )}
            </div>
          </div>

          {/* Answer input */}
          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="w-full bg-bg-tertiary text-text-primary rounded-lg px-3 sm:px-4 py-3 sm:py-4 mb-3 sm:mb-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-accent-gold touch-manipulation"
              autoComplete="off"
            />
          </form>

          {/* Hint */}
          {currentQuestion.component.hint && (
            <div className="mb-3 sm:mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleHint}
                icon={<Lightbulb size={16} />}
                className="text-xs sm:text-sm"
              >
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </Button>
              {showHint && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-2 p-2 sm:p-3 bg-info/10 border border-info/30 rounded-lg"
                >
                  <p className="text-xs sm:text-sm text-info">💡 {currentQuestion.component.hint}</p>
                </motion.div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={handleSkip}
              icon={<SkipForward size={16} />}
              className="flex-1 text-sm sm:text-base py-3 sm:py-2"
            >
              Skip
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={!userAnswer.trim()}
              icon={<Send size={16} />}
              className="flex-1 text-sm sm:text-base py-3 sm:py-2"
            >
              Submit
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Answer Feedback Modal */}
      {showFeedback && (
        <AnswerFeedback
          isCorrect={isCorrect}
          userAnswer={userAnswer}
          correctAnswer={
            currentQuestion.component.individual_blanks && currentQuestion.component.individual_blanks.length > 0
              ? currentQuestion.component.individual_blanks.map(b => b.answer).join(', ')
              : 'No answer available'
          }
          xpGained={lastXpGained}
          streak={user.currentSessionStreak}
          onContinue={handleContinue}
          autoAdvance={user.settings.autoAdvance}
        />
      )}
    </div>
  );
}

