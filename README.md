# 🍴 Mastro's Menu Master

An engaging, gamified study application for learning Mastro's Steakhouse menu items. Built with React, TypeScript, and Tailwind CSS, this app is specifically designed to be ADHD-friendly with micro-learning, instant feedback, and dopamine-driven progression.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript)

## ✨ Features

### 🧠 Learning Philosophy
- **Micro-learning chunks**: Study in 2-5 minute bursts
- **Instant gratification**: Immediate feedback with XP rewards
- **Gamification**: Levels, achievements, streaks
- **Spaced repetition**: Smart question selection
- **Active recall testing**: Fill-in-the-blank style
- **Visual engagement**: Smooth animations and progress tracking

### 🎮 Study Modes

1. **Quick Fire Mode** (MVP) ⚡
   - Fast-paced Q&A session
   - 10 questions per round
   - Instant feedback with XP rewards
   - Streak tracking and bonuses
   - Optional hints
   - Perfect for quick study breaks!

2. **Flashcard Mode** 📚 (Coming Soon)
   - Classic flashcard study
   - Flip to reveal answers
   - Self-grading

3. **Fill in the Blank** ✏️ (Coming Soon)
   - Complete missing words in descriptions
   - Fuzzy matching validation

4. **Multiple Choice** 🎲 (Coming Soon)
   - Choose correct answer from options
   - Good for recognition practice

5. **Practice Test** 📝 (Coming Soon)
   - 50 random questions
   - No feedback until end
   - Detailed results and recommendations

### 🏆 Gamification System

- **XP & Levels**: Earn points for correct answers, level up
- **Achievements**: Unlock badges for milestones
- **Daily Streaks**: Don't break the chain! 🔥
- **Progress Tracking**: Per-item mastery status
- **Celebrations**: Confetti for streaks, animations for success

### 🎨 UI/UX Features

- **Dark mode by default** (eye-friendly, ADHD-focused)
- **Light mode available**
- **Mastro's-inspired colors** (gold, reds, elegant blacks)
- **Smooth animations** using Framer Motion
- **Responsive design** (desktop-first)
- **Accessible** with keyboard shortcuts

## 🚀 Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+ (recommended)
- npm or pnpm

### Installation

```bash
# Clone the repository
cd mastros-menu-app

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
mastros-menu-app/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── layout/          # Layout components
│   │   ├── study/           # Study mode components
│   │   ├── dashboard/       # Dashboard components
│   │   └── shared/          # Shared components
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   ├── data/                # Menu data and achievements
│   ├── types/               # TypeScript type definitions
│   ├── store/               # Zustand state management
│   ├── pages/               # Page components
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── public/                  # Static assets
└── tailwind.config.js       # Tailwind configuration
```

## 🎯 How to Use

### Study Sessions

1. **Start from Home**: Choose a study mode or category
2. **Answer Questions**: Type your answer or use hints
3. **Get Feedback**: Instant validation with correct answer
4. **Build Streaks**: 3+ correct in a row = bonus XP
5. **Level Up**: Earn XP to unlock achievements

### Tips for Effective Learning

- **Start with Quick Fire**: Best for ADHD-friendly micro-sessions
- **Use Hints Sparingly**: Challenge yourself first
- **Focus on Categories**: Master one category at a time
- **Maintain Streaks**: Study daily to keep your streak alive
- **Review Wrong Answers**: Pay attention to feedback

## 🛠️ Technical Stack

### Core Technologies
- **React 18**: UI framework
- **TypeScript 5**: Type safety
- **Vite**: Fast build tool
- **Tailwind CSS v4**: Styling

### State & Storage
- **Zustand**: Lightweight state management
- **localStorage**: Data persistence (with `persist` middleware)

### Libraries
- **Framer Motion**: Smooth animations
- **date-fns**: Date manipulation for streaks
- **Lucide React**: Beautiful icons
- **react-hot-toast**: Toast notifications
- **react-confetti**: Celebration effects

### Data Structure

The app uses two main data sources:
1. `testable_menu_items.json`: 48 menu items with testable components
2. `menu_parsed.json`: Full menu with complete ingredient lists

## 📊 Data Persistence

All progress is saved locally in your browser:
- User profile (level, XP, achievements)
- Item progress (per-component tracking)
- Study history
- Settings preferences
- Practice test results

**Note**: Clearing browser data will reset progress.

## 🎓 Learning Algorithm

### Spaced Repetition
Items are categorized by difficulty:
- **New**: Never seen before
- **Learning**: 1+ attempts, <70% accuracy
- **Confident**: 2+ attempts, 70-90% accuracy
- **Mastered**: 3+ attempts, 90%+ accuracy

Questions are weighted to show:
- New items: 30% chance
- Learning: 40% chance
- Confident: 20% chance
- Mastered: 10% chance

### XP System
- Base: **10 XP** per correct answer
- Streak bonus: **+5 XP** at 3+ streak
- Speed bonus: **+2 XP** under 5 seconds
- Session complete: **+50 XP**

## ⚙️ Settings

Customize your experience:
- **Dark/Light Mode**: Toggle theme
- **Sound Effects**: Enable/disable audio feedback
- **Auto Advance**: Automatically continue after correct answers
- **Timer**: Show countdown per question
- **Hint Level**: Control hint availability

## 🏅 Achievements

Unlock badges by completing milestones:
- 🎯 First Blood - Answer first question correctly
- 🔥 Hot Streak - Get 5 correct in a row
- ⚡ Speed Demon - Answer in under 5 seconds
- 🍣 Sushi Master - 100% mastery in Sushi
- 📚 Menu Master - 100% mastery all items
- 🗓️ Week Warrior - 7 day streak
- And more!

## 🐛 Known Issues

- Node.js version warning (app works fine on v18, but v20+ recommended)
- Additional study modes (Flashcard, Fill-blank, Multiple Choice) coming soon

## 🗺️ Roadmap

### Phase 2 Features
- [ ] Flashcard mode
- [ ] Fill-in-the-blank mode
- [ ] Multiple choice mode
- [ ] Category challenge mode
- [ ] Speedrun mode with leaderboard

### Phase 3 Features
- [ ] Practice test mode (50 questions)
- [ ] Detailed analytics dashboard
- [ ] Export/import progress
- [ ] Study reminders
- [ ] Mnemonic suggestions
- [ ] Personal best records

## 📝 Data Files

### testable_menu_items.json
Contains 48 menu items from:
- Sushi Selections (10 items)
- Sushi Ingredients (2 items)
- Sushi Sauces (7 items)
- Soups & Salads (9 items)
- Dressings (10 items)

Each item includes:
- Item name
- Category
- Testable components with answers and alternatives
- Status (active/inactive)

### menu_parsed.json
Complete menu data with full ingredient lists for reference.

## 🤝 Contributing

This is a custom-built training app for Mastro's Steakhouse. To add new menu items:

1. Update `testable_menu_items.json` with new items
2. Follow the existing data structure
3. Rebuild and test

## 📄 License

Private educational tool for Mastro's Steakhouse training.

## 🙏 Acknowledgments

- Inspired by proven memorization techniques (spaced repetition, active recall)
- Designed with ADHD-friendly principles
- Built with modern web technologies for speed and engagement

---

**Happy Learning! 📚✨**

Start your journey to becoming a Mastro's Menu Master today!
