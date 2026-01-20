# 🏔️ Snow Weight Tracker

A weight tracking app for a group of friends preparing for a snowboarding trip to Chile on **August 1, 2026**.

Track your weight loss progress, compete on the leaderboard, and get ready to hit the slopes! 🏂

## ✨ Features

- **Live Countdown** - See exactly how much time is left until the trip
- **Weight Tracking** - Log your weight with timestamps and notes
- **Leaderboard** - Compete with friends based on weight loss percentage
- **Real-time Updates** - All changes sync instantly via Supabase
- **Dark Mode** - Toggle between light and dark themes
- **Responsive Design** - Works on desktop and mobile
- **Snowfall Animation** - Fun snow effects with floating snowboarder 🎿

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL + Realtime)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **Linting**: [Biome](https://biomejs.dev/)
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account

### 1. Clone the repository

```bash
git clone https://github.com/your-username/snow-weight-tracker.git
cd snow-weight-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up Supabase

Run the migrations to set up your database:

```bash
npx supabase db push
```

Or manually run the SQL files in `supabase/migrations/` in order.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page with leaderboard
│   ├── participants/      # Participant pages
│   │   ├── page.tsx       # List all participants
│   │   ├── new/           # Register new participant
│   │   └── [id]/          # Individual participant profile
│   └── globals.css        # Global styles & animations
├── components/
│   ├── ui/                # Reusable UI components
│   ├── participants/      # Participant-related components
│   ├── stats/             # Statistics & leaderboard
│   └── weight/            # Weight record components
├── hooks/                 # Custom React hooks
├── lib/supabase/          # Supabase client configuration
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## 📜 Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run Biome linter
npm run lint:fix   # Fix linting issues
npm run format     # Format code with Biome
npm run check      # Run all Biome checks
```

## 🎯 Goal

**Objective**: Travel to Chile on August 1, 2026 for a snowboarding trip with friends.

The goal is to:
- Snowboard as many days as possible
- Be in great shape to enjoy the mountains
- Have an amazing time with friends! 🇨🇱

## 📝 License

This project is for personal use among friends.

---

Made with ❄️ for the Chile 2026 snowboard trip!
