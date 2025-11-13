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

interface FillBlankProps {
  questionsPerRound?: number;
  categoryFilter?: string;
  onComplete?: () => void;
}

export function FillBlank({
  questionsPerRound,
  categoryFilter,
  onComplete
}: FillBlankProps) {
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

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex]);

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

  // Create fill-in-the-blank text by replacing answer with blank
  const getBlankText = () => {
    if (!currentQuestion) return '';
    const text = currentQuestion.component.underline_text;
    // Replace ___ or the answer with a visible blank
    return text.replace(/___/g, '____________');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userAnswer.trim() || !currentQuestion) return;

    const timeMs = Date.now() - questionStartTime;
    const validation = validateAnswer(
      userAnswer,
      currentQuestion.component.answer,
      currentQuestion.component.alternatives || []
    );

    setIsCorrect(validation.isCorrect);
    setShowFeedback(true);

    if (validation.isCorrect) {
      setSessionScore(prev => prev + 1);
      incrementStreak();
      
      const xpGained = calculateXpReward(true, user.currentSessionStreak, timeMs);
      setLastXpGained(xpGained);
      addXp(xpGained);
    } else {
      resetSessionStreak();
      setLastXpGained(0);
    }

    recordAnswer(currentQuestion.id, '0', validation.isCorrect, timeMs);
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
      addXp(50);
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
        className="max-w-2xl mx-auto"
      >
        <Card className="text-center">
          <h2 className="text-3xl font-bold mb-4">Exercise Complete! 📝</h2>
          <div className="text-6xl mb-6">
            {sessionScore === questions.length ? '💯' : sessionScore >= questions.length * 0.8 ? '⭐' : '📚'}
          </div>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div>
              <p className="text-text-secondary text-sm">Score</p>
              <p className="text-3xl font-bold text-accent-gold">
                {sessionScore}/{questions.length}
              </p>
            </div>
            <div>
              <p className="text-text-secondary text-sm">Accuracy</p>
              <p className="text-3xl font-bold text-correct">
                {Math.round((sessionScore / questions.length) * 100)}%
              </p>
            </div>
            <div>
              <p className="text-text-secondary text-sm">Time</p>
              <p className="text-3xl font-bold text-info">
                {Math.round((Date.now() - startTime) / 1000)}s
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="primary" onClick={() => window.location.reload()}>
              Practice Again
            </Button>
            <Button variant="secondary" onClick={onComplete}>
              Back to Home
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-text-secondary">
            Question {currentIndex + 1}/{questions.length}
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

      <ProgressBar progress={progress} className="mb-8" />

      <motion.div
        key={currentIndex}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <Card>
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-accent-gold mb-1">
              {currentQuestion.itemName}
            </h3>
            <p className="text-text-secondary text-sm">{currentQuestion.category}</p>
          </div>

          <div className="mb-6 p-6 bg-bg-tertiary rounded-lg">
            <p className="text-xl text-text-primary leading-relaxed text-center font-mono">
              {getBlankText()}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-text-secondary text-sm">
              <span>Fill in:</span>
              <div className="flex gap-2">
                {currentQuestion.component.answer.split(' ').map((_, i) => (
                  <div key={i} className="h-1 bg-accent-gold/30 rounded" style={{ width: '50px' }} />
                ))}
              </div>
              <span className="text-accent-gold">({currentQuestion.component.answer.split(' ').length} words)</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder={`Fill in the blank (${currentQuestion.component.answer.split(' ').length} words)...`}
              className="w-full bg-bg-tertiary text-text-primary rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-accent-gold text-center text-lg"
              autoComplete="off"
            />
          </form>

          {currentQuestion.component.hint && (
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleHint}
                icon={<Lightbulb size={16} />}
              >
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </Button>
              {showHint && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-2 p-3 bg-info/10 border border-info/30 rounded-lg"
                >
                  <p className="text-sm text-info">💡 {currentQuestion.component.hint}</p>
                </motion.div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={handleSkip}
              icon={<SkipForward size={18} />}
              className="flex-1"
            >
              Skip
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={!userAnswer.trim()}
              icon={<Send size={18} />}
              className="flex-1"
            >
              Submit
            </Button>
          </div>
        </Card>
      </motion.div>

      {showFeedback && (
        <AnswerFeedback
          isCorrect={isCorrect}
          userAnswer={userAnswer}
          correctAnswer={currentQuestion.component.answer}
          xpGained={lastXpGained}
          streak={user.currentSessionStreak}
          onContinue={handleContinue}
          autoAdvance={user.settings.autoAdvance}
        />
      )}
    </div>
  );
}

