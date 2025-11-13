import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, EyeOff, Award, Shuffle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { useStore } from '../../store/useStore';
import { useMenuData } from '../../hooks/useMenuData';
import { validateAnswer } from '../../utils/answerValidation';
import type { QuestionItem } from '../../types/menu.types';

interface TestModeProps {
  categoryFilter?: string;
  onComplete?: () => void;
}

export function TestMode({ categoryFilter, onComplete }: TestModeProps) {
  const { questions: allQuestions, categories } = useMenuData();
  const { user, addXp, checkDailyStreak, incrementStreak, resetSessionStreak, recordAnswer } = useStore();
  
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [sessionScore, setSessionScore] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFilter || 'All');
  const [isShuffled, setIsShuffled] = useState(true);

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Render a single blank input field
  const renderSingleBlank = (blankInfo: any, idx: number, isLast: boolean) => {
    const blankId = `${currentQuestion.id}_${idx}`;
    const userValue = answers[blankId] || '';
    const word = blankInfo.answer;
    
    const validation = validateAnswer(
      userValue,
      word,
      blankInfo.alternatives || []
    );

    const isCorrect = validation.isCorrect;
    const inputWidth = Math.max(word.length + 2, 8);

    return (
      <input
        key={blankId}
        ref={el => { inputRefs.current[blankId] = el; }}
        type="text"
        value={userValue}
        onChange={(e) => {
          setAnswers({
            ...answers,
            [blankId]: e.target.value
          });
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (isLast) {
              handleCheckAnswers();
            } else {
              // Focus next blank
              const nextBlankId = `${currentQuestion.id}_${idx + 1}`;
              inputRefs.current[nextBlankId]?.focus();
            }
          }
        }}
        className={`inline-block mx-0.5 sm:mx-1 px-1.5 sm:px-2 py-1 sm:py-1.5 text-center text-sm sm:text-base font-medium transition-all
          ${showAnswers ? 'bg-correct/10 border-correct text-correct' : 'bg-bg-tertiary'}
          ${!showAnswers && userValue && isCorrect ? 'border-correct bg-correct/10' : ''}
          ${!showAnswers && userValue && !isCorrect ? 'border-incorrect bg-incorrect/10' : ''}
          border-b-2 focus:outline-none focus:ring-2 focus:ring-accent-gold rounded-sm touch-manipulation`}
        style={{ width: `min(${inputWidth}ch, 90vw)`, minWidth: '60px' }}
        placeholder={showAnswers ? word : '_'.repeat(Math.min(word.length, 12))}
        disabled={showAnswers}
        autoComplete="off"
      />
    );
  };

  // Import and add the XP calculator
  const calculateXpReward = (isCorrect: boolean, streak: number, timeMs: number) => {
    const baseXp = isCorrect ? 10 : 5;
    const streakBonus = streak * 2;
    const timeBonus = timeMs < 5000 ? 5 : 0;
    return baseXp + streakBonus + timeBonus;
  };

  // Generate contextual hints based on the question
  const getContextHint = (question: QuestionItem): string => {
    const context = question.component.underline_text.toLowerCase();
    const category = question.category.toLowerCase();
    const itemName = question.itemName.toLowerCase();
    
    // Check for specific patterns FIRST (most specific to least specific)
    
    // Plating/Serving
    if (context.includes('plate') || context.includes('plated') || context.includes('served on')) {
      return "How is it served/plated?";
    }
    
    // Size/Portion
    if (context.includes('oz') || context.includes('ounce')) {
      return "How many ounces?";
    }
    if (context.includes('pieces') || context.includes('piece')) {
      return "How many pieces?";
    }
    if (context.includes('size')) {
      return "What size/portion?";
    }
    
    // Toppings/Garnishes
    if (context.includes('topped with') || context.includes('topped')) {
      return "What is it topped with?";
    }
    if (context.includes('garnished') || context.includes('garnish')) {
      return "What garnish?";
    }
    if (context.includes('finished with') || context.includes('finished')) {
      return "What's the finishing touch?";
    }
    
    // Sauces/Drizzles
    if (context.includes('drizzled') || context.includes('drizzle')) {
      return "What sauce is drizzled?";
    }
    if (context.includes('sauce') && !context.includes('soy')) {
      return "What sauce?";
    }
    
    // Ingredients/Components
    if (context.includes('layered with') || context.includes('layered')) {
      return "What ingredients are layered?";
    }
    if (context.includes('mixed with') || context.includes('mixed')) {
      return "What's mixed in?";
    }
    if (context.includes('made with') || context.includes('consists of')) {
      return "What ingredients?";
    }
    
    // Fish/Protein types
    if (context.includes('tuna') || context.includes('salmon') || context.includes('fish')) {
      return "What type/grade of fish?";
    }
    if (context.includes('shrimp') || context.includes('crab')) {
      return "What type/grade of seafood?";
    }
    
    // Cheese
    if (context.includes('cheese')) {
      return "What type of cheese?";
    }
    
    // Category-specific fallbacks
    if (category.includes('salad')) {
      if (context.includes('dressing') || context.includes('dressed')) {
        return "What dressing?";
      }
      if (context.includes('lettuce') || context.includes('greens')) {
        return "What type of greens?";
      }
      return "What ingredients are in this salad?";
    }
    
    if (category.includes('soup')) {
      if (context.includes('contains') || context.includes('flour')) {
        return "What allergens/ingredients?";
      }
      if (context.includes('served with') || context.includes('comes with')) {
        return "What comes with it?";
      }
      return "What's in this soup?";
    }
    
    if (category.includes('sushi')) {
      return "What ingredient(s)?";
    }
    
    if (category.includes('dressing') || category.includes('sauce')) {
      if (context.includes('base')) {
        return "What's the base?";
      }
      return "What ingredients?";
    }
    
    // Final fallback
    return "Fill in the blank(s)";
  };

  // Initialize questions based on category filter and shuffle
  useEffect(() => {
    const filtered = selectedCategory !== 'All'
      ? allQuestions.filter(q => q.category === selectedCategory)
      : allQuestions;
    
    const ordered = isShuffled 
      ? [...filtered].sort(() => Math.random() - 0.5)
      : [...filtered];
    
    setQuestions(ordered);
    setCurrentIndex(0);
    setAnswers({});
    setShowAnswers(false);
    setCompleted(false);
    setSessionScore(0);
    checkDailyStreak();
  }, [allQuestions, selectedCategory, isShuffled, checkDailyStreak]);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  // Generate blank input for each word in the answer
  const renderLineWithBlanks = () => {
    if (!currentQuestion) return null;

    const context = currentQuestion.component.underline_text;
    const individualBlanks = currentQuestion.component.individual_blanks || [];
    
    if (individualBlanks.length === 0) {
      return <p className="text-xl leading-relaxed text-text-primary">{context}</p>;
    }

    // Split context by ___ to get text parts and blank positions
    const textParts = context.split('___');
    
    return (
      <p className="text-base sm:text-xl leading-relaxed flex flex-wrap items-center gap-1">
        {textParts.map((part, partIdx) => (
          <span key={`part-${partIdx}`} className="inline-flex items-center flex-wrap">
            <span className="break-words">{part}</span>
            {partIdx < individualBlanks.length && renderSingleBlank(
              individualBlanks[partIdx], 
              partIdx,
              partIdx === individualBlanks.length - 1
            )}
          </span>
        ))}
      </p>
    );
  };

  const handleCheckAnswers = () => {
    if (!currentQuestion) return;
    
    const individualBlanks = currentQuestion.component.individual_blanks || [];
    let correctBlanks = 0;

    individualBlanks.forEach((blank, idx) => {
      const blankId = `${currentQuestion.id}_${idx}`;
      const userAnswer = answers[blankId] || '';
      const validation = validateAnswer(userAnswer, blank.answer, blank.alternatives || []);
      if (validation.isCorrect) {
        correctBlanks++;
      }
    });

    const isAllCorrect = correctBlanks === individualBlanks.length;
    setShowAnswers(true);

    const timeMs = Date.now() - startTime;
    recordAnswer(currentQuestion.id, '0', isAllCorrect, timeMs);

    if (isAllCorrect) {
      setSessionScore(prev => prev + 1);
      incrementStreak();
      addXp(calculateXpReward(true, user.currentSessionStreak, timeMs));
    } else {
      resetSessionStreak();
      addXp(calculateXpReward(false, user.currentSessionStreak, timeMs));
    }
  };

  const handleNextItem = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setAnswers({});
      setShowAnswers(false);
    } else {
      setCompleted(true);
      onComplete?.();
    }
  };

  const handlePreviousItem = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setAnswers({});
      setShowAnswers(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Loading test...</p>
      </div>
    );
  }

  if (completed) {
    const accuracy = questions.length > 0 ? (sessionScore / questions.length) * 100 : 0;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center py-12"
      >
        <Card>
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-accent-gold/20 flex items-center justify-center">
              <Award className="text-accent-gold" size={48} />
            </div>
            <h2 className="text-3xl font-bold mb-2">Test Complete! 🎉</h2>
            <p className="text-text-secondary">You've completed the full menu test!</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-text-secondary text-sm">Items Reviewed</p>
              <p className="text-3xl font-bold text-accent-gold">{questions.length}</p>
            </div>
            <div>
              <p className="text-text-secondary text-sm">Accuracy</p>
              <p className="text-3xl font-bold text-correct">{accuracy}%</p>
            </div>
          </div>
          
          <div className="flex gap-3 justify-center">
            <Button variant="primary" onClick={() => window.location.reload()}>
              Retake Test
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
    <div className="max-w-4xl mx-auto px-3 sm:px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold mb-1 truncate">📝 Menu Practice Test</h1>
          <p className="text-text-secondary text-xs sm:text-sm hidden sm:block">
            Fill in the blanks - type each underlined word
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs sm:text-sm text-text-secondary mb-0.5">Progress</p>
          <p className="text-base sm:text-lg font-bold whitespace-nowrap">
            {currentIndex + 1}/{questions.length}
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <Card className="mb-4 sm:mb-6 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-xs sm:text-sm text-text-secondary mb-1.5 sm:mb-2">
              Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-bg-tertiary text-text-primary rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-accent-gold border border-bg-tertiary hover:border-accent-gold/50 transition-colors"
            >
              <option value="All">All Categories ({allQuestions.length} questions)</option>
              {categories.map((cat) => {
                const count = allQuestions.filter(q => q.category === cat).length;
                return (
                  <option key={cat} value={cat}>
                    {cat} ({count} questions)
                  </option>
                );
              })}
            </select>
          </div>
          
          <div className="flex items-end gap-2">
            <Button
              variant={isShuffled ? "primary" : "secondary"}
              size="sm"
              onClick={() => setIsShuffled(!isShuffled)}
              icon={<Shuffle size={16} />}
              className="whitespace-nowrap text-xs sm:text-sm"
            >
              {isShuffled ? 'Shuffled' : 'In Order'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Progress bar */}
      <ProgressBar progress={progress} className="mb-4 sm:mb-8" />

      {/* Test Item */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="mb-4 sm:mb-6 p-4 sm:p-6">
            {/* Item Header */}
            <div className="border-b border-bg-tertiary pb-3 sm:pb-4 mb-4 sm:mb-6">
              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-2xl font-bold text-accent-gold mb-2 break-words">
                    {currentQuestion.itemName}
                  </h2>
                  <Badge variant="info">{currentQuestion.category}</Badge>
                </div>
                {showAnswers && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs sm:text-sm text-text-secondary">Score</p>
                    <p className="text-lg sm:text-2xl font-bold text-accent-gold whitespace-nowrap">
                      {sessionScore}/{currentIndex + 1}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Test Line */}
            <div className="mb-4 sm:mb-6">
              <div className="bg-bg-tertiary/30 rounded-lg p-4 sm:p-6 border-l-4 border-accent-gold">
                {renderLineWithBlanks()}
              </div>

              {/* Hints */}
              {!showAnswers && (
                <div className="mt-4 space-y-2">
                  {currentQuestion.component.hint && (
                    <div className="flex items-start gap-2 text-sm text-info bg-info/10 p-3 rounded-lg border border-info/20">
                      <span className="text-lg">💡</span>
                      <p className="font-medium">{currentQuestion.component.hint}</p>
                    </div>
                  )}
                  {getContextHint(currentQuestion) && (
                    <div className="flex items-start gap-2 text-sm text-warning bg-warning/10 p-3 rounded-lg border border-warning/20">
                      <span className="text-lg">🎯</span>
                      <p className="font-medium">{getContextHint(currentQuestion)}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Show Answer Feedback */}
              {showAnswers && currentQuestion.component.individual_blanks && (
                <div className="mt-4 p-4 bg-correct/10 border border-correct/30 rounded-lg">
                  <p className="text-sm font-semibold text-correct mb-2">✓ Correct Answers:</p>
                  {currentQuestion.component.individual_blanks.map((blank, idx) => (
                    <div key={idx} className="mb-2">
                      <span className="font-bold text-accent-gold">{blank.answer}</span>
                      {blank.alternatives && blank.alternatives.length > 0 && (
                        <span className="text-sm text-text-secondary ml-2">
                          (also: {blank.alternatives.join(', ')})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">
              <Button
                variant="secondary"
                onClick={handlePreviousItem}
                disabled={currentIndex === 0}
                icon={<ChevronLeft size={18} />}
                className="text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </Button>

              {!showAnswers ? (
                <Button
                  variant="primary"
                  onClick={handleCheckAnswers}
                  className="text-sm sm:text-base order-first sm:order-none"
                >
                  Check Answers
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => setShowAnswers(false)}
                  icon={<EyeOff size={18} />}
                  className="text-sm sm:text-base order-first sm:order-none"
                >
                  Hide Answers
                </Button>
              )}

              <Button
                variant="primary"
                onClick={handleNextItem}
                disabled={!showAnswers && currentIndex < questions.length - 1}
                icon={<ChevronRight size={18} />}
                className="text-sm sm:text-base"
              >
                {currentIndex + 1 >= questions.length ? 'Finish' : 'Next'}
              </Button>
            </div>
          </Card>

          {/* Instructions */}
          <div className="text-center text-xs sm:text-sm text-text-secondary px-2">
            <p className="mb-1 hidden sm:block">💡 <strong>Tip:</strong> Press Enter to move to the next blank</p>
            <p className="hidden sm:block">Multiple blanks? Fill each one separately (e.g., "wonton" then "chip")</p>
            <p className="sm:hidden">💡 Press Enter for next blank</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

