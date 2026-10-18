import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Brain,
  ShieldCheck,
  Zap,
  Target,
  BarChart,
  RotateCcw,
} from 'lucide-react';
import { Topic, Difficulty } from '../types';
import { api } from '../services/api';
import { TopicCard } from '../components/TopicCard';
import { DifficultyModal } from '../components/DifficultyModal';

export const HomePage: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getTopics()
      .then((data) => setTopics(data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handlePracticeClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsDiffModalOpen(true);
  };

  const handleDifficultySelected = (diff: Difficulty) => {
    setIsDiffModalOpen(false);
    if (selectedTopic) {
      navigate(`/practice?topicId=${selectedTopic.id}&difficulty=${diff}`);
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
        {/* Soft background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-100/40 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-bold mb-6">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span>Practical Mathematics for Everyday Life</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Get better at <span className="text-emerald-600">maths.</span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Master the maths you use every day. Learn clever calculation techniques, solve real-world problems, and build confidence with every question.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/practice?topicId=shopping-discounts&difficulty=MEDIUM"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 hover:scale-[1.02] transition-all"
            >
              <span>Start Practicing</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/topics"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-700 hover:text-slate-900 font-bold text-sm transition-all"
            >
              <span>Explore Topics</span>
            </Link>
          </div>

          {/* Value Highlights */}
          <div className="mt-12 pt-8 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-extrabold text-slate-900">11</div>
              <div className="text-xs font-semibold text-slate-500">Everyday Categories</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-emerald-600">100%</div>
              <div className="text-xs font-semibold text-slate-500">Deterministic Logic</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">0 sec</div>
              <div className="text-xs font-semibold text-slate-500">Sign-up Required to Start</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-emerald-600">Live</div>
              <div className="text-xs font-semibold text-slate-500">Step-by-step Feedback</div>
            </div>
          </div>
        </div>
      </section>

      {/* THE 4-STEP LEARNING LOOP */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            How Quick Maths Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            The Everyday Maths Learning Loop
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Not just answer-checking. We give you mental models and shortcuts so you can calculate independently in real life.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm mb-4">
              1
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1">Learn</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Understand formulas with bite-sized explanations, worked examples, and mental math calculation tricks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative">
            <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-sm mb-4">
              2
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1">Practice</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Solve dynamically generated questions based on real scenarios with selectable difficulty levels.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm mb-4">
              3
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1">Receive Feedback</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Get immediate validation, hints, step-by-step solutions, and tips on avoiding common mistakes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mb-4">
              4
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1">Improve & Return</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track your accuracy, average solving speed, and daily streaks to build permanent quantitative confidence.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED TOPICS PREVIEW */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Everyday Categories
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Explore What You Can Master
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              From shopping discounts and splitting bills to loans, cooking, and tax estimates.
            </p>
          </div>
          <Link
            to="/topics"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <span>View All 11 Topics</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.slice(0, 6).map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                onPracticeClick={handlePracticeClick}
              />
            ))}
          </div>
        )}
      </section>

      {/* REAL-WORLD MENTAL MATH SPOTLIGHT */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 overflow-hidden relative shadow-xl">
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Mental Calculation Spotlight
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold mt-2">
                Why reach for a calculator when you can do it in 2 seconds?
              </h2>
              <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                Take a 25% discount on ₹2,400. Most people struggle entering percentages on their phone.
                With Quick Maths, you learn: 25% is just one-quarter. Halve ₹2,400 twice: ₹1,200 → ₹600.
                Subtract ₹600 from ₹2,400 = <strong>₹1,800 final price</strong>!
              </p>

              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  to="/practice?topicId=shopping-discounts&difficulty=MEDIUM"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md transition-all"
                >
                  <Zap className="h-4 w-4" />
                  <span>Try Discounts Practice</span>
                </Link>
                <Link
                  to="/topic/shopping-discounts"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Read Lesson</span>
                </Link>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl font-mono text-xs space-y-3">
              <div className="text-slate-400">// Mental Math Shortcut</div>
              <div className="text-emerald-400 font-bold text-sm">
                Problem: 25% off ₹2,400
              </div>
              <div className="text-slate-300">
                Step 1: 25% = 1/4th (Halve twice)
              </div>
              <div className="text-slate-300">
                Step 2: 2,400 ÷ 2 = 1,200 | 1,200 ÷ 2 = 600
              </div>
              <div className="text-slate-300">
                Step 3: 2,400 - 600 = ₹1,800
              </div>
              <div className="pt-2 border-t border-slate-700 text-emerald-300 font-bold">
                ✓ Solved in 2.1 seconds without calculator!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Difficulty Selection Modal */}
      <DifficultyModal
        isOpen={isDiffModalOpen}
        topicTitle={selectedTopic?.title || 'Selected Topic'}
        onSelectDifficulty={handleDifficultySelected}
        onClose={() => setIsDiffModalOpen(false)}
      />
    </div>
  );
};
