import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, SkipForward, Send, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import { AnswerFeedback } from '../shared/AnswerFeedback';
import { useStore } from '../../store/useStore';
import { validateAnswer } from '../../utils/answerValidation';
import { calculateXpReward } from '../../utils/xpCalculator';
import customerQuestionsData from '../../data/customerQuestions.json';

interface CustomerQuestion {
  item: string;
  question: string;
  answer: string;
  category: string;
  alternatives: string[];
}

interface CustomerQuestionsProps {
  questionsPerRound?: number;
  categoryFilter?: string;
  onComplete?: () => void;
}

export function CustomerQuestions({
  questionsPerRound,
  categoryFilter,
  onComplete
}: CustomerQuestionsProps) {
  const { user, addXp, incrementStreak, resetSessionStreak, checkDailyStreak } = useStore();
  
  const [questions, setQuestions] = useState<CustomerQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [completed, setCompleted] = useState(false);
  const [lastXpGained, setLastXpGained] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize questions
  useEffect(() => {
    const allQuestions = (customerQuestionsData as any).customer_questions || [];
    const filtered = categoryFilter
      ? allQuestions.filter((q: CustomerQuestion) => q.category === categoryFilter)
      : allQuestions;
    
    // Use ALL questions, shuffled
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setQuestions(questionsPerRound ? shuffled.slice(0, questionsPerRound) : shuffled);
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
    checkDailyStreak();
  }, [questionsPerRound, categoryFilter, checkDailyStreak]);

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
    const validation = validateAnswer(
      userAnswer,
      currentQuestion.answer,
      currentQuestion.alternatives || []
    );

    setIsCorrect(validation.isCorrect);
    setCorrectAnswer(currentQuestion.answer);
    setShowFeedback(true);

    if (validation.isCorrect) {
      setSessionScore(prev => prev + 1);
      incrementStreak();
      
      const xpGained = calculateXpReward(true, user.currentSessionStreak, timeMs);
      setLastXpGained(xpGained);
      addXp(xpGained);
    } else {
      resetSessionStreak();
    }
  };

  const handleContinue = () => {
    if (currentIndex + 1 >= questions.length) {
      setCompleted(true);
      // Completion bonus
      addXp(50);
      return;
    }

    setCurrentIndex(prev => prev + 1);
    setUserAnswer('');
    setShowFeedback(false);
    setIsCorrect(false);
    setQuestionStartTime(Date.now());
    inputRef.current?.focus();
  };

  const handleSkip = () => {
    resetSessionStreak();
    handleContinue();
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Loading customer questions...</p>
      </div>
    );
  }

  if (completed) {
    const accuracy = questions.length > 0 ? (sessionScore / questions.length) * 100 : 0;
    const totalTime = Date.now() - startTime;
    const avgTime = Math.round(totalTime / questions.length / 1000);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center py-12"
      >
        <Card>
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-accent-gold/20 flex items-center justify-center">
              <Users className="text-accent-gold" size={48} />
            </div>
            <h2 className="text-3xl font-bold mb-2">Customer Service Pro! 🎉</h2>
            <p className="text-text-secondary">You're ready to answer customer questions!</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-text-secondary text-sm">Score</p>
              <p className="text-3xl font-bold text-accent-gold">{sessionScore}/{questions.length}</p>
            </div>
            <div>
              <p className="text-text-secondary text-sm">Accuracy</p>
              <p className="text-3xl font-bold text-correct">{Math.round(accuracy)}%</p>
            </div>
            <div>
              <p className="text-text-secondary text-sm">Avg Time</p>
              <p className="text-3xl font-bold text-info">{avgTime}s</p>
            </div>
          </div>
          
          <div className="flex gap-3 justify-center">
            <Button variant="primary" onClick={() => window.location.reload()}>
              Practice More
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
      {/* Header Stats */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Badge variant="info">
            <Users size={16} className="mr-1" />
            Customer Questions
          </Badge>
          <span className="text-text-secondary text-sm">
            Question {currentIndex + 1}/{questions.length}
          </span>
          {user.currentSessionStreak > 0 && (
            <div className="flex items-center gap-1 text-accent-gold">
              <span className="text-2xl">🔥</span>
              <span className="font-bold text-sm">{user.currentSessionStreak}</span>
            </div>
          )}
        </div>
        <div className="text-text-secondary text-sm">
          Score: {sessionScore}/{currentIndex + 1}
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar progress={progress} className="mb-8" />

      {/* Question Card */}
      <Card className="mb-6">
        <div className="mb-6">
          <Badge variant="default" className="mb-4">
            {currentQuestion.category}
          </Badge>
          <h3 className="text-2xl font-bold text-accent-gold mb-3">
            {currentQuestion.item}
          </h3>
          
          {/* Customer asking question */}
          <div className="flex items-start gap-3 p-4 bg-bg-tertiary/50 rounded-lg border-l-4 border-info">
            <div className="mt-1">
              <MessageCircle className="text-info" size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-info font-semibold mb-1">Customer asks:</p>
              <p className="text-xl text-text-primary font-medium leading-relaxed">
                "{currentQuestion.question}"
              </p>
            </div>
          </div>
        </div>

        {/* Answer input */}
        {!showFeedback ? (
          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Your answer..."
              className="w-full bg-bg-tertiary text-text-primary rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-accent-gold text-lg"
              autoComplete="off"
            />
            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleSkip}
                icon={<SkipForward size={20} />}
                className="flex-shrink-0"
              >
                Skip
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={<Send size={20} />}
                className="flex-1"
                disabled={!userAnswer.trim()}
              >
                Submit Answer
              </Button>
            </div>
          </form>
        ) : (
          <AnswerFeedback
            isCorrect={isCorrect}
            correctAnswer={correctAnswer}
            userAnswer={userAnswer}
            xpGained={lastXpGained}
            onContinue={handleContinue}
          />
        )}
      </Card>

      {/* Tips */}
      {!showFeedback && (
        <div className="text-center text-text-secondary text-sm">
          <p className="mb-2">💡 Tip: Answer as if you're speaking to the customer</p>
          <p className="text-xs">Be concise but complete - they want helpful information!</p>
        </div>
      )}
    </div>
  );
}

