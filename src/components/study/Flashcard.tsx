import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, Check, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import { useStore } from '../../store/useStore';
import { useMenuData } from '../../hooks/useMenuData';
import type { QuestionItem } from '../../types/menu.types';

interface FlashcardProps {
  questionsPerRound?: number;
  categoryFilter?: string;
  onComplete?: () => void;
}

export function Flashcard({
  questionsPerRound,
  categoryFilter,
  onComplete
}: FlashcardProps) {
  const { questions: allQuestions } = useMenuData();
  const { addXp, recordAnswer, checkDailyStreak } = useStore();
  
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [startTime] = useState(Date.now());

  // Initialize questions
  useEffect(() => {
    const filtered = categoryFilter
      ? allQuestions.filter(q => q.category === categoryFilter)
      : allQuestions;
    
    // Use ALL questions, shuffled
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setQuestions(questionsPerRound ? shuffled.slice(0, questionsPerRound) : shuffled);
    checkDailyStreak();
  }, [allQuestions, questionsPerRound, categoryFilter, checkDailyStreak]);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;
  const totalReviewed = knownCount + reviewCount;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleResponse = (known: boolean) => {
    if (!isFlipped) return; // Must flip first to see answer
    
    const timeMs = Date.now() - startTime;
    
    if (known) {
      setKnownCount(prev => prev + 1);
      addXp(8);
      recordAnswer(currentQuestion.id, '0', true, timeMs);
    } else {
      setReviewCount(prev => prev + 1);
      recordAnswer(currentQuestion.id, '0', false, timeMs);
    }

    // Move to next card
    if (currentIndex + 1 >= questions.length) {
      setSessionComplete(true);
      // Award completion bonus
      addXp(40);
    } else {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!isFlipped) {
          handleFlip();
        }
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        if (isFlipped) {
          handleResponse(true);
        } else {
          handleNext();
        }
      } else if (e.key === '1' && isFlipped) {
        handleResponse(true);
      } else if (e.key === '2' && isFlipped) {
        handleResponse(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped, currentIndex, questions.length]);

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Loading flashcards...</p>
      </div>
    );
  }

  if (sessionComplete) {
    const accuracy = totalReviewed > 0 ? (knownCount / totalReviewed) * 100 : 0;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="text-center">
          <h2 className="text-3xl font-bold mb-4">Session Complete! 🎉</h2>
          <div className="text-6xl mb-6">
            {accuracy >= 80 ? '🌟' : accuracy >= 60 ? '👍' : '📚'}
          </div>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div>
              <p className="text-text-secondary text-sm">Known</p>
              <p className="text-3xl font-bold text-correct">{knownCount}</p>
            </div>
            <div>
              <p className="text-text-secondary text-sm">Need Review</p>
              <p className="text-3xl font-bold text-warning">{reviewCount}</p>
            </div>
            <div>
              <p className="text-text-secondary text-sm">Accuracy</p>
              <p className="text-3xl font-bold text-info">{Math.round(accuracy)}%</p>
            </div>
          </div>
          <p className="text-text-secondary mb-6">
            Reviewed {totalReviewed} of {questions.length} cards
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="primary" onClick={() => window.location.reload()}>
              Study Again
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
    <div className="max-w-4xl mx-auto">
      {/* Header Stats */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-text-secondary">
            Card {currentIndex + 1}/{questions.length}
          </span>
          <Badge variant="success">{knownCount} Known</Badge>
          <Badge variant="warning">{reviewCount} Review</Badge>
        </div>
        <div className="text-text-secondary text-sm">
          Space/Enter to flip • Arrow keys to navigate
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar progress={progress} className="mb-8" />

      {/* Flashcard */}
      <div className="perspective-1000 mb-8" style={{ perspective: '1000px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ rotateY: 0, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative min-h-[400px] cursor-pointer"
              onClick={handleFlip}
            >
              {/* Front of card */}
              <div
                className={`absolute inset-0 backface-hidden ${isFlipped ? 'invisible' : 'visible'}`}
                style={{ backfaceVisibility: 'hidden' }}
              >
                <Card className="h-full flex flex-col items-center justify-center p-12 bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-accent-gold/30">
                  <Badge variant="info" className="mb-4">
                    {currentQuestion.category}
                  </Badge>
                  <h3 className="text-2xl font-bold text-accent-gold mb-6 text-center">
                    {currentQuestion.itemName}
                  </h3>
                  <div className="mb-8 w-full max-w-2xl">
                    <p className="text-xl text-text-primary text-center leading-relaxed mb-4">
                      {currentQuestion.component.underline_text}
                    </p>
                    
                    {/* Visual blank indicators */}
                    <div className="flex flex-col items-center gap-2 mt-6">
                      <div className="flex items-center gap-2">
                        <span className="text-text-secondary text-sm">Fill in the blank:</span>
                        <div className="flex gap-2">
                          {currentQuestion.component.answer.split(' ').slice(0, 8).map((_, i) => (
                            <div key={i} className="h-1.5 bg-accent-gold/40 rounded" style={{ width: '45px' }} />
                          ))}
                          {currentQuestion.component.answer.split(' ').length > 8 && (
                            <span className="text-text-secondary text-sm">...</span>
                          )}
                        </div>
                      </div>
                      <span className="text-accent-gold text-sm font-medium">
                        ({currentQuestion.component.answer.split(' ').length} words)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <RotateCcw size={16} className="animate-spin-slow" />
                    <span>Click or press Space to reveal answer</span>
                  </div>
                </Card>
              </div>

              {/* Back of card */}
              <div
                className={`absolute inset-0 backface-hidden ${!isFlipped ? 'invisible' : 'visible'}`}
                style={{ 
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                <Card className="h-full flex flex-col items-center justify-center p-12 bg-gradient-to-br from-correct/10 to-bg-secondary border-2 border-correct/30">
                  <Badge variant="success" className="mb-4">
                    Answer
                  </Badge>
                  <h3 className="text-xl font-bold text-text-secondary mb-4 text-center">
                    {currentQuestion.itemName}
                  </h3>
                  
                  {/* Show the question context again */}
                  <p className="text-base text-text-secondary mb-4 text-center italic max-w-2xl">
                    "{currentQuestion.component.underline_text}"
                  </p>
                  
                  <div className="bg-bg-tertiary/50 rounded-xl p-8 mb-4 border-2 border-accent-gold/30">
                    <p className="text-4xl font-bold text-accent-gold text-center leading-relaxed">
                      {currentQuestion.component.answer}
                    </p>
                  </div>
                  
                  {currentQuestion.component.alternatives && currentQuestion.component.alternatives.length > 0 && (
                    <div className="mt-4 text-center p-4 bg-info/10 rounded-lg border border-info/20 max-w-2xl">
                      <p className="text-xs text-info font-semibold mb-2">💡 Also acceptable:</p>
                      <p className="text-sm text-text-primary">
                        {currentQuestion.component.alternatives.join(' • ')}
                      </p>
                    </div>
                  )}
                  
                  {currentQuestion.component.hint && (
                    <div className="mt-4 text-center p-3 bg-warning/10 rounded-lg border border-warning/20 max-w-2xl">
                      <p className="text-xs text-warning font-semibold mb-1">💭 Memory Tip:</p>
                      <p className="text-sm text-text-primary">
                        {currentQuestion.component.hint}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-8 text-text-secondary text-sm font-medium">
                    Did you know it?
                  </div>
                </Card>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="secondary"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          icon={<ChevronLeft size={20} />}
        >
          Previous
        </Button>

        {isFlipped ? (
          <div className="flex gap-3">
            <Button
              variant="danger"
              onClick={() => handleResponse(false)}
              icon={<X size={20} />}
              className="flex-1"
            >
              Need Review (2)
            </Button>
            <Button
              variant="success"
              onClick={() => handleResponse(true)}
              icon={<Check size={20} />}
              className="flex-1"
            >
              Got It! (1)
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            onClick={handleFlip}
            icon={<RotateCcw size={20} />}
          >
            Flip Card (Space)
          </Button>
        )}

        <Button
          variant="secondary"
          onClick={handleNext}
          disabled={currentIndex >= questions.length - 1}
          icon={<ChevronRight size={20} />}
        >
          Next
        </Button>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="mt-6 text-center text-text-secondary text-sm">
        <p>💡 Keyboard shortcuts: Space = Flip | 1 = Got it | 2 = Need review | ← → = Navigate</p>
      </div>
    </div>
  );
}

