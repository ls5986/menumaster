import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { QuickFire } from './components/study/QuickFire';
import { Flashcard } from './components/study/Flashcard';
import { TestMode } from './components/study/TestMode';
import { MultipleChoice } from './components/study/MultipleChoice';
import { CustomerQuestions } from './components/study/CustomerQuestions';
import { useStore } from './store/useStore';

type Page = 'home' | 'study' | 'stats' | 'settings';
type StudyMode = 'quick-fire' | 'flashcard' | 'fill-blank' | 'multiple-choice' | 'customer-questions' | 'practice-test' | 'speedrun';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [studyMode, setStudyMode] = useState<StudyMode>('quick-fire');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const { user, updateSettings } = useStore();

  // Initialize dark mode
  useEffect(() => {
    if (user.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user.settings.darkMode]);

  const handleStartStudy = (mode: string, category?: string) => {
    setStudyMode(mode as StudyMode);
    setCategoryFilter(category);
    setCurrentPage('study');
  };

  const handleCompleteStudy = () => {
    setCurrentPage('home');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onStartStudy={handleStartStudy} />;
      
      case 'study':
        switch (studyMode) {
          case 'quick-fire':
            return (
              <QuickFire
                categoryFilter={categoryFilter}
                onComplete={handleCompleteStudy}
              />
            );
          case 'flashcard':
            return (
              <Flashcard
                categoryFilter={categoryFilter}
                onComplete={handleCompleteStudy}
              />
            );
          case 'fill-blank':
            return (
              <TestMode
                categoryFilter={categoryFilter}
                onComplete={handleCompleteStudy}
              />
            );
          case 'multiple-choice':
            return (
              <MultipleChoice
                categoryFilter={categoryFilter}
                onComplete={handleCompleteStudy}
              />
            );
          case 'practice-test':
            return (
              <MultipleChoice
                categoryFilter={categoryFilter}
                onComplete={handleCompleteStudy}
              />
            );
          case 'speedrun':
            return (
              <QuickFire
                categoryFilter={categoryFilter}
                onComplete={handleCompleteStudy}
              />
            );
          case 'customer-questions':
            return (
              <CustomerQuestions
                categoryFilter={categoryFilter}
                onComplete={handleCompleteStudy}
              />
            );
          default:
            return (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Coming Soon!</h2>
                <p className="text-text-secondary mb-6">
                  This study mode is under development.
                </p>
                <button
                  onClick={() => setCurrentPage('home')}
                  className="px-6 py-2 bg-accent-gold text-bg-primary rounded-lg font-semibold"
                >
                  Back to Home
                </button>
              </div>
            );
        }
      
      case 'stats':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Stats & Analytics</h2>
            <p className="text-text-secondary mb-6">
              Detailed analytics coming soon!
            </p>
            <button
              onClick={() => setCurrentPage('home')}
              className="px-6 py-2 bg-accent-gold text-bg-primary rounded-lg font-semibold"
            >
              Back to Home
            </button>
          </div>
        );
      
      case 'settings':
        return (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Settings</h2>
            <div className="space-y-4">
              <div className="bg-bg-secondary p-6 rounded-xl border border-bg-tertiary">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold">Dark Mode</h3>
                    <p className="text-text-secondary text-sm">Toggle dark/light theme</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={user.settings.darkMode}
                      onChange={(e) => {
                        updateSettings({ darkMode: e.target.checked });
                        if (e.target.checked) {
                          document.documentElement.classList.add('dark');
                        } else {
                          document.documentElement.classList.remove('dark');
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-bg-tertiary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-gold"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold">Sound Effects</h3>
                    <p className="text-text-secondary text-sm">Play sounds on correct/incorrect</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={user.settings.soundEffects}
                      onChange={(e) => updateSettings({ soundEffects: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-bg-tertiary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-gold"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold">Auto Advance</h3>
                    <p className="text-text-secondary text-sm">Automatically continue after correct answer</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={user.settings.autoAdvance}
                      onChange={(e) => updateSettings({ autoAdvance: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-bg-tertiary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-gold"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">Timer</h3>
                    <p className="text-text-secondary text-sm">Show countdown timer per question</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={user.settings.timerEnabled}
                      onChange={(e) => updateSettings({ timerEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-bg-tertiary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-gold"></div>
                  </label>
                </div>
              </div>
              
              <button
                onClick={() => setCurrentPage('home')}
                className="w-full px-6 py-3 bg-accent-gold text-bg-primary rounded-lg font-semibold"
              >
                Back to Home
              </button>
            </div>
          </div>
        );
      
      default:
        return <Home onStartStudy={handleStartStudy} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Layout onNavigate={handleNavigate} currentPage={currentPage}>
        {renderPage()}
      </Layout>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#ffffff',
            border: '1px solid #2d2d2d'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff'
            }
          }
        }}
      />
    </div>
  );
}

export default App;
