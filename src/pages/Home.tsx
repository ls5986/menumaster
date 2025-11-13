import { Zap, BookOpen, Edit3, Trophy, Users } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useStore } from '../store/useStore';
import { useMenuData } from '../hooks/useMenuData';
import { ACHIEVEMENTS } from '../data/achievements';

interface HomeProps {
  onStartStudy: (mode: string, category?: string) => void;
}

export function Home({ onStartStudy }: HomeProps) {
  const { user, itemsProgress } = useStore();
  const { totalQuestions, categories } = useMenuData();

  // Calculate overall mastery
  const masteredCount = Object.values(itemsProgress).filter(
    (progress) => progress.status === 'mastered'
  ).length;
  const overallMastery = totalQuestions > 0 ? (masteredCount / totalQuestions) * 100 : 0;

  // Get recent achievements
  const recentAchievements = ACHIEVEMENTS.filter((achievement) =>
    user.achievements.includes(achievement.id)
  ).slice(-3);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-bold mb-2">
          Welcome back! 👋
        </h1>
        <p className="text-sm sm:text-base text-text-secondary">
          Ready to master the Mastro's menu?
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-xs sm:text-sm">Level</p>
              <p className="text-2xl sm:text-3xl font-bold text-accent-gold">{user.level}</p>
            </div>
            <Trophy className="text-accent-gold" size={24} />
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-xs sm:text-sm">Streak</p>
              <p className="text-2xl sm:text-3xl font-bold text-accent-red">{user.streakDays} 🔥</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-xs sm:text-sm">Questions</p>
              <p className="text-2xl sm:text-3xl font-bold text-info">{user.totalQuestionsAnswered}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-xs sm:text-sm">Achievements</p>
              <p className="text-2xl sm:text-3xl font-bold text-correct">{user.achievements.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Overall Progress</h2>
          <Badge variant="info">{masteredCount}/{totalQuestions} mastered</Badge>
        </div>
        <ProgressBar progress={overallMastery} showLabel color="green" />
      </Card>

      {/* Study Modes */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Study Modes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card hover onClick={() => onStartStudy('customer-questions')} className="p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-info/20 rounded-lg">
                <Users className="text-info" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base sm:text-lg mb-1">Customer Questions</h3>
                <p className="text-text-secondary text-xs sm:text-sm mb-2">
                  Real scenarios. "How big is the soup?"
                </p>
                <Badge variant="success" size="sm">Most Realistic</Badge>
              </div>
            </div>
          </Card>

          <Card hover onClick={() => onStartStudy('quick-fire')} className="p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-accent-gold/20 rounded-lg">
                <Zap className="text-accent-gold" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base sm:text-lg mb-1">Quick Fire</h3>
                <p className="text-text-secondary text-xs sm:text-sm mb-2">
                  All menu knowledge. Type answers!
                </p>
                <Badge variant="warning" size="sm">All Questions</Badge>
              </div>
            </div>
          </Card>

          <Card hover onClick={() => onStartStudy('flashcard')} className="p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-info/20 rounded-lg">
                <BookOpen className="text-info" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base sm:text-lg mb-1">Flashcards</h3>
                <p className="text-text-secondary text-xs sm:text-sm mb-2">
                  Classic study. Flip to reveal.
                </p>
                <Badge variant="success" size="sm">All Items</Badge>
              </div>
            </div>
          </Card>

          <Card hover onClick={() => onStartStudy('fill-blank')} className="p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-correct/20 rounded-lg">
                <Edit3 className="text-correct" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base sm:text-lg mb-1">Test Mode</h3>
                <p className="text-text-secondary text-xs sm:text-sm mb-2">
                  Fill-in-the-blank. Like the real test!
                </p>
                <Badge variant="warning" size="sm">Primary Tool</Badge>
              </div>
            </div>
          </Card>


          <Card className="bg-bg-tertiary/50 border-dashed p-3 sm:p-4">
            <div className="text-center py-3 sm:py-4">
              <p className="text-accent-gold font-bold text-sm sm:text-base mb-2">🎉 All Modes Complete!</p>
              <p className="text-text-secondary text-xs sm:text-sm">Choose any mode above to start studying</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Category Quick Start */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Study by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {categories.map((category) => (
            <Button
              key={category}
              variant="secondary"
              onClick={() => onStartStudy('quick-fire', category)}
              className="h-auto py-3 sm:py-4 flex-col text-xs sm:text-sm"
            >
              <span className="text-xl sm:text-2xl mb-1">
                {category.toLowerCase().includes('sushi') ? '🍣' :
                 category.toLowerCase().includes('soup') || category.toLowerCase().includes('salad') ? '🥗' :
                 category.toLowerCase().includes('dressing') || category.toLowerCase().includes('sauce') ? '🧂' : '🍴'}
              </span>
              <span className="font-medium">{category}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Recent Achievements</h2>
          <div className="space-y-3">
            {recentAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-3 p-3 bg-bg-tertiary rounded-lg"
              >
                <span className="text-3xl">{achievement.icon}</span>
                <div className="flex-1">
                  <h4 className="font-bold">{achievement.name}</h4>
                  <p className="text-text-secondary text-sm">{achievement.description}</p>
                </div>
                <Badge variant="success">Unlocked</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

