# Quick Maths — Get Better at Maths

> **Product Requirements**: PRD v1.0  
> **Tagline**: *Get better at maths.*  
> **Platform**: Everyday mathematics learning and practice web application designed for college students, Gen Z, and lifelong learners.

---

## 🚀 Overview

**Quick Maths** helps users understand and practice practical mathematics used in everyday life—such as calculating shopping discounts, splitting restaurant checks, 50/30/20 budgeting, loan interest, cooking recipe scaling, vehicle fuel mileage, and basic salary deductions.

The core learning loop is:
```
LEARN → PRACTICE → RECEIVE FEEDBACK → IMPROVE → RETURN
```

### Key Pillars
1. **Deterministic Mathematical Correctness**:
   - Zero runtime AI authority for calculations.
   - Questions generated deterministically with tested TypeScript arithmetic functions.
   - Exact mathematical rounding, unit preservation, and step-by-step explanations.
2. **11 Core Everyday Categories**:
   1. Budgeting & Expense Tracking
   2. Shopping & Discounts
   3. Tipping & Splitting Bills
   4. Cooking & Recipe Scaling
   5. Loans, EMI & Interest
   6. Travel & Commute Estimation
   7. Time & Schedule Management
   8. Fitness & Health Calculations
   9. Home Repair & Interior Work
   10. Salary & Tax Planning
   11. Ratios & Proportions
3. **Guest & Registered Modes**:
   - Guests can immediately explore all topics, read lessons, and practice questions without signing up.
   - Local progress is cached and safely migrated when a guest creates an account.
   - Registered users get persistent cross-device synchronisation, streaks, and analytics.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 with custom design tokens (Emerald primary accents, slate typography)
- **Routing**: React Router v7 / v6
- **Visualizations**: Recharts for accuracy and consistency analytics
- **Icons**: Lucide React
- **Celebration Effects**: Canvas Confetti

### Backend & Database
- **Runtime**: Node.js + Express + TypeScript
- **Database**: MySQL 8 / MariaDB (running on `localhost:3306`)
- **ORM**: Prisma ORM with versioned schema and migrations
- **Authentication**: Secure server-managed sessions with HTTP-only cookies and bcryptjs password hashing
- **Testing**: Vitest + Supertest

---

## 📂 Project Structure

```
Quick Maths/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # Relational schema for MySQL
│   │   └── seed.ts               # Seeds all 11 topics, subtopics, and lessons
│   ├── src/
│   │   ├── database/
│   │   │   └── db.ts             # Prisma client singleton
│   │   ├── domain/
│   │   │   └── maths/
│   │   │       ├── engine.ts     # Deterministic question generator & answer validator
│   │   │       └── engine.test.ts # Vitest unit tests for all 11 topics
│   │   ├── middleware/
│   │   │   └── auth.ts           # Session authentication & authorization
│   │   ├── routes/
│   │   │   ├── authRoutes.ts     # Register, Login, Logout, /me, Guest migration
│   │   │   ├── topicRoutes.ts    # Topics and lesson retrieval
│   │   │   ├── practiceRoutes.ts # Question generator & answer evaluation
│   │   │   ├── progressRoutes.ts # Progress dashboard, streaks, accuracy
│   │   │   └── api.test.ts       # Supertest integration tests
│   │   └── index.ts              # Express application setup
│   ├── .env                      # Local backend configuration
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx        # Top navigation with guest indicator & mobile drawer
│   │   │   ├── Footer.tsx        # Footer with educational disclaimer
│   │   │   ├── TopicCard.tsx     # Rich interactive topic cards
│   │   │   ├── DifficultyModal.tsx # Easy, Medium, Hard, Default difficulty picker
│   │   │   └── AuthModal.tsx     # Sign In / Register modal with guest migration notice
│   │   ├── context/
│   │   │   └── AuthContext.tsx   # React authentication state and sync
│   │   ├── pages/
│   │   │   ├── HomePage.tsx      # Landing page with hero, 4-step loop & spotlight
│   │   │   ├── TopicsPage.tsx    # Explore Topics page with search and 11 categories
│   │   │   ├── TopicDetailPage.tsx # Topic overview with Learn/Practice actions
│   │   │   ├── LearnPage.tsx     # Lessons, formulas, shortcuts & quick knowledge checks
│   │   │   ├── PracticePage.tsx  # Dynamic question flow, hints, feedback, session summary
│   │   │   ├── ProgressPage.tsx  # Recharts dashboard, streaks, empty states
│   │   │   └── ProfilePage.tsx   # Account details and settings
│   │   ├── services/
│   │   │   └── api.ts            # API client with guest localStorage support
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript interfaces
│   │   ├── App.tsx               # Main routing tree
│   │   └── index.css             # Tailwind CSS tokens
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts            # Vite config with API proxy
│
├── Docs/
│   ├── Quick_Maths_PRD_v1.pdf    # Source Product Requirements Document
│   └── prompts/v1.md             # Engineering requirements prompt
├── .env.example
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **MySQL** running locally (e.g. via XAMPP or native service on `localhost:3306`)

### 2. Database Setup (MySQL)
Create the database in MySQL:
```sql
CREATE DATABASE IF NOT EXISTS quick_maths;
```

Configure `backend/.env`:
```env
DATABASE_URL="mysql://root:@localhost:3306/quick_maths"
PORT=5000
CLIENT_URL="http://localhost:5173"
SESSION_SECRET="quick-maths-super-secure-session-secret"
NODE_ENV="development"
```

### 3. Generate Prisma Client & Seed Database
From the `backend/` directory:
```powershell
cd backend
npm install
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
```
*This populates MySQL with all 11 PRD topic categories, subtopics, formulas, and worked lessons.*

### 4. Run Automated Tests
```powershell
npm test
```
*Runs all 12 Vitest tests verifying deterministic mathematical calculations and REST API endpoints.*

### 5. Start the Application

**Start the Backend API Server:**
```powershell
cd backend
npm run dev
# Starts API server on http://localhost:5000
```

**Start the Frontend Development Server:**
```powershell
cd frontend
npm install
npm run dev
# Starts Vite application on http://localhost:5173
```

Visit **`http://localhost:5173`** in your browser.

---

## 🧪 Testing Verification Summary

- **Unit Tests (`engine.test.ts`)**: 8 tests covering single/successive discounts, 50/30/20 budgeting, ratio parts, simple interest, zero-interest EMI, and decimal tolerance.
- **API Tests (`api.test.ts`)**: 4 tests covering health check, topic listing, answer masking, and deterministic validation.
- **Production Build**: `npm run build` succeeds cleanly for both frontend and backend.

---

## 📜 Educational Disclaimer
Quick Maths teaches quantitative methods and practical calculation reasoning. Numerical exercises for taxes, loans, EMI, nutrition, or home repairs are educational approximations and do not constitute certified financial, legal, or medical advice.
