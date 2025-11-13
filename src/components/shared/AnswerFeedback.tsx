import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface AnswerFeedbackProps {
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  xpGained?: number;
  streak?: number;
  feedback?: string;
  onContinue: () => void;
  autoAdvance?: boolean;
}

export function AnswerFeedback({
  isCorrect,
  userAnswer,
  correctAnswer,
  xpGained = 0,
  streak = 0,
  feedback,
  onContinue,
  autoAdvance = true
}: AnswerFeedbackProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onContinue}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className={`max-w-md w-full rounded-2xl p-8 ${
          isCorrect ? 'bg-correct/10 border-2 border-correct' : 'bg-incorrect/10 border-2 border-incorrect'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon & Title */}
        <div className="text-center mb-6">
          {isCorrect ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                className="inline-block"
              >
                <CheckCircle2 size={64} className="text-correct mx-auto" />
              </motion.div>
              <h2 className="text-3xl font-bold text-correct mt-4">Correct!</h2>
              {xpGained > 0 && (
                <p className="text-accent-gold text-xl mt-2">+{xpGained} XP</p>
              )}
            </>
          ) : (
            <>
              <XCircle size={64} className="text-incorrect mx-auto" />
              <h2 className="text-3xl font-bold text-incorrect mt-4">Not Quite</h2>
            </>
          )}
        </div>

        {/* Answer comparison */}
        <div className="space-y-3 mb-6">
          {!isCorrect && userAnswer && (
            <div className="bg-bg-secondary p-3 rounded-lg">
              <p className="text-text-secondary text-sm">You answered:</p>
              <p className="text-text-primary font-medium">{userAnswer}</p>
            </div>
          )}
          
          <div className="bg-bg-secondary p-3 rounded-lg">
            <p className="text-text-secondary text-sm">Correct answer:</p>
            <p className="text-accent-gold font-medium">{correctAnswer}</p>
          </div>
        </div>

        {/* Streak indicator */}
        {isCorrect && streak >= 3 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-center gap-2 mb-6 bg-accent-red/20 rounded-lg p-3"
          >
            <span className="text-2xl">🔥</span>
            <div>
              <p className="font-bold text-accent-red">Streak: {streak}</p>
              {streak >= 3 && streak < 5 && <p className="text-xs text-text-secondary">Keep going!</p>}
              {streak >= 5 && <p className="text-xs text-text-secondary">You're on fire!</p>}
            </div>
          </motion.div>
        )}

        {/* Feedback message */}
        {feedback && (
          <div className="bg-bg-tertiary p-3 rounded-lg mb-6">
            <p className="text-sm text-text-secondary">{feedback}</p>
          </div>
        )}

        {/* Continue button */}
        <Button
          variant="primary"
          size="lg"
          onClick={onContinue}
          className="w-full"
        >
          Continue {autoAdvance && '(2s)'}
        </Button>
      </motion.div>
    </motion.div>
  );
}

