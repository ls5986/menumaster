# 🚀 Quick Start Guide

## Get Running in 60 Seconds

```bash
cd mastros-menu-app
npm install
npm run dev
```

Open `http://localhost:5173` in your browser!

## First Steps

1. **Click "Quick Fire"** - Start studying immediately
2. **Answer 10 questions** - Type your answers
3. **Watch your XP grow** - Earn points and level up
4. **Build a streak** - 3+ correct = bonus XP
5. **Come back tomorrow** - Maintain your daily streak! 🔥

## What's Built (MVP - Phase 1)

### ✅ Core Features
- [x] Quick Fire study mode (10 questions per round)
- [x] Answer validation with fuzzy matching
- [x] XP & level system with progress bars
- [x] Streak tracking (session + daily)
- [x] Celebration animations & feedback
- [x] Dark/light mode toggle
- [x] Settings panel
- [x] Home dashboard with stats
- [x] LocalStorage persistence (all progress saved)
- [x] Category filtering
- [x] Achievement system (15 achievements defined)
- [x] Spaced repetition algorithm
- [x] Item progress tracking (new → learning → confident → mastered)

### 📊 Data
- **48 testable menu items** loaded from JSON
- **5 categories**: Sushi Selections, Sushi Ingredients, Sushi Sauces, Soups & Salads, Dressings
- **Active/Inactive status** (5 items marked inactive per your request)

### 🎨 UI/UX
- Modern, clean interface
- Smooth animations (Framer Motion)
- Responsive layout
- Mastro's color theme (gold, reds, blacks)
- Keyboard-friendly
- Auto-advance option
- Hint system

### 🧠 ADHD-Friendly
- Micro-learning (2-5 min sessions)
- Instant feedback
- Visual progress tracking
- Gamification (XP, levels, achievements)
- Low-pressure practice mode
- Celebration animations

## App Structure

```
Home
├── Study Modes
│   └── Quick Fire ✅ (MVP)
│   └── Flashcards (Coming Soon)
│   └── Fill-in-Blank (Coming Soon)
│   └── Multiple Choice (Coming Soon)
│   └── Practice Test (Coming Soon)
│   └── Speedrun (Coming Soon)
├── Settings ✅
└── Stats (Coming Soon)
```

## Key Files

- `src/components/study/QuickFire.tsx` - Core study mode
- `src/store/useStore.ts` - State management (Zustand)
- `src/utils/answerValidation.ts` - Fuzzy answer matching
- `src/utils/xpCalculator.ts` - XP & level calculations
- `src/utils/spacedRepetition.ts` - Smart question selection
- `src/data/testable_menu_items.json` - Menu data
- `src/data/achievements.ts` - Achievement definitions

## Technologies Used

- **React 18** + TypeScript
- **Vite** (build tool)
- **Tailwind CSS v4** (styling)
- **Zustand** (state management)
- **Framer Motion** (animations)
- **date-fns** (date handling)
- **Lucide React** (icons)
- **react-hot-toast** (notifications)

## Build & Deploy

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production
npm run preview
```

Build output goes to `dist/` directory - ready to deploy to any static host (Vercel, Netlify, etc.)

## Data Persistence

All data is saved in browser localStorage:
- User profile (level, XP, achievements, settings)
- Item progress per component
- Study history
- Practice test results
- Daily streak tracking

**Tip**: Export/import feature coming in Phase 2!

## Customization

### Add New Menu Items
Edit `src/data/testable_menu_items.json`:
```json
{
  "testable_items": [
    {
      "item_id": "new_item",
      "name": "New Menu Item",
      "category": "Category Name",
      "status": "active",
      "testable_components": [
        {
          "field": "description",
          "answer": "Correct Answer",
          "context": "Question text with ___",
          "alternatives": ["alt1", "alt2"]
        }
      ]
    }
  ]
}
```

### Change Theme Colors
Edit `src/index.css` in the `@theme` section:
```css
@theme {
  --color-bg-primary: #0f0f0f;
  --color-accent-gold: #d4af37;
  /* ... more colors */
}
```

### Adjust XP Rewards
Edit `src/utils/xpCalculator.ts`:
```typescript
export function calculateXpReward(...) {
  let xp = 10; // Base XP - change this!
  // ...
}
```

## Tips

1. **Study Daily**: Maintain your streak for bonus achievements
2. **Use Categories**: Master one section at a time
3. **Review Mistakes**: Pay attention to feedback
4. **Enable Auto-Advance**: Speeds up flow when you're confident
5. **Dark Mode**: Default for less eye strain

## Troubleshooting

**Build warnings about Node.js version?**
- App works fine on Node 18, but 20+ is recommended for Vite
- Ignore the warning or upgrade Node

**Lost progress?**
- Check if you're in incognito mode (doesn't save to localStorage)
- Don't clear browser data
- Export feature coming soon!

**App not loading data?**
- Check browser console for errors
- Ensure JSON files are in `src/data/` directory

## Next Steps (Phase 2)

1. Add remaining study modes
2. Build detailed analytics dashboard
3. Implement practice test mode
4. Add mnemonic suggestions
5. Export/import progress
6. Study reminders

---

**Need help?** Check the full README.md for detailed documentation.

**Ready to study?** Run `npm run dev` and become a Menu Master! 🍴✨

