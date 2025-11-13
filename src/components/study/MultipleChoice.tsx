import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { useStore } from '../../store/useStore';
import { useMenuData } from '../../hooks/useMenuData';
import { calculateXpReward } from '../../utils/xpCalculator';
import type { QuestionItem } from '../../types/menu.types';

interface MultipleChoiceProps {
  questionsPerRound?: number;
  categoryFilter?: string;
  onComplete?: () => void;
}

export function MultipleChoice({
  questionsPerRound,
  categoryFilter,
  onComplete
}: MultipleChoiceProps) {
  const { questions: allQuestions } = useMenuData();
  const { user, addXp, incrementStreak, resetSessionStreak, recordAnswer, checkDailyStreak } = useStore();
  
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [completed, setCompleted] = useState(false);
  const [choices, setChoices] = useState<string[]>([]);
  const [correctIndex, setCorrectIndex] = useState(0);

  useEffect(() => {
    const filtered = categoryFilter
      ? allQuestions.filter(q => q.category === categoryFilter)
      : allQuestions;
    
    // Use ALL questions, shuffled
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setQuestions(questionsPerRound ? shuffled.slice(0, questionsPerRound) : shuffled);
    setStartTime(Date.now());
    checkDailyStreak();
  }, [allQuestions, questionsPerRound, categoryFilter, checkDailyStreak]);

  // Generate choices when question changes
  useEffect(() => {
    if (!questions[currentIndex]) return;
    
    const currentQ = questions[currentIndex];
    const correctAnswer = currentQ.component.answer;
    
    // Get wrong answers from other questions
    const otherQuestions = allQuestions.filter(q => 
      q.id !== currentQ.id && 
      q.component.answer !== correctAnswer
    );
    
    const wrongAnswers = otherQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(q => q.component.answer);
    
    // Combine and shuffle
    const allChoices = [correctAnswer, ...wrongAnswers];
    const shuffled = allChoices.sort(() => Math.random() - 0.5);
    
    setChoices(shuffled);
    setCorrectIndex(shuffled.indexOf(correctAnswer));
    setSelectedAnswer(null);
    setShowResult(false);
    setQuestionStartTime(Date.now());
  }, [currentIndex, questions, allQuestions]);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleSelectAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null || !currentQuestion) return;

    const timeMs = Date.now() - questionStartTime;
    const correct = selectedAnswer === correctIndex;
    
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setSessionScore(prev => prev + 1);
      incrementStreak();
      
      const xpGained = calculateXpReward(true, user.currentSessionStreak, timeMs);
      addXp(xpGained);
      recordAnswer(currentQuestion.id, '0', true, timeMs);
    } else {
      resetSessionStreak();
      recordAnswer(currentQuestion.id, '0', false, timeMs);
    }
  };

  const handleContinue = () => {
    if (currentIndex + 1 >= questions.length) {
      setCompleted(true);
      addXp(40);
      onComplete?.();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
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
          <h2 className="text-3xl font-bold mb-4">Quiz Complete! 🎯</h2>
          <div className="text-6xl mb-6">
            {sessionScore === questions.length ? '💯' : sessionScore >= questions.length * 0.8 ? '🌟' : '📊'}
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
              Take Quiz Again
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
          {/* Item Header */}
          <div className="border-b border-bg-tertiary pb-4 mb-6">
            <h3 className="text-2xl font-bold text-accent-gold mb-2">
              {currentQuestion.itemName}
            </h3>
            <Badge variant="info">{currentQuestion.category}</Badge>
          </div>

          {/* Question - Full Context */}
          <div className="mb-6">
            <div className="bg-bg-tertiary/30 rounded-lg p-6 border-l-4 border-accent-gold">
              <p className="text-xl text-text-primary leading-relaxed font-medium">
                {currentQuestion.component.underline_text}
              </p>
            </div>
            <p className="text-sm text-text-secondary mt-3 text-center italic">
              Choose the correct answer
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {choices.map((choice, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectChoice = index === correctIndex;
              const showCorrect = showResult && isCorrectChoice;
              const showWrong = showResult && isSelected && !isCorrect;

              return (
                <motion.button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={showResult}
                  whileHover={{ scale: showResult ? 1 : 1.02 }}
                  whileTap={{ scale: showResult ? 1 : 0.98 }}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-center gap-3 ${
                    showCorrect
                      ? 'border-correct bg-correct/10'
                      : showWrong
                      ? 'border-incorrect bg-incorrect/10'
                      : isSelected
                      ? 'border-accent-gold bg-accent-gold/10'
                      : 'border-bg-tertiary bg-bg-tertiary hover:border-accent-gold/50'
                  } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {showCorrect ? (
                    <CheckCircle2 className="text-correct flex-shrink-0" size={24} />
                  ) : showWrong ? (
                    <CheckCircle2 className="text-incorrect flex-shrink-0" size={24} />
                  ) : isSelected ? (
                    <CheckCircle2 className="text-accent-gold flex-shrink-0" size={24} />
                  ) : (
                    <Circle className="text-text-secondary flex-shrink-0" size={24} />
                  )}
                  <span className={`flex-1 ${
                    showCorrect ? 'text-correct font-bold' : 
                    showWrong ? 'text-incorrect' : 
                    'text-text-primary'
                  }`}>
                    {choice}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {!showResult ? (
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className="w-full"
            >
              Submit Answer
            </Button>
          ) : (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${isCorrect ? 'bg-correct/10 border border-correct/30' : 'bg-incorrect/10 border border-incorrect/30'}`}>
                <p className={`font-bold mb-2 ${isCorrect ? 'text-correct' : 'text-incorrect'}`}>
                  {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
                </p>
                {!isCorrect && (
                  <p className="text-text-secondary text-sm">
                    The correct answer is: <span className="text-correct font-bold">{choices[correctIndex]}</span>
                  </p>
                )}
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={handleContinue}
                className="w-full"
              >
                Continue
              </Button>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

